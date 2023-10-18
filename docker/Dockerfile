FROM node:16.17.0-bullseye-slim AS build
WORKDIR /app
COPY . .
RUN corepack enable
RUN corepack prepare pnpm@latest --activate
RUN pnpm i
RUN pnpm run build

FROM nginx:1.19.1
RUN mkdir /app
COPY --from=build /app/dist /app
COPY --from=build /app/dist/spa /app
COPY docker/nginx.conf /etc/nginx/nginx.conf
