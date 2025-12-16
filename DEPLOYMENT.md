# CoachHub Baseball - Deployment Guide

This guide covers deploying CoachHub Baseball to production environments.

---

## 🌐 Production Deployment Options

### Option 1: Self-Hosted Server (Recommended)

**Requirements:**
- Ubuntu 20.04+ or similar Linux distribution
- 4GB RAM minimum (8GB recommended)
- 20GB disk space
- Docker and Docker Compose installed
- Domain name (optional but recommended)

#### Step-by-Step Deployment

1. **Prepare the server**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh

   # Install Docker Compose
   sudo apt install docker-compose-plugin -y

   # Add your user to docker group
   sudo usermod -aG docker $USER
   newgrp docker
   ```

2. **Clone the application**
   ```bash
   cd /opt
   sudo git clone <your-repo-url> coachhub
   sudo chown -R $USER:$USER coachhub
   cd coachhub
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   nano .env
   ```

   **Production settings:**
   ```bash
   # Database
   DATABASE_URL="postgresql://coach:STRONG_PASSWORD_HERE@db:5432/coachhub?schema=public"
   DB_PASSWORD="STRONG_PASSWORD_HERE"

   # NextAuth
   NEXTAUTH_URL="https://yourdomain.com:7373"
   NEXTAUTH_SECRET="$(openssl rand -base64 32)"

   # Admin
   ADMIN_EMAIL="your-email@example.com"
   ADMIN_PASSWORD="ChooseAStrongPassword123!"
   TEAM_NAME="Your Team Name"

   # Weather (optional)
   WEATHER_API_KEY="your-api-key-from-openweathermap.org"

   # Production
   NODE_ENV="production"
   ```

4. **Configure firewall**
   ```bash
   # Allow SSH
   sudo ufw allow 22/tcp

   # Allow application port (main)
   sudo ufw allow 7373/tcp

   # Allow Traefik dashboard (optional, for monitoring)
   sudo ufw allow 9090/tcp

   # Enable firewall
   sudo ufw enable
   ```

5. **Start the application**
   ```bash
   docker compose up -d --build
   ```

6. **Initialize database**
   ```bash
   docker compose exec app npx prisma generate
   docker compose exec app npx prisma db push
   docker compose exec app npx tsx scripts/setup-admin.ts
   ```

7. **Verify deployment**
   ```bash
   # Check container status
   docker compose ps

   # Check logs
   docker compose logs -f app

   # Test access
   curl http://localhost:7373
   ```

8. **Access the application**
   - Navigate to `http://YOUR_SERVER_IP:7373`
   - Or `https://yourdomain.com:7373` if using a domain

---

### Option 2: VPS Providers (DigitalOcean, Linode, Vultr)

**Recommended Specs:**
- 2 vCPUs
- 4GB RAM
- 80GB SSD
- Ubuntu 22.04 LTS

**Estimated Cost:** $12-24/month

#### DigitalOcean Deployment

1. Create a Droplet:
   - Choose Ubuntu 22.04
   - Select Regular plan (4GB RAM)
   - Add SSH keys
   - Create Droplet

2. Follow "Self-Hosted Server" steps above

3. Configure domain (optional):
   - Add A record pointing to droplet IP
   - Update NEXTAUTH_URL in .env
   - Configure Traefik for automatic SSL

---

### Option 3: Home Server / NAS

**Ideal for:**
- Teams wanting complete data control
- No ongoing hosting costs
- Local network access primarily

**Requirements:**
- Synology NAS with Docker support, or
- Dedicated home server running Linux
- Static IP or Dynamic DNS
- Port forwarding on router

#### Setup Steps

1. Install Docker on your NAS/server
2. Clone the repository
3. Configure `.env` with local settings
4. Set up port forwarding (7373) on your router
5. Configure Dynamic DNS if needed
6. Deploy with `docker compose up -d`

---

## 🔐 SSL/HTTPS Configuration

### Note on HTTPS

This application is designed to run on uncommon ports (7373) to avoid conflicts with other services on your host.

**For HTTPS/SSL in production:**

1. **Option 1: External Reverse Proxy**
   - Use an existing nginx/Caddy/Traefik on your host
   - Proxy HTTPS traffic to `http://localhost:7373`
   - This is the recommended approach for multi-app hosts

2. **Option 2: Direct SSL (Advanced)**
   - Modify Traefik configuration to add certificate support
   - Use Let's Encrypt DNS challenge (not HTTP challenge)
   - This avoids needing ports 80/443

3. **Option 3: Internal Network Only**
   - Keep the application on port 7373 without SSL
   - Use VPN or firewall rules to restrict access
   - Suitable for internal team use

**Example nginx proxy (if you have nginx on your host):**
```nginx
server {
    listen 443 ssl;
    server_name baseball.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:7373;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📊 Monitoring & Maintenance

### Health Checks

The application includes a health check endpoint:

```bash
curl http://localhost:7373/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-19T12:00:00.000Z",
  "services": {
    "database": "up",
    "redis": "up"
  }
}
```

### Log Management

**View logs:**
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f db

# Last 100 lines
docker compose logs --tail=100 app
```

**Log rotation:**
Configure in `/etc/docker/daemon.json`:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### Automated Backups

**Daily backup cron job:**
```bash
# Edit crontab
crontab -e

# Add line for 2 AM daily backup
0 2 * * * cd /opt/coachhub && ./scripts/backup.sh >> /var/log/coachhub-backup.log 2>&1
```

**Backup to remote storage:**
```bash
# Example: Backup to AWS S3
aws s3 sync ./backups/ s3://your-bucket/coachhub-backups/

# Example: Backup to another server via rsync
rsync -avz ./backups/ backup-server:/backups/coachhub/
```

### Updates

**Updating the application:**
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose down
docker compose up -d --build

# Run any new migrations
docker compose exec app npx prisma migrate deploy
```

---

## 🔍 Performance Optimization

### Database Optimization

1. **Regular maintenance:**
   ```bash
   docker compose exec db psql -U coach -d coachhub -c "VACUUM ANALYZE;"
   ```

2. **Monitor query performance:**
   ```bash
   docker compose exec app npx prisma studio
   ```

### Application Optimization

1. **Enable Redis caching** (included in docker-compose.yml)

2. **Adjust Node.js memory** in `docker-compose.yml`:
   ```yaml
   environment:
     - NODE_OPTIONS="--max-old-space-size=2048"
   ```

3. **Database connection pooling** is configured in Prisma automatically

---

## 🛡️ Security Hardening

### Production Security Checklist

- [ ] Changed default admin password
- [ ] Strong database password set
- [ ] NEXTAUTH_SECRET is random and secure
- [ ] Firewall configured (only required ports open)
- [ ] HTTPS enabled with valid certificate
- [ ] Regular security updates scheduled
- [ ] Backup strategy implemented
- [ ] Monitoring/alerting configured
- [ ] Access logs reviewed regularly
- [ ] Rate limiting enabled
- [ ] File upload limits configured

### Firewall Configuration

**UFW (Ubuntu):**
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 7373/tcp     # Main application
sudo ufw allow 9090/tcp     # Traefik dashboard (optional)
sudo ufw enable
```

**iptables:**
```bash
# Allow established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow SSH
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Allow application
iptables -A INPUT -p tcp --dport 7373 -j ACCEPT

# Allow Traefik dashboard (optional)
iptables -A INPUT -p tcp --dport 9090 -j ACCEPT

# Drop everything else
iptables -A INPUT -j DROP
```

---

## 📈 Scaling Considerations

### Vertical Scaling

For larger teams (50+ players, 100+ games/season):

**Recommended specs:**
- 4 vCPUs
- 8GB RAM
- 100GB SSD

**Database tuning:**
```yaml
db:
  environment:
    - POSTGRES_MAX_CONNECTIONS=100
    - POSTGRES_SHARED_BUFFERS=256MB
```

### Horizontal Scaling

For multiple teams or organizations:

1. Use external PostgreSQL (AWS RDS, Google Cloud SQL)
2. Deploy multiple app instances behind a load balancer
3. Use shared Redis for session storage
4. Implement S3-compatible storage for uploads

---

## 🔄 Disaster Recovery

### Backup Strategy

**What to backup:**
1. PostgreSQL database
2. Uploads directory
3. Environment configuration (.env)
4. SSL certificates (if custom)

**Backup schedule:**
- Daily automated backups
- Weekly full system backup
- Monthly off-site backup

**Testing restores:**
```bash
# Test restore monthly
./scripts/restore.sh LATEST_BACKUP_TIMESTAMP

# Verify data integrity
docker compose exec app npx prisma studio
```

### Recovery Procedures

**Complete system failure:**
1. Provision new server
2. Install Docker and Docker Compose
3. Clone application repository
4. Restore .env file
5. Run restore script
6. Start application

**Estimated recovery time:** 15-30 minutes

---

## 📞 Support & Troubleshooting

### Common Issues

**Container won't start:**
```bash
docker compose logs app
docker compose down
docker compose up -d --build
```

**Database connection issues:**
```bash
docker compose restart db
docker compose exec app npx prisma db push
```

**Out of disk space:**
```bash
# Clean Docker images
docker system prune -a

# Check disk usage
df -h
du -sh /var/lib/docker
```

**Memory issues:**
```bash
# Check memory usage
free -h
docker stats

# Restart containers
docker compose restart
```

---

## 📋 Post-Deployment Checklist

After deployment, verify:

- [ ] Application accessible at configured URL
- [ ] Can login with admin credentials
- [ ] All modules load (Schedule, Roster, Travel, etc.)
- [ ] File uploads work
- [ ] Database queries are fast
- [ ] Backups are running
- [ ] SSL certificate is valid
- [ ] Email notifications work (if configured)
- [ ] Weather API is functioning
- [ ] Mobile access works properly

---

**Deployment Guide Version:** 1.0.0
**Last Updated:** November 19, 2025
