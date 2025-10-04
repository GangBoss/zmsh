# Stage 1: build
FROM node:18-alpine AS build
WORKDIR /app
# Improve DNS resolution and certs inside alpine for network reliability
RUN echo "hosts: files dns" > /etc/nsswitch.conf \
  && apk add --no-cache ca-certificates \
  && update-ca-certificates

# Set npm to use official registry with retries and no progress (less verbose)
ENV NPM_CONFIG_REGISTRY=https://registry.npmjs.org \
    NPM_CONFIG_FETCH_RETRIES=2 \
    NPM_CONFIG_FETCH_RETRY_FACTOR=2 \
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000 \
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=32000 \
    NPM_CONFIG_PROGRESS=true

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install --loglevel=verbose
COPY . .
RUN npm run build

# Stage 2: serve static
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
# For local dev, allow resolving backend container
# (nginx will use service name 'backend' via docker network)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]



