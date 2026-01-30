# Docker management script for Windows (PowerShell)
param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host "Campus Notes - Docker Management Script" -ForegroundColor Green
    Write-Host "=======================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Production Commands:" -ForegroundColor Yellow
    Write-Host "  .\docker.ps1 build           - Build production Docker images"
    Write-Host "  .\docker.ps1 up              - Start production containers"
    Write-Host "  .\docker.ps1 down            - Stop production containers"
    Write-Host "  .\docker.ps1 restart         - Restart production containers"
    Write-Host "  .\docker.ps1 logs            - View production logs"
    Write-Host "  .\docker.ps1 shell           - Open shell in app container"
    Write-Host ""
    Write-Host "Development Commands:" -ForegroundColor Yellow
    Write-Host "  .\docker.ps1 dev             - Start development environment"
    Write-Host "  .\docker.ps1 dev-down        - Stop development containers"
    Write-Host "  .\docker.ps1 dev-logs        - View development logs"
    Write-Host "  .\docker.ps1 dev-restart     - Restart development containers"
    Write-Host ""
    Write-Host "Database Commands:" -ForegroundColor Yellow
    Write-Host "  .\docker.ps1 db-shell        - Open PostgreSQL shell"
    Write-Host "  .\docker.ps1 db-backup       - Backup database"
    Write-Host "  .\docker.ps1 db-restore      - Restore database from backup.sql"
    Write-Host ""
    Write-Host "Other Commands:" -ForegroundColor Yellow
    Write-Host "  .\docker.ps1 ps              - Show running containers"
    Write-Host "  .\docker.ps1 health          - Check health status"
    Write-Host "  .\docker.ps1 clean           - Remove all containers and volumes"
    Write-Host "  .\docker.ps1 rebuild         - Rebuild and restart"
    Write-Host ""
}

function Build-Production {
    Write-Host "Building production images..." -ForegroundColor Cyan
    docker-compose build --no-cache
}

function Start-Production {
    Write-Host "Starting production containers..." -ForegroundColor Cyan
    docker-compose up -d
    Write-Host "Application started at http://localhost:8080" -ForegroundColor Green
}

function Stop-Production {
    Write-Host "Stopping production containers..." -ForegroundColor Cyan
    docker-compose down
}

function Restart-Production {
    Write-Host "Restarting production containers..." -ForegroundColor Cyan
    docker-compose restart
}

function Show-Logs {
    docker-compose logs -f
}

function Open-Shell {
    docker-compose exec app sh
}

function Start-Development {
    Write-Host "Starting development environment with hot reload..." -ForegroundColor Cyan
    docker-compose -f docker-compose.dev.yml up -d
    Write-Host "Development environment started!" -ForegroundColor Green
    Write-Host "Application: http://localhost:8080" -ForegroundColor Green
    Write-Host "To view logs: .\docker.ps1 dev-logs" -ForegroundColor Yellow
}

function Stop-Development {
    Write-Host "Stopping development containers..." -ForegroundColor Cyan
    docker-compose -f docker-compose.dev.yml down
}

function Show-DevLogs {
    docker-compose -f docker-compose.dev.yml logs -f
}

function Restart-Development {
    Write-Host "Restarting development containers..." -ForegroundColor Cyan
    docker-compose -f docker-compose.dev.yml restart
}

function Open-DbShell {
    docker-compose exec postgres psql -U postgres -d campus_notes
}

function Backup-Database {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $filename = "backup_$timestamp.sql"
    Write-Host "Creating database backup: $filename" -ForegroundColor Cyan
    docker-compose exec postgres pg_dump -U postgres campus_notes | Out-File -FilePath $filename -Encoding UTF8
    Write-Host "Backup created successfully: $filename" -ForegroundColor Green
}

function Restore-Database {
    if (-not (Test-Path "backup.sql")) {
        Write-Host "Error: backup.sql not found!" -ForegroundColor Red
        exit 1
    }
    Write-Host "Restoring database from backup.sql..." -ForegroundColor Cyan
    Get-Content backup.sql | docker-compose exec -T postgres psql -U postgres campus_notes
    Write-Host "Database restored successfully" -ForegroundColor Green
}

function Show-Status {
    docker-compose ps
}

function Show-Health {
    Write-Host "Checking service health..." -ForegroundColor Cyan
    docker-compose ps
}

function Clean-All {
    $confirm = Read-Host "This will remove all containers, volumes, and images. Are you sure? (y/N)"
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        Write-Host "Cleaning up..." -ForegroundColor Cyan
        docker-compose down -v --rmi all
        Write-Host "Cleanup completed" -ForegroundColor Green
    } else {
        Write-Host "Cancelled" -ForegroundColor Yellow
    }
}

function Rebuild-All {
    Write-Host "Rebuilding application..." -ForegroundColor Cyan
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    Write-Host "Application rebuilt and restarted" -ForegroundColor Green
}

function Open-RedisShell {
    docker-compose exec redis redis-cli
}

function Clear-Redis {
    docker-compose exec redis redis-cli FLUSHALL
    Write-Host "Redis cache cleared" -ForegroundColor Green
}

# Command routing
switch ($Command.ToLower()) {
    "help" { Show-Help }
    "build" { Build-Production }
    "up" { Start-Production }
    "down" { Stop-Production }
    "restart" { Restart-Production }
    "logs" { Show-Logs }
    "shell" { Open-Shell }
    "dev" { Start-Development }
    "dev-down" { Stop-Development }
    "dev-logs" { Show-DevLogs }
    "dev-restart" { Restart-Development }
    "db-shell" { Open-DbShell }
    "db-backup" { Backup-Database }
    "db-restore" { Restore-Database }
    "redis-shell" { Open-RedisShell }
    "redis-clear" { Clear-Redis }
    "ps" { Show-Status }
    "health" { Show-Health }
    "clean" { Clean-All }
    "rebuild" { Rebuild-All }
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Help
    }
}
