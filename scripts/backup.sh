#!/bin/bash

# CoachHub Baseball - Backup Script
# This script backs up the PostgreSQL database and uploads directory

set -e

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_CONTAINER="coachhub-db"
DB_NAME="coachhub"
DB_USER="coach"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}CoachHub Baseball - Backup Script${NC}"
echo "Starting backup at $(date)"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup PostgreSQL database
echo -e "${YELLOW}Backing up PostgreSQL database...${NC}"
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME > "$BACKUP_DIR/db_$TIMESTAMP.sql"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database backup completed: db_$TIMESTAMP.sql${NC}"
else
    echo -e "${RED}✗ Database backup failed${NC}"
    exit 1
fi

# Backup uploads directory
echo -e "${YELLOW}Backing up uploads directory...${NC}"
if [ -d "./uploads" ]; then
    tar -czf "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" ./uploads
    echo -e "${GREEN}✓ Uploads backup completed: uploads_$TIMESTAMP.tar.gz${NC}"
else
    echo -e "${YELLOW}! No uploads directory found, skipping${NC}"
fi

# Calculate backup sizes
DB_SIZE=$(du -h "$BACKUP_DIR/db_$TIMESTAMP.sql" | cut -f1)
if [ -f "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" ]; then
    UPLOAD_SIZE=$(du -h "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" | cut -f1)
else
    UPLOAD_SIZE="N/A"
fi

echo ""
echo -e "${GREEN}Backup completed successfully!${NC}"
echo "Database backup size: $DB_SIZE"
echo "Uploads backup size: $UPLOAD_SIZE"
echo "Backup location: $BACKUP_DIR"
echo ""

# Keep only last 7 days of backups
echo -e "${YELLOW}Cleaning up old backups (keeping last 7 days)...${NC}"
find "$BACKUP_DIR" -name "db_*.sql" -mtime +7 -delete
find "$BACKUP_DIR" -name "uploads_*.tar.gz" -mtime +7 -delete
echo -e "${GREEN}✓ Cleanup completed${NC}"

echo ""
echo "Backup finished at $(date)"
