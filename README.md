# CoachHub (Travel-Coach) Baseball

**Version 1.0.0** | Complete Travel Baseball Team Management Platform

CoachHub is a self-hosted web application and native iOS app that serves as the central nervous system for competitive travel baseball teams. It eliminates scattered spreadsheets, GroupMe threads, and paper line-up cards by consolidating everything a coach needs into one secure, fast, and easy-to-use platform.

---

## Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Deployment Guide](#-deployment-guide)
- [Cloudflare Tunnel Setup](#-cloudflare-tunnel-setup)
- [iOS App](#-ios-app)
- [Usage Guide](#-usage-guide)
- [Docker Management](#-docker-management)
- [Backup & Restore](#-backup--restore)
- [Configuration](#-configuration)
- [User Roles](#-user-roles)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)

---

## Features

### Core Modules

- **Schedule & Calendar** - Full calendar with practices, games, tournaments, and events
- **Roster Management** - Player profiles with photos, stats, and historical performance
- **Travel Planning** - Tournament logistics, hotel coordination, carpools, and budgets
- **Game Tracking** - Score tracking and mobile-friendly stat entry
- **Document Management** - Secure storage for insurance, medical forms, and certificates
- **Announcements** - Team-wide communication with priority levels
- **Statistics** - Comprehensive hitting, pitching, and fielding stats with calculations
- **Push Notifications** - Event reminders and urgent announcements (iOS)

### Key Capabilities

- **Native iOS App** - Full-featured SwiftUI app with Apple Sign In
- **Authentication & Security** - Role-based access control with Apple Sign In support
- **Mobile-Optimized** - Responsive design for use at the field
- **Weather Integration** - 72-hour forecasts for outdoor events
- **PDF Export** - Rosters, itineraries, and reports
- **Backup & Restore** - Automated database and file backups
- **Docker Deployment** - Single-command deployment

---

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- 4GB+ RAM available
- A domain name (for production with Cloudflare Tunnel)

### Installation

```bash
# Clone the repository
git clone https://gitea.my-house.dev/joe/CoachHub.git
cd CoachHub

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Build and start
docker compose up -d --build
```

Access at `http://localhost:7373`

---

## Deployment Guide

### Step 1: Server Preparation

On your host server (Ubuntu/Debian example):

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

### Step 2: Clone and Configure

```bash
# Clone the repository
git clone https://gitea.my-house.dev/joe/CoachHub.git
cd CoachHub

# Create environment file
cp .env.example .env
```

### Step 3: Configure Environment Variables

Edit `.env` with your settings:

```bash
nano .env
```

**Required Configuration:**

```env
# Database
DATABASE_URL="postgresql://coach:YOUR_SECURE_PASSWORD@db:5432/coachhub?schema=public"
DB_PASSWORD="YOUR_SECURE_PASSWORD"

# NextAuth - CRITICAL: Generate a secure secret
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# App Configuration
NODE_ENV="production"

# Firebase (for iOS push notifications)
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Cron job authentication
CRON_SECRET="generate-a-random-secret-here"

# Optional
WEATHER_API_KEY="your-openweathermap-api-key"
GEMINI_API_KEY="your-gemini-api-key"
```

**Generate secrets:**

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate CRON_SECRET
openssl rand -hex 32
```

### Step 4: Build and Start

```bash
# Build and start all services
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f app
```

### Step 5: Verify Deployment

```bash
# Test health endpoint
curl http://localhost:7373/api/health

# Check all containers are running
docker compose ps
```

---

## Cloudflare Tunnel Setup

Cloudflare Tunnels provide secure HTTPS access to your self-hosted CoachHub without opening firewall ports or managing SSL certificates.

### Prerequisites

- A Cloudflare account (free tier works)
- A domain name managed by Cloudflare DNS

### Step 1: Install cloudflared

On your host server:

```bash
# Download cloudflared
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb

# Install
sudo dpkg -i cloudflared.deb

# Verify installation
cloudflared --version
```

### Step 2: Authenticate with Cloudflare

```bash
cloudflared tunnel login
```

This opens a browser to authenticate. Select your domain.

### Step 3: Create a Tunnel

```bash
# Create tunnel (replace 'coachhub' with your preferred name)
cloudflared tunnel create coachhub

# Note the Tunnel ID displayed (e.g., a1b2c3d4-e5f6-...)
```

### Step 4: Configure the Tunnel

Create the config file:

```bash
mkdir -p ~/.cloudflared
nano ~/.cloudflared/config.yml
```

Add this configuration:

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/YOUR_USER/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: coach.your-domain.com
    service: http://localhost:7373
  - service: http_status:404
```

Replace:
- `YOUR_TUNNEL_ID` with your tunnel ID from Step 3
- `YOUR_USER` with your Linux username
- `coach.your-domain.com` with your desired subdomain

### Step 5: Create DNS Record

```bash
cloudflared tunnel route dns coachhub coach.your-domain.com
```

### Step 6: Run as a Service

```bash
# Install as system service
sudo cloudflared service install

# Start the service
sudo systemctl start cloudflared

# Enable on boot
sudo systemctl enable cloudflared

# Check status
sudo systemctl status cloudflared
```

### Step 7: Update .env

Update your `.env` file with the public URL:

```env
NEXTAUTH_URL="https://coach.your-domain.com"
```

Then restart the app:

```bash
docker compose restart app
```

### Verify Tunnel

```bash
# Check tunnel status
cloudflared tunnel info coachhub

# Test public access
curl https://coach.your-domain.com/api/health
```

### Cloudflare Tunnel Commands Reference

```bash
# List tunnels
cloudflared tunnel list

# Check tunnel status
cloudflared tunnel info <tunnel-name>

# View tunnel logs
sudo journalctl -u cloudflared -f

# Restart tunnel
sudo systemctl restart cloudflared

# Delete tunnel (if needed)
cloudflared tunnel delete <tunnel-name>
```

---

## iOS App

The iOS app is located in the `ios/CoachHub` directory.

### Building the iOS App

1. Open `ios/CoachHub/CoachHub.xcodeproj` in Xcode
2. Update the signing team in Signing & Capabilities
3. Update `Config.swift` with your API URL:
   ```swift
   static let apiBaseURL = "https://coach.your-domain.com/api"
   ```
4. Build and run on device or simulator

### App Store Submission

See `APP_STORE.md` for complete App Store submission guide including:
- App Store Connect setup
- Privacy questionnaire answers
- App description and keywords
- TestFlight configuration

### Push Notifications Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Add an iOS app with your bundle ID
3. Download `GoogleService-Info.plist` and add to Xcode project
4. Create APNs key in Apple Developer Portal
5. Upload APNs key to Firebase Cloud Messaging settings
6. Add Firebase credentials to your `.env` file

---

## Usage Guide

### Initial Setup

1. Access your CoachHub instance
2. Sign in with Apple (iOS) or create an account
3. Create or join a team
4. Add players to your roster
5. Create your first event in the Schedule

### Daily Operations

#### Adding a Player
1. Navigate to **Roster**
2. Click **Add Player**
3. Fill in player information (name, jersey, positions, etc.)
4. Add parent contact information
5. Save

#### Scheduling Events
1. Navigate to **Schedule**
2. Click **Add Event** or click on a date
3. Select event type (Practice, Game, Tournament, etc.)
4. Fill in details (time, location, opponent)
5. Save

#### Planning a Tournament
1. Navigate to **Travel**
2. Click **Add Tournament**
3. Fill in tournament details and budget
4. Add carpools in the tournament detail page
5. Track expenses as they occur

---

## Docker Management

### Common Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f app

# Restart app only
docker compose restart app

# Rebuild after code changes
docker compose up -d --build

# View container status
docker compose ps

# Execute command in container
docker compose exec app npx prisma studio
```

### Updating

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker compose up -d --build
```

---

## Backup & Restore

### Creating a Backup

```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

Backups are stored in `./backups/` directory.

### Restoring from Backup

```bash
chmod +x scripts/restore.sh
./scripts/restore.sh <TIMESTAMP>
```

### Automated Backups

Add to crontab for daily backups at 2 AM:

```bash
crontab -e
```

Add this line:

```
0 2 * * * cd /path/to/CoachHub && ./scripts/backup.sh >> /var/log/coachhub-backup.log 2>&1
```

---

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `NEXTAUTH_URL` | Public application URL | Yes |
| `NEXTAUTH_SECRET` | NextAuth encryption key | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID | For push notifications |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | For push notifications |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | For push notifications |
| `CRON_SECRET` | Secret for cron job auth | For scheduled notifications |
| `WEATHER_API_KEY` | OpenWeatherMap API key | Optional |
| `GEMINI_API_KEY` | Google Gemini API key | For document parsing |

### Port Configuration

Default port is **7373** (BASEBALL on phone keypad).

To change, edit `docker-compose.yml`:

```yaml
ports:
  - "YOUR_PORT:3000"
```

---

## User Roles

| Role | Permissions |
|------|-------------|
| **Head Coach** | Full administrative access |
| **Assistant Coach** | View/edit most data, enter stats |
| **Team Manager** | Focus on travel and logistics |
| **Parent** | Read-only schedule, RSVP |
| **Player** | View personal stats and schedule |

---

## Development

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL 16
- **Authentication**: NextAuth.js with Apple Sign In
- **iOS**: SwiftUI, Swift 5
- **Deployment**: Docker Compose

### Local Development

```bash
# Install dependencies
npm install

# Set up database
npm run db:generate
npm run db:push

# Run development server
npm run dev
```

Access at `http://localhost:3000`

### Database Commands

```bash
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:migrate   # Create migration
npm run db:studio    # Open Prisma Studio
```

---

## Troubleshooting

### Application won't start

```bash
# Check Docker status
docker compose ps

# View logs
docker compose logs app

# Rebuild
docker compose down && docker compose up -d --build
```

### Database connection errors

```bash
# Check database logs
docker compose logs db

# Restart database
docker compose restart db
```

### Cloudflare Tunnel not working

```bash
# Check tunnel service
sudo systemctl status cloudflared

# View tunnel logs
sudo journalctl -u cloudflared -f

# Restart tunnel
sudo systemctl restart cloudflared
```

### iOS app connection issues

1. Verify `Config.swift` has correct API URL
2. Check Cloudflare tunnel is running
3. Verify HTTPS certificate is valid
4. Check server logs for errors

### Docker build out of memory (OOM)

If you see "JavaScript heap out of memory" during `docker compose up --build`, your VM needs more memory. The Dockerfile is optimized for 2GB+ RAM, but you can add swap space to use disk as virtual memory:

```bash
# Check current swap
free -h

# Create 4GB swap file (adjust size as needed)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent (add to /etc/fstab)
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
```

After adding swap, retry the build:

```bash
docker compose up -d --build
```

**Minimum Requirements:**
- 2GB RAM + 2GB swap (builds slowly but works)
- 4GB RAM recommended for faster builds

**Alternative: Build Locally, Push Image**

If your VM is resource-constrained, build on your local machine and push to a registry:

```bash
# Build locally
docker build -t your-registry/coachhub:latest .

# Push to registry
docker push your-registry/coachhub:latest

# On VM, pull and run
docker compose pull
docker compose up -d
```

---

## Project Structure

```
CoachHub/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   ├── dashboard/          # Dashboard pages
│   └── (public)/           # Public pages (privacy, terms)
├── components/             # React components
├── lib/                    # Utility libraries
├── prisma/                 # Database schema
├── ios/                    # iOS app (SwiftUI)
│   └── CoachHub/
├── scripts/                # Utility scripts
├── docker-compose.yml      # Docker configuration
├── Dockerfile              # Container image
├── .env.example            # Environment template
├── APP_STORE.md            # App Store submission guide
└── README.md               # This file
```

---

## Legal Pages

- **Privacy Policy**: `/privacy`
- **Terms of Service**: `/terms`

These are required for App Store submission and are accessible at your domain.

---

## Support

- Review this README for common issues
- Check application logs: `docker compose logs -f app`
- For iOS issues, check Xcode console output

---

## License

This project is private and proprietary. All rights reserved.

---

**Version:** 1.0.0
**Last Updated:** December 2025
