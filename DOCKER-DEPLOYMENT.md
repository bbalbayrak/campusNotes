# Docker Deployment Guide

This guide provides instructions for deploying the Campus Notes application using Docker.

## Prerequisites

- Docker Engine 20.10+ installed
- Docker Compose 2.0+ installed
- Valid `.env` file with all required environment variables

## Project Structure

```
campus-notes/
├── Dockerfile                  # Production Docker image
├── Dockerfile.dev             # Development Docker image
├── docker-compose.yml         # Production deployment
├── docker-compose.dev.yml     # Development deployment with hot reload
├── .dockerignore              # Files to exclude from Docker build
└── .env                       # Environment variables
```

## Services

The application consists of three main services:

1. **PostgreSQL** - Database (port 5432)
2. **Redis** - Queue management with BullMQ (port 6379)
3. **NestJS App** - Backend application (port 8080)

## Quick Start

### Production Deployment

1. **Build and start all services:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Stop all services:**
   ```bash
   docker-compose down
   ```

4. **Stop and remove volumes (WARNING: deletes all data):**
   ```bash
   docker-compose down -v
   ```

### Development Deployment (with Hot Reload)

1. **Start development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **View application logs:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f app
   ```

3. **Restart the application:**
   ```bash
   docker-compose -f docker-compose.dev.yml restart app
   ```

## Environment Variables

Ensure your `.env` file contains all required variables:

```env
# Application
NODE_ENV=production
PORT=8080

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_password
DB_NAME_DEVELOPMENT=campus_notes

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRESIN=86400
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=604800

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name

# Optional: App Store / Play Store
APPLE_SHARED_SECRET=your_apple_secret
GOOGLE_PACKAGE_NAME=com.yourapp.campusnotes
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/app/service-account.json
```

## Database Management

### Run Database Migrations

```bash
# Enter the app container
docker-compose exec app sh

# Run migrations
npm run migration:run
```

### Access PostgreSQL Database

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d campus_notes

# Or from your host machine
psql -h localhost -p 5432 -U postgres -d campus_notes
```

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres campus_notes > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U postgres campus_notes < backup.sql
```

## Redis Management

### Access Redis CLI

```bash
docker-compose exec redis redis-cli
```

### Clear Redis Cache

```bash
docker-compose exec redis redis-cli FLUSHALL
```

## Application Management

### View Application Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Restart Application

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart app
```

### Rebuild Application

```bash
# Rebuild and restart
docker-compose up -d --build

# Force rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### Execute Commands in Container

```bash
# Open shell in app container
docker-compose exec app sh

# Run npm commands
docker-compose exec app npm run build
docker-compose exec app npm test
```

## Health Checks

All services include health checks:

- **App**: HTTP check on port 8080
- **PostgreSQL**: `pg_isready` command
- **Redis**: `redis-cli ping` command

Check service health:

```bash
docker-compose ps
```

## Volumes

Persistent data is stored in Docker volumes:

- `postgres_data` - PostgreSQL database
- `redis_data` - Redis persistence

List volumes:

```bash
docker volume ls | grep campus-notes
```

Inspect a volume:

```bash
docker volume inspect campus-notes_postgres_data
```

## Networking

Services communicate through a Docker network: `campus-notes-network`

Inspect network:

```bash
docker network inspect campus-notes_campus-notes-network
```

## Production Optimization

### Build Optimizations

The production Dockerfile uses:
- Multi-stage builds to minimize image size
- Alpine Linux for smaller base image
- Non-root user for security
- Only production dependencies installed
- Health checks for container orchestration

### Security Considerations

1. **Never commit `.env` file** - Keep it in `.gitignore`
2. **Use strong passwords** for database and JWT secrets
3. **Rotate secrets regularly** in production
4. **Use Docker secrets** in production orchestration (Docker Swarm/Kubernetes)
5. **Keep images updated** - Regularly update base images and dependencies

### Scaling

To scale the application:

```bash
# Scale to 3 app instances
docker-compose up -d --scale app=3
```

Note: You'll need a load balancer (nginx, traefik) to distribute traffic.

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs app

# Check container status
docker-compose ps

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Database connection issues

```bash
# Verify database is healthy
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec app ping postgres
```

### Port conflicts

If ports are already in use, modify them in `.env`:

```env
PORT=3000
DB_PORT=5433
REDIS_PORT=6380
```

### Permission issues

```bash
# Fix ownership of volumes
docker-compose down
sudo chown -R $USER:$USER ./
docker-compose up -d
```

## Monitoring

### Resource Usage

```bash
# View resource usage
docker stats

# View specific container
docker stats campus-notes-app
```

### Container Inspection

```bash
# Inspect container details
docker inspect campus-notes-app

# View container processes
docker-compose top
```

## Cleanup

### Remove stopped containers

```bash
docker-compose down
```

### Remove volumes (WARNING: data loss)

```bash
docker-compose down -v
```

### Remove images

```bash
docker-compose down --rmi all
```

### Full cleanup

```bash
# Stop and remove everything
docker-compose down -v --rmi all

# Remove dangling images and volumes
docker system prune -a --volumes
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Build and push
        run: |
          docker-compose build
          docker-compose push

      - name: Deploy to server
        run: |
          ssh user@server 'cd /app && docker-compose pull && docker-compose up -d'
```

## Support

For issues or questions:
- Check container logs: `docker-compose logs`
- Verify environment variables in `.env`
- Ensure all required ports are available
- Check Docker and Docker Compose versions

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Documentation](https://docs.nestjs.com/)