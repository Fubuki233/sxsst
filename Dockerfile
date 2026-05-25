# ── Stage 1: Build ──
FROM node:20-alpine AS build

WORKDIR /app

# Install pnpm. Keep this on a Node 20 compatible major version.
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy package files
COPY package.json pnpm-workspace.yaml ./
COPY postcss.config.mjs vite.config.ts ./

# Install dependencies (no lockfile)
RUN pnpm install

# Copy source code
COPY . .

# Build the project
RUN pnpm build

# ── Stage 2: Serve with nginx on port 8001 ──
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config (SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8001

CMD ["nginx", "-g", "daemon off;"]
