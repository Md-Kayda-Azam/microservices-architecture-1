import * as jwt from 'jsonwebtoken';

// JWT টোকেন জেনারেট করার ফাংশন
export const generateVerificationToken = (userId: string): string => {
  const payload = { userId }; // টোকেনের payload, যেখানে userId রাখা হবে
  const secretKey = process.env.JWT_SECRET_KEY; // পরিবেশ পরিবর্তনশীল থেকে সিক্রেট কী নেয়া
  if (!secretKey) {
    throw new Error('JWT_SECRET_KEY is not defined');
  }

  const options = {
    expiresIn: '1h', // টোকেনের মেয়াদ ১ ঘণ্টা
  };

  const token = jwt.sign(payload, secretKey, options);
  return token;
};

// উদাহরণে টোকেন জেনারেট করা
// const verificationToken = generateVerificationToken('user123');
// console.log('Generated JWT Verification Token:', verificationToken);

// Verification Token
export const verifyVerificationToken = (token: string): any => {
  const secretKey = process.env.JWT_SECRET_KEY as string; // আপনার সিক্রেট কী

  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded; // টোকেন সঠিক হলে ডিকোডেড তথ্য রিটার্ন করবে
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// // উদাহরণে টোকেন ভেরিফাই করা
// const decoded = verifyVerificationToken(verificationToken);
// console.log('Decoded Token:', decoded);
