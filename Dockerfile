# Build stage
FROM node:20.19.3-alpine AS builder

# Security updates
RUN apk update && apk upgrade

# Accept build-time argument
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

WORKDIR /app

COPY . .

# Write .env file dynamically before build (this is key!)
RUN echo "VITE_API_BASE_URL=$VITE_API_BASE_URL" > .env && \
  npm install && \
  npm run build

# Run stage
FROM node:20.19.3-alpine AS runner

RUN apk update && apk upgrade && \
  npm install -g serve

WORKDIR /app

COPY --from=builder /app/dist .

EXPOSE 3000

CMD ["serve", "-s", ".", "-l", "3000"]
