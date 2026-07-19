#!/bin/bash
set -e

echo "=== LifyGo Production Deployment ==="

# -----------------------------------------------------------------------
# Step 1 — System update
# -----------------------------------------------------------------------
echo "--- Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq

# -----------------------------------------------------------------------
# Step 2 — Install Docker
# -----------------------------------------------------------------------
echo "--- Installing Docker..."
apt-get install -y -qq \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) \
    signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
    https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable" \
    | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -qq
apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin

systemctl enable docker
systemctl start docker

echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker compose version)"

# -----------------------------------------------------------------------
# Step 3 — Install nginx + certbot
# -----------------------------------------------------------------------
echo "--- Installing nginx and certbot..."
apt-get install -y -qq nginx certbot python3-certbot-nginx

systemctl enable nginx
systemctl start nginx

# -----------------------------------------------------------------------
# Step 4 — Clone the repository
# -----------------------------------------------------------------------
echo "--- Cloning LifyGo repository..."
if [ -d "/opt/lifygo" ]; then
    echo "Repository already exists, pulling latest..."
    cd /opt/lifygo
    git pull origin main
else
    git clone https://github.com/lifygo/lifygo.git /opt/lifygo
    cd /opt/lifygo
fi

# -----------------------------------------------------------------------
# Step 5 — Setup nginx config
# -----------------------------------------------------------------------
echo "--- Configuring nginx..."
cp /opt/lifygo/infra/nginx/lifygo.conf /etc/nginx/sites-available/lifygo
ln -sf /etc/nginx/sites-available/lifygo /etc/nginx/sites-enabled/lifygo
rm -f /etc/nginx/sites-enabled/default

# Test nginx config before reloading
nginx -t
systemctl reload nginx

echo "=== Base installation complete ==="
echo ""
echo "Next steps:"
echo "1. Create /opt/lifygo/.env.prod with all environment variables"
echo "2. Run: cd /opt/lifygo && docker build -f infra/docker/api.Dockerfile -t lifygo-api:latest ."
echo "3. Run: docker compose -f infra/docker/docker-compose.prod.yml --env-file .env.prod up -d"
echo "4. Run: certbot --nginx -d api.lifygo.com"
echo ""
echo "Server is ready for configuration."