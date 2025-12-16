#!/bin/bash

# CoachHub Baseball - Restore Script
# This script restores the PostgreSQL database and uploads directory from backup

set -e

# Configuration
DB_CONTAINER="coachhub-db"
DB_NAME="coachhub"
DB_USER="coach"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

if [ -z "$1" ]; then
    echo -e "${RED}Usage: ./restore.sh <backup_timestamp>${NC}"
    echo "Example: ./restore.sh 20250119_120000"
    echo ""
    echo "Available backups:"
    ls -1 backups/db_*.sql 2>/dev/null | sed 's/backups\/db_//g' | sed 's/.sql//g' || echo "No backups found"
    exit 1
fi

TIMESTAMP=$1
BACKUP_DIR="./backups"
DB_BACKUP="$BACKUP_DIR/db_$TIMESTAMP.sql"
UPLOAD_BACKUP="$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz"

echo -e "${GREEN}CoachHub Baseball - Restore Script${NC}"
echo "Restoring backup from $TIMESTAMP"
echo ""

# Check if database backup exists
if [ ! -f "$DB_BACKUP" ]; then
    echo -e "${RED}✗ Database backup not found: $DB_BACKUP${NC}"
    exit 1
fi

# Restore PostgreSQL database
echo -e "${YELLOW}Restoring PostgreSQL database...${NC}"
docker exec -i $DB_CONTAINER psql -U $DB_USER $DB_NAME < "$DB_BACKUP"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database restore completed${NC}"
else
    echo -e "${RED}✗ Database restore failed${NC}"
    exit 1
fi

# Restore uploads directory
if [ -f "$UPLOAD_BACKUP" ]; then
    echo -e "${YELLOW}Restoring uploads directory...${NC}"
    rm -rf ./uploads
    tar -xzf "$UPLOAD_BACKUP"
    echo -e "${GREEN}✓ Uploads restore completed${NC}"
else
    echo -e "${YELLOW}! No uploads backup found, skipping${NC}"
fi

echo ""
echo -e "${GREEN}Restore completed successfully!${NC}"
echo "Restore finished at $(date)"
