import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { KafkaProducer } from './kafka/kafka.producer';
import { User, UserDocument } from './model/user.model';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { HashPassword, verifyPassword } from './utils/VerificationPassword';
import {
  sendSecurityAlertEmail,
  sendVerificationEmail,
  sendVerificationOTPEmail,
} from './utils/VerificationEmail';
import { generateOTP } from './utils/OTPGenerate';
import { LoginInput } from './dto/login/LoginInput ';
import { getProfile, LoginResponse } from './dto/login/LoginResponse ';
import { delayTime } from './utils/delay';
import { IpAddressGet } from './api/ipAddressGet';
import { deviceDataCreate } from './api/deviceDataCreate';
import { generateDeviceId } from './utils/generateDeviceId';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<UserDocument>,
    // private readonly kafkaProducer: KafkaProducer
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Create a new user
   * @param createUserInput
   * @returns
   */
  async create(createUserInput: CreateUserInput): Promise<User> {
    try {
      // Check if email already exists
      const existingUser = await this.UserModel.findOne({
        email: createUserInput.email,
      });
      if (existingUser) {
        throw new BadRequestException('Email is already in use');
      }

      // Hash the password with bcrypt
      const hashedPassword = await HashPassword(createUserInput);

      const otp = await generateOTP();

      // Create the user with the hashed password
      const userdata = new this.UserModel({
        ...createUserInput,
        password: hashedPassword, // Use the hashed password
        lastPasswordChanged: new Date(),
      });

      const savedUser = await userdata.save();

      // Send verification email
      sendVerificationEmail(
        savedUser.email,
        createUserInput.password,
        savedUser.firstName,
      );

      // await this.kafkaProducer.sendUserCreatedEvent(savedUser);
      return savedUser;
    } catch (error) {
      throw new InternalServerErrorException(
        `User creation failed: ${error.message}`,
      );
    }
  }

  /**
   * Find all users
   * @returns
   */
  async findAll(): Promise<User[]> {
    return await this.UserModel.find({ isDeleted: false }).exec();
  }

  /**
   * Find one user by ID
   * @param id
   * @returns
   */
  async findOne(id: string): Promise<User> {
    const user = await this.UserModel.findOne({
      _id: id,
      isDeleted: false,
    }).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * Update a user by ID
   * @param id
   * @param updateUserInput
   * @returns
   */
  async update(id: string, updateUserInput: UpdateUserInput): Promise<User> {
    // Check if ID is a valid ObjectID
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ObjectId format');
    }

    // Check if user exists
    const existingUser = await this.UserModel.findById(id).exec();
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Prevent update if user is not verified
    if (!existingUser.isVerified) {
      throw new ForbiddenException('User is not verified. Update not allowed.');
    }

    // Check if email already exists
    if (updateUserInput.role && !Types.ObjectId.isValid(updateUserInput.role)) {
      throw new BadRequestException('Invalid role ID format');
    }

    // Check if school exists
    if (
      updateUserInput.school &&
      !Types.ObjectId.isValid(updateUserInput.school)
    ) {
      throw new BadRequestException('Invalid school ID format');
    }

    const updatedUser = await this.UserModel.findByIdAndUpdate(
      id,
      updateUserInput,
      { new: true },
    ).exec();
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    // await this.kafkaProducer.sendUserUpdatedEvent(updatedUser);
    return updatedUser;
  }

  /**
   * Soft delete a user by ID
   * @param id
   * @returns
   */
  async softDelete(id: string): Promise<User> {
    const user = await this.UserModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true },
    ).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    // await this.kafkaProducer.sendUserDeletedEvent(user);
    return user;
  }

  /**
   * Login with email and password (with OTP verification and JWT)
   * @param loginInput - Email and password
   * @param request - HTTP request object
   * @returns LoginResponse with access and refresh tokens
   */
  async login(
    loginInput: LoginInput,
    @Req() request: Request,
  ): Promise<LoginResponse> {
    const { email, password } = loginInput;

    // Fetch the user by email
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      await delayTime(5000); // 5 seconds delay
      throw new BadRequestException('Invalid Email!');
    }

    // Compare the entered password with the stored hashed password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      await delayTime(5000); // 5 seconds delay
      throw new BadRequestException('Invalid Password!');
    }

    // Fetch userAgent from request
    const userAgent = request.headers['user-agent'] || 'Unknown';

    // Fetch IP Address
    const ipData = await IpAddressGet();
    const ipAddress = ipData.ip;
    const location = `${ipData.city}, ${ipData.country}`;

    // Accept Language
    const acceptLanguage =
      request.headers['accept-language'] || 'en-US,en;q=0.9';

    // Generate Device ID
    const deviceId = generateDeviceId(ipAddress, userAgent, acceptLanguage);

    // Check if the user is verified first
    if (!user.isVerified) {
      const now = new Date();

      // Rate Limit Check (Block after 5 requests)
      if (user.otpBlockedUntil && now < user.otpBlockedUntil) {
        throw new BadRequestException(
          `Too many requests. Try again after ${user.otpBlockedUntil}`,
        );
      }

      // Check if OTP was recently sent (cooldown period: 2 minutes)
      if (
        user.otpRequestedAt &&
        now.getTime() - user.otpRequestedAt.getTime() < 2 * 60 * 1000
      ) {
        throw new BadRequestException(
          'OTP already sent. Please wait before requesting a new OTP.',
        );
      }

      // OTP Limit Check (Block if more than 5 requests)
      if ((user.otpRequestCount ?? 0) >= 5) {
        user.otpBlockedUntil = new Date(now.getTime() + 30 * 60 * 1000); // Block for 30 minutes
        user.otpRequestCount = 0; // Reset counter
        await user.save();
        throw new BadRequestException(
          'Too many OTP requests. Please try again later.',
        );
      }

      // Generate and save a new OTP
      const otp = generateOTP();
      user.verificationOTP = otp;
      user.verificationOtpExpires = new Date(now.getTime() + 5 * 60 * 1000); // Expiry in 5 minutes
      user.otpRequestedAt = now;

      // Ensure otpRequestCount is not undefined and increment it
      user.otpRequestCount = user.otpRequestCount ?? 0;
      user.otpRequestCount += 1;

      // Save the user with the updated OTP data
      await user.save();

      // Send the verification email with the OTP
      await sendVerificationOTPEmail(user.email, otp, user.firstName);

      throw new BadRequestException(
        'Your email is not verified. Please check your email for OTP.',
      );
    }

    // If user is verified, proceed with device logic
    // Ensure user.devices array exists
    user.devices = user.devices ?? [];

    // Check if device already exists
    const existingDevice = user.devices.find(
      (d: any) => d.deviceId === deviceId,
    );

    let device;
    if (!existingDevice) {
      // If new device, create a new entry
      device = await deviceDataCreate(deviceId, user._id, userAgent, ipAddress);

      // Save device reference
      user.devices.push({
        deviceId,
        _id: device._id,
        ipAddress,
        userAgent,
        location,
      });

      // Send Security Alert Email only if this is not the first device
      if (user.devices.length > 1) {
        await sendSecurityAlertEmail(
          user.email,
          location,
          ipAddress,
          userAgent,
        );
      }
    }

    // Save user with updated devices
    await user.save();

    // Generate JWT Tokens
    const payload = {
      sub: user.id, // Subject (user ID)
      email: user.email,
      deviceId, // Include device ID in token
      ipAddress, // Include IP address in token
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m', // Short-lived access token (15 minutes)
      secret: process.env.JWT_SECRET || 'Q7k9P2mX4vR8tW5wY3nF6jH0eD9cA9bB', // Use env variable
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d', // Long-lived refresh token (7 days)
      secret:
        process.env.JWT_REFRESH_SECRET || 'Q7k9P2mX4vQ8tL5wY3nF6jHPeD1ZA9bB', // Separate secret for refresh
    });

    // Optionally, save refresh token in the database for revocation purposes
    user.refreshToken = refreshToken; // Assuming refreshToken field exists in User schema
    // Save user with updated devices
    await user.save();
    // Return success response
    return {
      message: 'Login successful.',
      userId: user.id,
      email: user.email,
      success: true,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Verify Email using OTP
   * @param email
   * @param otp
   */
  async verifyEmailWithOTP(
    email: string,
    otp: string,
    @Req() request: Request,
  ): Promise<LoginResponse> {
    try {
      // Fetch the user by email
      const user = await this.UserModel.findOne({ email });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Check if the email is already verified
      if (user.isVerified) {
        throw new BadRequestException('Email already verified');
      }

      // Verify OTP
      if (user.verificationOTP !== otp) {
        throw new BadRequestException('Invalid OTP');
      }

      // Check if OTP expiration date exists and validate if it has expired
      if (
        !user.verificationOtpExpires ||
        user.verificationOtpExpires < new Date()
      ) {
        throw new BadRequestException('OTP expired or invalid');
      }

      // Mark the user as verified
      user.isVerified = true;
      user.verificationOTP = undefined; // Clear OTP after successful verification
      user.verificationOtpExpires = undefined; // Clear OTP expiration date
      user.otpRequestCount = 0; // Reset OTP request count
      user.otpRequestedAt = undefined; // Clear OTP requested timestamp
      // Fetch userAgent from request
      const userAgent = request.headers['user-agent'] || 'Unknown';

      // Fetch IP Address
      const ipData = await IpAddressGet();
      const ipAddress = ipData.ip;
      const location = `${ipData.city}, ${ipData.country}`;

      // Accept Language
      const acceptLanguage =
        request.headers['accept-language'] || 'en-US,en;q=0.9';

      // Generate Device ID
      const deviceId = generateDeviceId(ipAddress, userAgent, acceptLanguage);

      // Ensure user.devices array exists
      user.devices = user.devices ?? [];

      // Check if device already exists (unlikely at this point, but good to check)
      const existingDevice = user.devices.find(
        (d: any) => d.deviceId === deviceId,
      );

      if (!existingDevice) {
        // Create a new device entry
        const device = await deviceDataCreate(
          deviceId,
          user._id,
          userAgent,
          ipAddress,
        );

        // Save device reference
        user.devices.push({
          deviceId,
          _id: device._id,
          ipAddress,
          userAgent,
          location,
        });
      }

      // Save the user with updated data
      await user.save();

      // Return login-like success response
      return {
        message: 'Email verified and login successful.',
        userId: user.id,
        email: user.email,
        success: true,
      };
    } catch (error) {
      // Throw a descriptive error message for failed verification
      throw new BadRequestException(`Verification failed: ${error.message}`);
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const user = await this.UserModel.findOne({ refreshToken });
    if (!user) throw new BadRequestException('Invalid refresh token');

    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    const newAccessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        deviceId: payload.deviceId,
        ipAddress: payload.ipAddress,
      },
      { expiresIn: '15m' },
    );

    return { accessToken: newAccessToken };
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.UserModel.findById(userId).exec();
    if (!user) {
      throw new Error('User not found');
    }
    return user; // পুরো ইউজার অবজেক্ট রিটার্ন করো
  }

  async logout(userId: string): Promise<void> {
    await this.UserModel.updateOne(
      { _id: userId },
      { $unset: { refreshToken: 1 } },
    );
  }
}
