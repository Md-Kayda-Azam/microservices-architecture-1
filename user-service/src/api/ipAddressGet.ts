import { BadRequestException } from '@nestjs/common';

export const IpAddressGet = async () => {
  try {
    const response = await fetch(
      `https://ipinfo.io/json?token=${process.env.IPINFO_API_KEY}`,
    );

    // Check if the response is ok (status code 200-299)
    if (!response.ok) {
      throw new BadRequestException('Failed to fetch IP information');
    }

    // Parse the JSON response
    const data = await response.json();
    // console.log(data);

    // Return the data if you want to use it later
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    // Optionally return an error message or null
    return null;
  }
};
