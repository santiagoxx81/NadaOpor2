FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Porta da API
ENV PORT=4000

# Variáveis esperadas:
# DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, JWT_EXPIRES, UPLOAD_DIR

# Criar diretório de uploads se não existir
RUN mkdir -p /data/uploads
ENV UPLOAD_DIR=/data/uploads

VOLUME ["/data/uploads"]

EXPOSE 4000

CMD ["node", "server.js"]


