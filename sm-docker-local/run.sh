#!/usr/bin/env bash

set -euo pipefail

# check if mkcert is installed
mkcert >/dev/null 2>&1 || { echo >&2 "Please install mkcert, exiting..."; exit 1; }

# create certificates
mkdir -p ./certs

mkcert -install
mkcert -cert-file ./certs/local-cert.pem -key-file ./certs/local-key.pem "app.localhost" "*.app.localhost" "domain.local" "*.domain.local" 

# down the compose
docker-compose down

# create a network if not exists
docker network inspect proxy >/dev/null 2>&1 || docker network create proxy

# up the compose
docker-compose up