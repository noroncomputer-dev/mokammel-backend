FROM node:20-alpine

WORKDIR /app

# ابتدا همه dependencies (شامل devDependencies) نصب می‌شن تا tsc کار کنه
COPY package*.json ./
RUN npm install --no-audit --no-fund

# کپی سورس‌کد و build
COPY . .
RUN npm run build

# حذف devDependencies برای image نهایی سبک‌تر
RUN npm prune --production

EXPOSE 8080

CMD ["node", "/app/dist/server.js"]
