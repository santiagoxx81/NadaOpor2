# NadaOpor2

## Docker (Dev e Swarm)

### Desenvolvimento local

Pré-requisitos: Docker Desktop ou Docker Engine.

1) Subir tudo (MySQL, backend, frontend):
```
docker compose -f docker-compose.dev.yml up --build
```
2) Acessos:
- Frontend: http://localhost/
- Backend API: http://localhost:4000/api
- MySQL: localhost:3306 (user/pass: nadaopor / nadaopor)

Uploads persistem no volume `uploads_data`.

### Build e push das imagens

Troque pelo seu namespace de repositório Docker Hub:
```
docker build -t automacaodebaixocusto/nadaopor-backend:latest ./backend
docker push automacaodebaixocusto/nadaopor-backend:latest

docker build -t automacaodebaixocusto/nadaopor-frontend:latest ./frontend
docker push automacaodebaixocusto/nadaopor-frontend:latest
```

### Swarm - rede e stacks

1) Iniciar Swarm (se ainda não):
```
docker swarm init
```
2) Criar rede overlay externa:
```
docker network create -d overlay network_public
```
3) Subir banco:
```
MYSQL_ROOT_PASSWORD=changeme \
MYSQL_DATABASE=nadaopor \
MYSQL_USER=nadaopor \
MYSQL_PASSWORD=nadaopor \
docker stack deploy -c docker-stack-db.yml nadaopor-db
```
4) Subir app (backend + frontend):
```
DB_HOST=db \
DB_USER=nadaopor \
DB_PASSWORD=nadaopor \
DB_NAME=nadaopor \
JWT_SECRET=changeme \
JWT_EXPIRES=8h \
API_BASE=https://seu-dominio-ou-ip/api \
docker stack deploy -c docker-stack-app.yml nadaopor
```

Observações:
- O backend publica a porta 4000 (ingress). O frontend publica a porta 80.
- O diretório de uploads é persistido em `uploads_data` (volume local no Swarm node).
- Ajuste `API_BASE` no deploy do frontend para apontar para a URL pública da API.


