import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KafkaProducer } from './kafka/kafka.producer';
import { User, UserDocument } from './model/user.model';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<UserDocument>,
    // private readonly kafkaProducer: KafkaProducer
  ) {}

  async create(createUserInput: CreateUserInput): Promise<Partial<User>> {
    try {
      const { schoolId, ...otherData } = createUserInput;

      // Create and save the user
      const user = new this.UserModel({ ...otherData, schoolId });
      const savedUser = await user.save();

      // Send event to Kafka topic via KafkaProducer
      // await this.kafkaProducer.sendUserCreatedEvent({
      //   userId: savedUser._id,
      //   name: savedUser.name,
      //   email: savedUser.email,
      //   password: savedUser.password,
      //   role: savedUser.role,
      //   schoolId: savedUser.schoolId,
      // });

      return savedUser.toObject();
    } catch (error) {
      throw new InternalServerErrorException(
        `User creation failed: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<User[]> {
    return this.UserModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.UserModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserInput: UpdateUserInput): Promise<User> {
    const updatedUser = await this.UserModel.findByIdAndUpdate(
      id,
      updateUserInput,
      { new: true },
    ).exec();
    if (!updatedUser) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // Send event to Kafka topic via KafkaProducer
    // await this.kafkaProducer.sendUserUpdatedEvent(updatedUser._id, updateUserInput);

    this.logger.log(`🔄 User Updated: ${updatedUser._id}`);

    return updatedUser;
  }

  async remove(id: string): Promise<User> {
    const deletedUser = await this.UserModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Send event to Kafka topic via KafkaProducer
    // await this.kafkaProducer.sendUserDeletedEvent(deletedUser._id);

    this.logger.log(`🗑️ User Deleted: ${deletedUser._id}`);

    return deletedUser;
  }
}
