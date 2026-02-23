FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --production

COPY dist/ ./dist/
COPY client-dist/ ./client-dist/
COPY server/agents/prompts/ ./server/agents/prompts/

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/server/main.js"]
