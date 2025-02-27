import * as crypto from 'crypto';

export const generateDeviceId = (
  ip: string,
  userAgent: string,
  acceptLanguage: string,
) => {
  const data = `${ip}-${userAgent}-${acceptLanguage}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};
