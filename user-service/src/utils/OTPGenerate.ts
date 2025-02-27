import * as crypto from 'crypto';

// Low quality random numnber generator
export const generateOTPJustNumber = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// High quality random number generator
export const generateOTP = (): string => {
  const otp = crypto.randomBytes(3).toString('hex'); // 6-digit OTP
  return otp;
};
