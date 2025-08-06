# -----------------------------
# Base builder stage
# -----------------------------
FROM node:22.18.0-slim AS base

# System deps & security
RUN apt-get update && apt-get install -y ca-certificates \
    && corepack enable && corepack prepare pnpm@latest --activate \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Create non-root user (will be used in final stage)
RUN addgroup --system --gid 1001 nestjs \
  && adduser --system --uid 1001 --ingroup nestjs nestjs

# -----------------------------
# Dependencies install stage
# -----------------------------
FROM base AS deps

# Copy only the package files
COPY pnpm-lock.yaml package.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# -----------------------------
# Build stage
# -----------------------------
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules

# Copy full source code
COPY . .

# Build the application
RUN pnpm build

# -----------------------------
# Final stage
# -----------------------------
FROM base AS final

WORKDIR /app
COPY --chown=nestjs:nestjs --from=deps /app/node_modules ./node_modules
COPY --chown=nestjs:nestjs --from=builder /app/dist/. ./
COPY --chown=nestjs:nestjs --from=builder /app/package.json ./package.json

USER nestjs

ENV PORT=3000

EXPOSE 3000

CMD ["node", "main"]