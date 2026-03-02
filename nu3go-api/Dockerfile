FROM node:20-alpine AS base
WORKDIR /app

FROM base AS builder
COPY package.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001
CMD ["node", "dist/main"]
