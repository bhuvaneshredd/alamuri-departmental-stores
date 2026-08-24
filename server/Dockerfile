FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/

RUN npm install --workspace=server

COPY server/ ./server/

WORKDIR /app/server
RUN npx prisma generate --schema=prisma/schema.postgresql.prisma
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app/server

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/node_modules ./server_node_modules
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/prisma ./prisma
COPY --from=builder /app/server/package*.json ./

EXPOSE 5000

CMD ["node", "dist/server.js"]