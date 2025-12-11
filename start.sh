#!/bin/bash
set -e

# --- 1. Set Environment Variables ---
export HOME=/home/user
# Note: DATABASE_URL is automatically provided by Hugging Face Secrets (pointing to Render)

# ChromaDB settings
export chroma_host="127.0.0.1"
export chroma_port="8080"
export chroma_collection="prepai_collection"

# --- 2. Start ChromaDB ---
echo "🎨 Setting up ChromaDB..."
mkdir -p ./chroma_store
chroma run --host 0.0.0.0 --port 8080 --path ./chroma_store &

# --- 3. Start Nginx (Non-root Mode) ---
echo "🌐 Starting Nginx..."
mkdir -p /tmp/nginx/body /tmp/nginx/proxy /tmp/nginx/fastcgi /tmp/nginx/uwsgi /tmp/nginx/scgi

cat <<EOF > /tmp/nginx.conf
worker_processes 1;
daemon off;
pid /tmp/nginx.pid;
error_log /tmp/error.log;
events { worker_connections 1024; }
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    access_log /tmp/access.log;
    client_body_temp_path /tmp/nginx/body;
    proxy_temp_path       /tmp/nginx/proxy;
    fastcgi_temp_path     /tmp/nginx/fastcgi;
    uwsgi_temp_path       /tmp/nginx/uwsgi;
    scgi_temp_path        /tmp/nginx/scgi;

    server {
        listen 7860;
        server_name localhost;
        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files \$uri \$uri/ /index.html;
        }
        location /api/v1/ {
            proxy_pass http://127.0.0.1:8000/api/v1/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
        }
    }
}
EOF

nginx -c /tmp/nginx.conf &

# --- 4. Start Backend ---
echo "🐍 Starting Backend..."
cd Backend
# The app will connect to the Render DB using the DATABASE_URL secret
python run.py