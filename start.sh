#!/bin/bash
# 1. Start PostgreSQL
service postgresql start
su - postgres -c "psql -c \"CREATE USER user WITH PASSWORD 'password';\""
su - postgres -c "psql -c \"CREATE DATABASE studentdb OWNER user;\""

# 2. Start ChromaDB (in-process or separate port)
chroma run --host 0.0.0.0 --port 8080 --path ./chroma_store &

# 3. Start Nginx
service nginx start

# 4. Start Backend
cd Backend
python run.py