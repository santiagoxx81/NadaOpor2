FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
# Angular 17/20 gera em dist/<app>/browser
COPY --from=build /app/dist/frontend/browser/ ./
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar env.js base e script de entrypoint para injetar API_BASE em runtime
COPY public/env.js /usr/share/nginx/html/env.js
COPY public/env.template.js /docker-env.template.js
RUN apk add --no-cache gettext
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]


