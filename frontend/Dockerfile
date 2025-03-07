# Use an official Node.js image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (without the "frontend/" prefix)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire frontend code
COPY . . 

# Expose Next.js default port
EXPOSE 3000

# Run the frontend
CMD ["npm", "run", "dev"]
