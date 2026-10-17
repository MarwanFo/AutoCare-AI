# ==============================================================================
# AutoCare-AI - Admin Web Portal Dockerfile (Multi-stage build)
# React / Vite / Nginx Alpine
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build the React Application
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Cache package dependencies layer
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build production bundle
COPY . .
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Serve via Nginx
# ------------------------------------------------------------------------------
FROM nginx:1.25-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built bundle from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
