#!/bin/bash

# Maintenance script for Blackjack Card Counter
# Usage: ./scripts/maintenance.sh [command] [options]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENV_FILE=".env"
DOCKER_COMPOSE="docker-compose"

# Check if script is run from project root
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Load environment variables
if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' $ENV_FILE | xargs)
fi

# Functions
show_help() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  backup [type]     Create backup (db, files, all)"
    echo "  restore [file]    Restore from backup"
    echo "  logs [service]    Show logs (web, redis, all)"
    echo "  shell [service]   Open shell in container (web, redis)"
    echo "  update            Update the application"
    echo "  monitor           Show system resources"
    echo "  help              Show this help message"
    echo ""
    echo "Options:"
    echo "  -h, --help        Show this help message"
}

backup() {
    local type=${1:-all}
    local timestamp=$(date +%Y%m%d%H%M%S)
    local backup_dir="./backups/$timestamp"
    
    mkdir -p "$backup_dir"
    
    case $type in
        db|database)
            echo -e "${YELLOW}Creating database backup...${NC}"
            $DOCKER_COMPOSE exec redis redis-cli SAVE
            docker cp blackjack-redis:/data/dump.rdb "$backup_dir/redis-dump.rdb"
            ;;
        files)
            echo -e "${YELLOW}Backing up important files...${NC}"
            cp .env "$backup_dir/"
            cp docker-compose.yml "$backup_dir/"
            ;;
        all)
            backup "db"
            backup "files"
            ;;
        *)
            echo -e "${RED}Error: Unknown backup type '$type'${NC}"
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}Backup created at $backup_dir${NC}
Backup size: $(du -sh "$backup_dir" | cut -f1)"
}

restore() {
    local file=$1
    
    if [ -z "$file" ]; then
        echo -e "${RED}Error: Please specify backup file${NC}"
        exit 1
    fi
    
    if [ ! -f "$file" ]; then
        echo -e "${RED}Error: Backup file not found${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}Restoring from backup...${NC}"
    
    # Stop services
    $DOCKER_COMPOSE stop web redis
    
    # Restore Redis
    if [[ "$file" == *"redis-dump.rdb" ]]; then
        echo "Restoring Redis database..."
        docker cp "$file" blackjack-redis:/data/dump.rdb
        docker-compose start redis
    fi
    
    # Start services
    $DOCKER_COMPOSE up -d
    
    echo -e "${GREEN}Restore completed successfully${NC}"
}

show_logs() {
    local service=${1:-all}
    $DOCKER_COMPOSE logs -f "$service"
}

open_shell() {
    local service=${1:-web}
    $DOCKER_COMPOSE exec "$service" sh
}

update_app() {
    echo -e "${YELLOW}Updating application...${NC}"
    
    # Backup before updating
    backup "all"
    
    # Pull latest changes
    git pull
    
    # Rebuild and restart
    $DOCKER_COMPOSE up --build -d
    
    # Run migrations if any
    $DOCKER_COMPOSE exec web flask db upgrade
    
    echo -e "${GREEN}Update completed successfully${NC}"
}

monitor_resources() {
    echo -e "${YELLOW}Monitoring system resources...${NC}"
    echo "Press Ctrl+C to exit"
    
    watch -n 1 '
        echo "=== Containers ==="
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        echo ""
        echo "=== Resources ==="
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
    '
}

# Parse command line arguments
case "$1" in
    backup)
        backup "$2"
        ;;
    restore)
        restore "$2"
        ;;
    logs)
        show_logs "$2"
        ;;
    shell)
        open_shell "$2"
        ;;
    update)
        update_app
        ;;
    monitor)
        monitor_resources
        ;;
    help|--help|-h|*)
        show_help
        ;;
esac

exit 0
