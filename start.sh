#!/bin/bash
# 1. Initialize & Start Local PostgreSQL (as non-root user)
export PGDATA=/home/user/postgres_data

if [ ! -d "$PGDATA/base" ]; then
    echo "Initializing database..."
    initdb -D "$PGDATA"
fi

echo "Starting PostgreSQL..."
# Start server in the background
pg_ctl -D "$PGDATA" -l /home/user/app/postgres.log start 

# Wait for service to initialize
sleep 5

# Set environment variable for psql to use correct auth (needed for local startup)
export PGPASSWORD=password 

# Execute database setup commands (no sudo needed, run as current user)
# Attempt to create the user and database if they don't exist
psql -h 127.0.0.1 -p 5432 -U postgres -d postgres -c "CREATE USER prepuser WITH PASSWORD 'password';" || true
createdb studentdb -h 127.0.0.1 -p 5432 -U postgres || true

# 2. Start ChromaDB (in-process or separate port)
chroma run --host 0.0.0.0 --port 8080 --path ./chroma_store &

# 3. Start Nginx
service nginx start

# 4. Start Backend
cd Backend
python run.py