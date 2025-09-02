#!/bin/sh
set -e

# Renderiza env.js a partir do template usando variáveis de ambiente
if [ -f /docker-env.template.js ]; then
  : ${API_BASE:="http://localhost:4000/api"}
  envsubst '$API_BASE' < /docker-env.template.js > /usr/share/nginx/html/env.js
fi

exec "$@"


