# Use the official Node.js image
FROM node:18-alpine

# Create and set the working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the app's source code
COPY . .

# Expose the port your app will run on
EXPOSE 3000

# Command to start your app
CMD ["node", "index.js"]
