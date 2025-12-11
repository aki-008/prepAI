# --- Stage 1: Build Frontend ---
FROM node:20-alpine as build-stage
WORKDIR /app/frontend
COPY Frontend/package*.json ./
RUN npm install
COPY Frontend/ .
RUN npm run build [cite: 19]

# --- Stage 2: Runtime ---
FROM python:3.12-slim

# Install system dependencies (Nginx, PostgreSQL, PortAudio)
RUN apt-get update && apt-get install -y \
    nginx postgresql postgresql-contrib postgresql-client \
    build-essential portaudio19-dev libpq-dev git \
    && rm -rf /var/lib/apt/lists/* 

# Add PostgreSQL bin directory to PATH for non-root user (adjust version if necessary)
ENV PATH="/usr/lib/postgresql/15/bin:$PATH"

# Setup non-root user for HF Spaces (UID 1000)
RUN useradd -m -u 1000 user
# Create a data directory for PostgreSQL owned by the non-root user
RUN mkdir -p /home/user/postgres_data && chown -R user:user /home/user/postgres_data
WORKDIR /home/user/app

# Copy Backend and install requirements
COPY --chown=user Backend/requirements.txt ./Backend/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r Backend/requirements.txt

COPY --chown=user Backend/ ./Backend/
COPY --chown=user --from=build-stage /app/frontend/dist /usr/share/nginx/html

# Copy Configs
COPY --chown=user nginx.conf /etc/nginx/sites-available/default [cite: 20] /
COPY --chown=user start.sh ./start.sh [cite: 20] /
RUN chmod +x ./start.sh [cite: 20]

# Environment variables
ENV PORT=7860
EXPOSE 7860

# Set the non-root user as the default user for the container
USER user

# Run the startup script
CMD ["./start.sh"]