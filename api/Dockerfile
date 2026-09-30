FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN node ace build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/build ./
COPY --from=build /app/package-lock.json ./package-lock.json
RUN npm ci --omit=dev
EXPOSE 3333
CMD ["sh", "-c", "node ace migration:run --force && node bin/server.js"]
