# BugQuest AI — Deployment & Operations Guide

## 1. Production Architecture with Docker Compose

BugQuest AI is provisioned for containerized deployment using the multi-service `docker-compose.yml` file located at the repository root.

```yaml
services:
  db:
    image: postgres:15-alpine
    restart: unless-stopped
    volumes: [postgres_data:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: bugquest_ai
      POSTGRES_USER: bugquest_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  ai-service:
    build: { context: ./ai-service }
    restart: unless-stopped
    environment:
      AI_PROVIDER: ${AI_PROVIDER:-gemini}
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    ports: ["8001:8001"]

  backend:
    build: { context: ./backend }
    restart: unless-stopped
    environment:
      DB_CONNECTION: pgsql
      DB_HOST: db
      DB_DATABASE: bugquest_ai
      AI_SERVICE_URL: http://ai-service:8001
    depends_on: [db, redis, ai-service]
    ports: ["8000:8000"]

  frontend:
    build: { context: ./frontend }
    restart: unless-stopped
    ports: ["80:80"]
    depends_on: [backend]
```

---

## 2. Environment Variables Checklist

Ensure these variables are defined in production:

```bash
# Application
APP_NAME="BugQuest AI"
APP_ENV=production
APP_KEY=base64:... # Generate with `php artisan key:generate`
APP_DEBUG=false
APP_URL=https://bugquest.ai

# Database
DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=bugquest_ai
DB_USERNAME=bugquest_user
DB_PASSWORD=YOUR_STRONG_PASSWORD

# AI Coach Service
AI_PROVIDER=gemini # or openai / fallback_simulated
GEMINI_API_KEY=YOUR_GEMINI_KEY
AI_SERVICE_URL=http://ai-service:8001

# Code Judge Configuration
CODE_JUDGE_PROVIDER=isolated_sandbox # or piston / judge0
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=YOUR_RAPIDAPI_KEY
```

---

## 3. Deployment Steps

```bash
# 1. Pull latest release
git pull origin main

# 2. Build containers
docker compose build --no-cache

# 3. Launch database and services
docker compose up -d

# 4. Execute database migrations
docker compose exec backend php artisan migrate --force

# 5. Seed challenges and initial data
docker compose exec backend php artisan db:seed --class=ChallengeSeeder --force

# 6. Verify operational health
curl http://localhost:8000/api/health
curl http://localhost:8001/health
```

---

## 4. Health Checks & Monitoring

- **Backend Health Endpoint**: `GET /api/health`
  - Returns `{"status": "operational", "app": "BugQuest AI", "version": "1.0.0"}`
- **AI Coach Health Endpoint**: `GET /health`
  - Returns `{"status": "healthy", "service": "BugQuest AI Coach", "provider": "..."}`
