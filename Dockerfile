# Base image
FROM node:20-alpine

# Create app dir
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the code
COPY . .

# Build Nest
RUN npm run build

# Run the dist build
CMD ["node", "dist/main.js"]
