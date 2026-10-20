#!/usr/bin/env bash
# Bootstrap + deploy the API-only stack on the TecBunny VPS (Ubuntu 24.04).
# Run ON the server as root:
#   curl -fsSL https://raw.githubusercontent.com/tecbunnysolutions-hub/tecbunnywebapp/main/scripts/deploy-api-vps.sh | bash
# or after cloning:
#   bash scripts/deploy-api-vps.sh
set -euo pipefail

APP_DIR=/opt/tecbunny
REPO_URL=https://github.com/tecbunnysolutions-hub/tecbunnywebapp.git

echo "==> 1/5 System update"
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

echo "==> 2/5 Docker"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
docker --version

echo "==> 3/5 Repository"
mkdir -p /opt
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch origin main
  git -C "$APP_DIR" checkout main
  git -C "$APP_DIR" pull --ff-only
else
  git clone "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"

echo "==> 4/5 Environment file"
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "!! .env.local created from template — edit it with real values:"
  echo "   nano $APP_DIR/.env.local"
  echo "   Then re-run: bash scripts/deploy-api-vps.sh"
  exit 0
fi

echo "==> 5/5 Build & start API stack"
docker compose -f docker-compose.api.yml up -d --build
docker compose -f docker-compose.api.yml ps

echo "==> Health check"
sleep 5
curl -fsS http://localhost:3001/api/health && echo && echo "API is UP on :3001"
echo "Once DNS api.tecbunny.com -> 203.57.85.100 resolves, Caddy will auto-issue TLS."
echo "Verify: curl https://api.tecbunny.com/api/health"
