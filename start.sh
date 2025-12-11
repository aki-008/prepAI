#!/bin/bash

# --- 1. Fix PostgreSQL Path ---
# Add common PostgreSQL bin paths to $PATH so 'initdb' and 'pg_ctl' are found
export PATH=/usr/lib/postgresql/17/bin:/usr/lib/postgresql/16/bin:/usr/lib/postgresql/15/bin:/usr/lib/postgresql/14/bin:$PATH

# --- 2. Set Critical Environment Variables (Fixes Pydantic Error) ---
export DATABASE_URL="postgresql+asyncpg://prepuser:password@127.0.0.1:5432/studentdb"
export chroma_host="127.0.0.1"
export chroma_port="8080"
export chroma_collection="prepai_collection"
export PGDATA=/home/user/postgres_data

# --- 3. Initialize & Start PostgreSQL ---
if [ ! -d "$PGDATA" ]; then
    echo "Initializing database..."
    initdb -D "$PGDATA"
fi

echo "Starting PostgreSQL..."
# Start DB in background
pg_ctl -D "$PGDATA" -l /home/user/postgres.log start
sleep 3

# Create User and Database if they don't exist
psql -h 127.0.0.1 -d postgres -c "CREATE USER prepuser WITH PASSWORD 'password';" || true
createdb -h 127.0.0.1 -O prepuser studentdb || true

# --- 4. Start Nginx (Non-Root Mode) ---
# Create temp directories for Nginx to write to (avoids permission errors)
mkdir -p /tmp/nginx/body \
         /tmp/nginx/proxy \
         /tmp/nginx/fastcgi \
         /tmp/nginx/uwsgi \
         /tmp/nginx/scgi

# Generate a non-root compatible nginx config on the fly
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

# Start Nginx in the background using the custom config
echo "Starting Nginx..."
nginx -c /tmp/nginx.conf &

# --- 5. Start ChromaDB ---
echo "Starting ChromaDB..."
chroma run --host 0.0.0.0 --port 8080 --path ./chroma_store &

# --- 6. Start Backend ---
echo "Starting Backend..."
cd Backend
python run.py