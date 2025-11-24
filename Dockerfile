# Step 1: Build the app
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app
RUN mkdir data

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the app
COPY . .

# Build the SvelteKit app
RUN npm run build

# Step 2: Create a lightweight image for production
FROM node:22-alpine

WORKDIR /app
RUN mkdir data

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built app from builder
COPY --from=builder /app/build ./build

# Expose the port your app runs on
EXPOSE 5173

# Start the app
CMD ["node", "build"]
