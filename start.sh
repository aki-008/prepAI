#!/bin/bash
# 1. Start PostgreSQL
service postgresql start

# Wait for service to initialize
sleep 5

# Execute database setup commands
sudo -u postgres psql -c "CREATE USER prepuser WITH PASSWORD 'password';"
sudo -u postgres psql -c "CREATE DATABASE studentdb OWNER prepuser;"

export DATABASE_URL="postgresql+psycopg2://prepuser:password@127.0.0.1:5432/studentdb"
export chroma_host="127.0.0.1"
export chroma_port="8001" # Assuming you run ChromaDB on this port in start.sh
export chroma_collection="prepai_collection"

# 2. Start ChromaDB (in-process or separate port)
chroma run --host 0.0.0.0 --port 8080 --path ./chroma_store &

# 3. Start Nginx
service nginx start

# 4. Start Backend
cd Backend
python run.py