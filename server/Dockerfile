FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDeps for TypeScript build)
RUN npm ci --no-audit --no-fund

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production

EXPOSE 10000

CMD ["node", "dist/server.js"]
