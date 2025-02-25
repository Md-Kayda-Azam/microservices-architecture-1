# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy the entire project
COPY . .

# Build the project
RUN npm run build

# Expose port
EXPOSE 3006

# Start the service
CMD ["node", "dist/main.js"]
