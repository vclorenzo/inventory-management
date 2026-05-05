FROM node:20-bookworm-slim
WORKDIR /app

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate

ENV NODE_ENV=production
ENV PORT=8000
ENV RUN_SEED=true
EXPOSE 8000
CMD ["sh", "-c", "npx prisma migrate deploy && if [ \"$RUN_SEED\" = \"true\" ]; then npm run seed; else echo 'Skipping seed (RUN_SEED='$RUN_SEED')'; fi && npm run start"]
