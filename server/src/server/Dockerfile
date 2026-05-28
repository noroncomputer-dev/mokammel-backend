FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY . .
RUN npm run build

RUN npm prune --production

EXPOSE 8080

CMD ["node", "/app/dist/server.js"]