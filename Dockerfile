FROM node:24-alpine AS base

WORKDIR /app
RUN npm install -g npm@latest
COPY package*.json ./

FROM base AS development

COPY docker-entrypoint-dev.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint-dev.sh

EXPOSE 3000 9222
ENV NODE_ENV=development
ENTRYPOINT ["docker-entrypoint-dev.sh"]
CMD ["sh", "-c", "npm run build && npm run start"]

FROM base AS builder

RUN npm ci
COPY tsconfig.json ./
COPY src ./src
COPY types ./types
COPY scripts ./scripts
RUN npm run build

FROM base AS production

RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts

USER node
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "run", "start"]
