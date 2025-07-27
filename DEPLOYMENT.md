# Deployment Guide

This guide provides detailed instructions for deploying the Blackjack Card Counter application in various environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Docker Deployment](#docker-deployment)
- [Manual Deployment](#manual-deployment)
- [Updating](#updating)
- [Backup and Recovery](#backup-and-recovery)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### For All Deployments
- `git` - Version control
- `Node.js` 18+ and `npm` - For frontend
- `Python` 3.10+ - For backend
- `Redis` 7.0+ - For session management and caching

### For Docker Deployment
- `Docker` 20.10+
- `Docker Compose` 2.0+

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Application
FLASK_ENV=production
SECRET_KEY=your-secret-key-here

# Database
REDIS_URL=redis://redis:6379/0

# Frontend
REACT_APP_API_URL=/api

# Optional: Sentry for error tracking
# SENTRY_DSN=your-sentry-dsn
```

## Docker Deployment (Recommended)

### Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/blackjack-card-counter.git
   cd blackjack-card-counter
   ```

2. Create `.env` file (see above)

3. Build and start the containers:
   ```bash
   docker-compose up --build -d
   ```

4. Verify the containers are running:
   ```bash
   docker-compose ps
   ```

### Common Docker Commands

- View logs:
  ```bash
  docker-compose logs -f
  ```

- Run management commands:
  ```bash
  docker-compose exec web python manage.py <command>
  ```

- Run tests:
  ```bash
  docker-compose exec web pytest
  ```

- Access Redis CLI:
  ```bash
  docker-compose exec redis redis-cli
  ```

## Manual Deployment

### Backend Setup

1. Create and activate virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start Redis:
   ```bash
   # On Linux/macOS
   redis-server &
   
   # On Windows (if installed via Chocolatey)
   redis-server
   ```

4. Run migrations (if any):
   ```bash
   flask db upgrade
   ```

5. Start the backend server:
   ```bash
   gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 app:app
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Build for production:
   ```bash
   npm run build
   ```

3. Serve the frontend (optional, can be served via Nginx/Apache):
   ```bash
   npm install -g serve
   serve -s build -l 3000
   ```

## Updating

### Docker Update

1. Pull the latest changes:
   ```bash
   git pull
   ```

2. Rebuild and restart:
   ```bash
   docker-compose up --build -d
   ```

### Manual Update

1. Pull the latest changes:
   ```bash
   git pull
   ```

2. Update dependencies:
   ```bash
   # Backend
   pip install -r requirements.txt
   
   # Frontend
   cd frontend
   npm install
   npm run build
   ```

3. Restart services as needed

## Backup and Recovery

### Regular Backups

1. **Database Backup**:
   ```bash
   # For Redis
   docker-compose exec redis redis-cli SAVE
   docker cp blackjack-redis:/data/dump.rdb ./backups/redis-$(date +%Y%m%d).rdb
   ```

2. **File Backups**:
   - Back up the `.env` file
   - Back up any uploaded files in `uploads/` directory

### Recovery

1. **Restore Redis**:
   ```bash
   # Stop Redis
   docker-compose stop redis
   
   # Copy backup file
   docker cp ./backups/redis-backup.rdb blackjack-redis:/data/dump.rdb
   
   # Restart Redis
   docker-compose start redis
   ```

## Monitoring

### Logs

- **Docker**: `docker-compose logs -f`
- **Systemd** (if applicable): `journalctl -u your-service-name -f`

### Health Checks

- Application health: `http://your-domain.com/health`
- Redis health: `redis-cli ping` (should return `PONG`)

## Troubleshooting

### Common Issues

1. **Port in use**
   ```bash
   # Find and kill the process
   sudo lsof -i :5000  # or your port
   kill -9 <PID>
   ```

2. **Docker build failures**
   - Clear Docker cache: `docker-compose build --no-cache`
   - Check for syntax errors in Dockerfile

3. **Redis connection issues**
   - Verify Redis is running: `redis-cli ping`
   - Check `REDIS_URL` in your `.env` file

### Getting Help

1. Check the logs: `docker-compose logs`
2. Check open issues on GitHub
3. If you found a bug, please open a new issue with steps to reproduce

## Security Considerations

1. Always use HTTPS in production
2. Keep dependencies updated
3. Use strong secrets in `.env`
4. Regularly backup your data
5. Monitor for security advisories in dependencies

## Scaling

For production deployments with higher traffic:

1. **Database**: Consider using Redis Enterprise or AWS ElastiCache
2. **Backend**: Add more Gunicorn workers or scale horizontally
3. **Frontend**: Use a CDN for static assets
4. **Caching**: Implement additional caching layers as needed
