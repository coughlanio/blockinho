# Use the official Bun image
FROM oven/bun:1

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Set default config directory
ENV CONFIG_DIR=/config
ENV BLOCKY_URL=http://blocky:4000

# Create config directory
RUN mkdir -p /config

# Expose port
EXPOSE 3000

# Run the app
CMD ["bun", "run", "start"]
