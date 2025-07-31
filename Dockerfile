FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build React app
RUN npm run build

# Expose port (Render will set PORT env var)
EXPOSE $PORT

# Start the server
CMD ["node", "server-db.js"]
