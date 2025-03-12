# Use an official Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files (and install dependencies)
COPY package.json package-lock.json ./
RUN npm install

# Copy the entire codebase, including the prisma folder
COPY . .

# (Optional) Debug: list the prisma directory to verify the schema exists
RUN ls -la /app/prisma

# Generate the Prisma client explicitly after copying all files
RUN npx prisma generate --schema=./prisma/schema.prisma

# Expose Next.js default port
EXPOSE 3000

# Run the Next.js app in development mode
CMD ["npm", "run", "dev"]
