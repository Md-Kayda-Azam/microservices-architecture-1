const nodemailer = require('nodemailer'); // Using CommonJS as resolved earlier

export const sendVerificationEmail = async (
  toEmail: string,
  password: string,
  name: string,
): Promise<void> => {
  try {
    if (!nodemailer || typeof nodemailer.createTransport !== 'function') {
      throw new Error('Nodemailer module is not properly imported');
    }

    const mailHost = process.env.MAIL_HOST;
    const mailPort = parseInt(process.env.MAIL_PORT || '587', 10);
    const mailUser = process.env.MAIL_ID;
    const mailPass = process.env.PASSWORD;

    if (!mailHost || !mailPort || !mailUser || !mailPass) {
      throw new Error('Missing email configuration in environment variables');
    }

    const transporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: mailPort === 465,
      auth: {
        user: mailUser,
        pass: mailPass,
      },
    });

    const mailOptions = {
      from: '"School Management" <kaydaazamgamer1@gmail.com>',
      to: toEmail,
      subject: 'Login Credentials for School Management',
      html: `
        <p>Dear ${name},</p>
        <p>Welcome to the School Management System! Here are your login credentials:</p>
        <p><strong>Email:</strong> ${toEmail}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>You can log in to the system using the credentials provided by visiting the link below:</p>
        <p><a href="https://www.jknextsm.com">Click here to log in</a></p>
        <p>Please keep these credentials safe and do not share them with others. If you didn't request this, please ignore this email.</p>
        <p>Best Regards,</p>
        <p><strong>School Management Team</strong></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

export const sendVerificationOTPEmail = async (
  toEmail: string,
  otp: string,
  name: string,
): Promise<void> => {
  try {
    if (!nodemailer || typeof nodemailer.createTransport !== 'function') {
      throw new Error('Nodemailer module is not properly imported');
    }

    const mailHost = process.env.MAIL_HOST;
    const mailPort = parseInt(process.env.MAIL_PORT || '587', 10);
    const mailUser = process.env.MAIL_ID;
    const mailPass = process.env.PASSWORD;

    if (!mailHost || !mailPort || !mailUser || !mailPass) {
      throw new Error('Missing email configuration in environment variables');
    }

    const transporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: mailPort === 465,
      auth: {
        user: mailUser,
        pass: mailPass,
      },
    });

    const mailOptions = {
      from: '"School Management" <kaydaazamgamer1@gmail.com>',
      to: toEmail,
      subject: 'Login Credentials for School Management',
      html: `
      <p>Dear ${name},</p>
      <p>Welcome to the School Management System!</p>
      <p>To verify your email, please use the following information:</p>
      <p><strong>Email:</strong> ${toEmail}</p>
      <p><strong>OTP:</strong> ${otp}</p>
      <p>Use this OTP to verify your email in our system. The OTP is valid for 5 minutes.</p>
      <p>Keep this information secure and do not share it with others. If you didn’t request this, please ignore this email.</p>
      <p>Best Regards,</p>
      <p><strong>School Management Team</strong></p>
    `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

export const sendSecurityAlertEmail = async (
  email: string,
  location: string,
  ipAddress: string,
  userAgent: string,
): Promise<void> => {
  try {
    if (!nodemailer || typeof nodemailer.createTransport !== 'function') {
      throw new Error('Nodemailer module is not properly imported');
    }

    const mailHost = process.env.MAIL_HOST;
    const mailPort = parseInt(process.env.MAIL_PORT || '587', 10);
    const mailUser = process.env.MAIL_ID;
    const mailPass = process.env.PASSWORD;

    if (!mailHost || !mailPort || !mailUser || !mailPass) {
      throw new Error('Missing email configuration in environment variables');
    }

    const transporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: mailPort === 465,
      auth: {
        user: mailUser,
        pass: mailPass,
      },
    });

    // Updated email content
    const mailOptions = {
      from: '"Security Alert" <kaydaazamgamer1@gmail.com>', // From your email
      to: email, // Email to send the alert
      subject: 'New Login Detected',
      html: `
      <p>Dear User,</p>
      <p>We detected a new login to your account from a different device or location.</p>
      <p><strong>Location:</strong> ${location}</p>
      <p><strong>IP Address:</strong> ${ipAddress}</p>
      <p><strong>User-Agent:</strong> ${userAgent}</p>
      <p>If this was you, no action is needed. However, if you did not log in, please take immediate action to secure your account.</p>
      <p>Best Regards,</p>
      <p><strong>Security Team</strong></p>
    `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Security alert email sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send security alert email: ${error.message}`);
  }
};
