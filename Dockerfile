FROM node:24.22.0-bookworm-slim AS base
WORKDIR /app
RUN npm install -g npm@11.13.0

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run typecheck
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./.next/standalone
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/server/app ./.next/server/app
COPY scripts/start-standalone.cjs ./scripts/start-standalone.cjs
RUN mkdir -p ./public && cp -r /app/public ./public 2>/dev/null || true

EXPOSE 3000
CMD ["node", "scripts/start-standalone.cjs"]
