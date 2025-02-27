import { BadRequestException } from '@nestjs/common';

export const deviceDataCreate = async (
  deviceId: string,
  userId: string,
  userAgent: string,
  ipAddress: string,
) => {
  try {
    const response = await fetch(`${process.env.DEVICE_API_LINK}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation CreateDevice($input: CreateDeviceInput!) {
            createDevice(createDeviceInput: $input) {
              _id
              userId
              deviceId
              userAgent
              ipAddress
            }
          }
        `,
        variables: {
          input: {
            deviceId,
            userId,
            userAgent,
            ipAddress,
          },
        },
      }),
    });

    // Parse JSON only once
    const data = await response.json();

    if (!response.ok) {
      throw new BadRequestException('Failed to fetch data from device service');
    }

    // Check if the response contains errors
    if (data.errors) {
      throw new BadRequestException(
        `GraphQL error: ${JSON.stringify(data.errors)}`,
      );
    }

    return data.data.createDevice;
  } catch (error) {
    console.error('Error registering device:', error);
    throw error;
  }
};
