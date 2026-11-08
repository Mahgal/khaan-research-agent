#!/usr/bin/env bash
# One-command deployment on a fresh Vultr Cloud Compute VM (Ubuntu 22.04/24.04).
# Run as root on the VM:  bash deploy.sh
# Prereqs: a Vultr account (hackathon credits redeemed), this repo cloned,
# and a .env with LLM_API_KEY / LLM_MODEL from Vultr Serverless Inference.
set -euo pipefail
cd "$(dirname "$0")"

echo "==> Installing Node 22 + Docker"
if ! command -v node >/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

echo "==> Building sandbox image"
docker build -f Dockerfile.sandbox -t khaan/sandbox:1 .

echo "==> Installing systemd service"
cat > /etc/systemd/system/khaan-agent.service <<'UNIT'
[Unit]
Description=KHAAN Research Agent (Vultr Agent Rush)
After=network.target docker.service
Requires=docker.service

[Service]
WorkingDirectory=/opt/khaan-agent
EnvironmentFile=/opt/khaan-agent/.env
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=3
User=root

[Install]
WantedBy=multi-user.target
UNIT

mkdir -p /opt/khaan-agent
cp -r server.js lib sandbox public CANARY.txt /opt/khaan-agent/
[ -f .env ] && cp .env /opt/khaan-agent/.env || echo "WARN: no .env found — app will run in mock LLM mode"
systemctl daemon-reload
systemctl enable --now khaan-agent

echo "==> Opening firewall (ufw, if active)"
ufw allow 8080/tcp >/dev/null 2>&1 || true

sleep 2
curl -s http://127.0.0.1:8080/api/health && echo
echo "Deployed. Public URL: http://<this-vm-ip>:8080/"
echo "Tip: put Caddy/Nginx in front for HTTPS, or use the VM hostname."
