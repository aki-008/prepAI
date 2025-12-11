#!/bin/bash

# --- 1. Dynamic PostgreSQL Path Detection ---
PG_BIN_DIR=$(find /usr/lib/postgresql -name pg_ctl | head -n 1 | xargs dirname)
if [ -z "$PG_BIN_DIR" ]; then
    echo "❌ Error: Could not find PostgreSQL binaries."
    exit 1
fi
echo "✅ Found PostgreSQL binaries at $PG_BIN_DIR"
export PATH="$PG_BIN_DIR:$PATH"

# --- 2. Set Critical Environment Variables ---
export DATABASE_URL="postgresql+asyncpg://prepuser:password@127.0.0.1:5432/studentdb"
export PGDATA=/home/user/postgres_data
export HOME=/home/user
export chroma_host="127.0.0.1"
export chroma_port="8080"
export chroma_collection="prepai_collection"

# --- 3. Database Initialization ---
if [ -d "$PGDATA" ] && [ ! -f "$PGDATA/PG_VERSION" ]; then
    echo "⚠️  $PGDATA exists but is not a valid cluster. Wiping..."
    rm -rf "$PGDATA"
fi

if [ ! -d "$PGDATA" ]; then
    echo "⚙️  Initializing database..."
    initdb -D "$PGDATA" --auth-local=trust --no-locale --encoding=UTF8
fi

# --- 4. Configure & Start PostgreSQL ---
# FIX: Explicitly set the socket directory in the config file to avoid /var/run permissions issues
if ! grep -q "unix_socket_directories" "$PGDATA/postgresql.conf"; then
    echo "unix_socket_directories = '/tmp'" >> "$PGDATA/postgresql.conf"
fi

# Remove any stale lock files from previous crashes
rm -f "$PGDATA/postmaster.pid"

echo "🚀 Starting PostgreSQL..."
# Try to start. If it fails, we continue (no set -e) so we can print logs.
pg_ctl -D "$PGDATA" -l /home/user/postgres.log start

# Wait a moment for startup...
sleep 3

# Check if it is actually running
if ! pg_isready -h 127.0.0.1 -p 5432; then
    echo "❌ PostgreSQL failed to start. Printing contents of postgres.log:"
    echo "----------------------------------------------------------------"
    cat /home/user/postgres.log
    echo "----------------------------------------------------------------"
    exit 1
fi

echo "✅ PostgreSQL is up and accepting connections!"

# --- 5. User & DB Setup ---
echo "🛠️  Configuring Database..."
psql -h 127.0.0.1 -d postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='prepuser'" | grep -q 1 || \
psql -h 127.0.0.1 -d postgres -c "CREATE USER prepuser WITH PASSWORD 'password';"

psql -h 127.0.0.1 -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='studentdb'" | grep -q 1 || \
createdb -h 127.0.0.1 -O prepuser studentdb

# --- 6. ChromaDB Setup ---
echo "🎨 Setting up ChromaDB..."
mkdir -p ./chroma_store
chroma run --host 0.0.0.0 --port 8080 --path ./chroma_store &

# --- 7. Nginx Setup (Non-root) ---
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

# --- 8. Start Backend ---
echo "🐍 Starting Backend..."
cd Backend
python run.py