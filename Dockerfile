# ---------- build stage ----------
FROM oven/bun:1.2 AS build
WORKDIR /app

# Build the Nitro output for a plain Node server instead of Cloudflare Workers.
ENV NITRO_PRESET=node-server
ENV NODE_ENV=production

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .

# VITE_* values are baked into the client bundle at build time.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID

RUN bun run build

# ---------- runtime stage ----------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=build /app/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
