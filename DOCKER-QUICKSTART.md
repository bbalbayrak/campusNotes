# Docker Quick Start Guide

Quick reference for deploying Campus Notes with Docker.

## Prerequisites

✅ Docker Desktop installed and running
✅ `.env` file configured with your settings

## Production Deployment

### Start Everything

```bash
# Using docker-compose
docker-compose up -d

# Using PowerShell script (Windows)
.\docker.ps1 up

# Using Makefile (Linux/Mac)
make up
```

Access your app at: **http://localhost:8080**

### Common Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Rebuild after code changes
docker-compose up -d --build
```

## Development Deployment (Hot Reload)

### Start Development Mode

```bash
# Using docker-compose
docker-compose -f docker-compose.dev.yml up -d

# Using PowerShell script
.\docker.ps1 dev

# Using Makefile
make dev
```

Your code changes will automatically reload!

### Development Commands

```bash
# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development
docker-compose -f docker-compose.dev.yml down

# Restart
docker-compose -f docker-compose.dev.yml restart
```

## Database Operations

### Access Database

```bash
docker-compose exec postgres psql -U postgres -d campus_notes
```

### Backup Database

```bash
docker-compose exec postgres pg_dump -U postgres campus_notes > backup.sql
```

### Restore Database

```bash
docker-compose exec -T postgres psql -U postgres campus_notes < backup.sql
```

## Troubleshooting

### Check Service Status

```bash
docker-compose ps
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Restart Everything

```bash
docker-compose down
docker-compose up -d
```

### Clean Start (removes all data)

```bash
docker-compose down -v
docker-compose up -d
```

### Rebuild from Scratch

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Helper Scripts

### Windows (PowerShell)

```powershell
.\docker.ps1 help        # Show all commands
.\docker.ps1 up          # Start production
.\docker.ps1 dev         # Start development
.\docker.ps1 logs        # View logs
.\docker.ps1 down        # Stop services
```

### Linux/Mac (Makefile)

```bash
make help          # Show all commands
make up            # Start production
make dev           # Start development
make logs          # View logs
make down          # Stop services
```

## Services & Ports

| Service | Port | Purpose |
|---------|------|---------|
| App | 8080 | NestJS Backend |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Queue/Cache |

## Environment Variables

Ensure your `.env` file includes:

```env
NODE_ENV=production
PORT=8080
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_password
DB_NAME_DEVELOPMENT=campus_notes
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your_secret
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket
```

## Next Steps

📖 **Full Documentation**: See [DOCKER-DEPLOYMENT.md](DOCKER-DEPLOYMENT.md) for comprehensive guide
🔧 **Configuration**: Review your `.env` file settings
🚀 **Deploy**: Push to your production server
📊 **Monitor**: Check logs regularly with `docker-compose logs -f`

## Quick Tips

- **First time?** Run `docker-compose up -d` and wait for health checks
- **Made code changes?** Use dev mode with `docker-compose -f docker-compose.dev.yml up -d`
- **Database issues?** Check logs with `docker-compose logs postgres`
- **Port conflicts?** Change ports in your `.env` file
- **Start fresh?** Run `docker-compose down -v` (WARNING: deletes data)

## Support

Having issues? Check:
1. Docker Desktop is running
2. `.env` file exists and is configured
3. Ports 8080, 5432, 6379 are not in use
4. View logs: `docker-compose logs`

For detailed troubleshooting, see [DOCKER-DEPLOYMENT.md](DOCKER-DEPLOYMENT.md)
