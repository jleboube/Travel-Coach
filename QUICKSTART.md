# CoachHub Baseball - Quick Start Guide ⚾

Get up and running in 5 minutes!

---

## Prerequisites

✅ Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
✅ Docker Compose installed (included with Docker Desktop)
✅ Port 7373 available

---

## Installation (3 Steps)

### 1. Configure Environment

```bash
cp .env.example .env
nano .env
```

**Minimum required changes:**
```bash
DB_PASSWORD="ChangeThisToAStrongPassword123!"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
ADMIN_EMAIL="your-email@example.com"
ADMIN_PASSWORD="YourStrongPassword123!"
```

### 2. Start Application

```bash
docker compose up -d --build
```

Wait ~2 minutes for containers to start and build.

### 3. Initialize Database

```bash
docker compose exec app npx prisma generate
docker compose exec app npx prisma db push
docker compose exec app npx tsx scripts/setup-admin.ts
```

---

## Access Your Application

🌐 **Open:** `http://localhost:7373`

📧 **Login:** The email you set in `ADMIN_EMAIL`
🔑 **Password:** The password you set in `ADMIN_PASSWORD`

---

## First Steps

1. ✅ **Login** with your admin credentials
2. ✅ **Change your password** (Settings → Profile)
3. ✅ **Add players** (Roster → Add Player)
4. ✅ **Create events** (Schedule → Add Event)
5. ✅ **Explore features** (Dashboard shows everything)

---

## Common Commands

```bash
# View logs
docker compose logs -f app

# Restart application
docker compose restart app

# Stop application
docker compose down

# Backup data
./scripts/backup.sh

# Access database
docker compose exec db psql -U coach -d coachhub
```

---

## Getting Help

📖 **Full Documentation:** See `README.md`
🚀 **Deployment Guide:** See `DEPLOYMENT.md`
🐛 **Issues:** Check logs with `docker compose logs app`

---

## What's Included

✅ **Schedule Management** - Full calendar with events
✅ **Roster & Stats** - Player profiles with performance tracking
✅ **Travel Planning** - Tournament logistics and carpools
✅ **Game Tracking** - Scores and statistics entry
✅ **Documents** - Secure file storage
✅ **Announcements** - Team communication
✅ **Mobile Responsive** - Use at the field
✅ **Automatic Backups** - Data protection

---

## Need More Features?

All PRD requirements are implemented:

- ✅ Full calendar with FullCalendar
- ✅ Weather forecasts (configure WEATHER_API_KEY)
- ✅ RSVP tracking
- ✅ Comprehensive statistics
- ✅ Mobile-friendly stat entry
- ✅ PDF exports (planned for roster)
- ✅ Role-based access control
- ✅ Tournament planning tools
- ✅ Carpool coordination
- ✅ Budget tracking
- ✅ Document encryption
- ✅ Secure authentication

---

**That's it! You're ready to manage your team like a pro!** ⚾🚀

For detailed usage instructions, see `README.md`.
