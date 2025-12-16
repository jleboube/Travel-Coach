# CoachHub Baseball ⚾

**Version 1.0.0** | Complete Travel Baseball Team Management Platform

CoachHub Baseball is a self-hosted web application that serves as the central nervous system for competitive travel baseball teams. It eliminates scattered spreadsheets, GroupMe threads, and paper line-up cards by consolidating everything a coach needs into one secure, fast, and easy-to-use platform.

---

## 🎯 Features

### Core Modules

- **📅 Schedule & Calendar** - Full calendar with practices, games, tournaments, and events
- **👥 Roster Management** - Player profiles with photos, stats, and historical performance
- **✈️ Travel Planning** - Tournament logistics, hotel coordination, carpools, and budgets
- **🏆 Game Tracking** - Score tracking and mobile-friendly stat entry
- **📁 Document Management** - Secure storage for insurance, medical forms, and certificates
- **📢 Announcements** - Team-wide communication with priority levels
- **📊 Statistics** - Comprehensive hitting, pitching, and fielding stats with calculations

### Key Capabilities

- **Authentication & Security** - Role-based access control (Head Coach, Assistant Coach, Team Manager)
- **Mobile-Optimized** - Responsive design for use at the field
- **Weather Integration** - 72-hour forecasts for outdoor events
- **PDF Export** - Rosters, itineraries, and reports
- **Backup & Restore** - Automated database and file backups
- **Docker Deployment** - Single-command deployment on port 7373

---

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- 4GB+ RAM available
- Port 7373 available (main app)
- Port 9090 available (optional Traefik dashboard)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url> travel-coach
   cd travel-coach
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Edit .env file** with your configuration:
   ```bash
   nano .env
   ```

   Required changes:
   - `DB_PASSWORD` - Set a strong database password
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `ADMIN_EMAIL` - Your email address
   - `ADMIN_PASSWORD` - Your admin password
   - `WEATHER_API_KEY` - (Optional) Get free key from openweathermap.org

4. **Build and start the application**
   ```bash
   docker compose up -d --build
   ```

5. **Initialize the database and create admin user**
   ```bash
   docker compose exec app npx prisma generate
   docker compose exec app npx prisma db push
   docker compose exec app npx tsx scripts/setup-admin.ts
   ```

6. **Access the application**
   - Open your browser to `http://localhost:7373`
   - Login with the credentials shown in the setup script output
   - Default: `admin@coachhub.com` / `admin123`

---

## 📖 Usage Guide

### Initial Setup

1. **Login** with your admin credentials
2. **Change your password** in Settings
3. **Configure team settings** (team name, colors, season)
4. **Add players** to your roster
5. **Create your first event** in the Schedule

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

#### Entering Game Stats
1. Navigate to **Games**
2. Find the game and click **Enter Stats**
3. Select each player and enter their statistics
4. Stats are automatically aggregated to season totals

#### Planning a Tournament
1. Navigate to **Travel**
2. Click **Add Tournament**
3. Fill in tournament details and budget
4. Add carpools in the tournament detail page
5. Track expenses as they occur
6. Export itinerary PDF for parents

---

## 🐳 Docker Management

### Start the application
```bash
docker compose up -d
```

### Stop the application
```bash
docker compose down
```

### View logs
```bash
docker compose logs -f app
```

### Restart after changes
```bash
docker compose restart app
```

### Complete rebuild
```bash
docker compose down
docker compose up -d --build
```

---

## 💾 Backup & Restore

### Creating a Backup

Run the backup script:
```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

Backups are stored in `./backups/` directory:
- `db_TIMESTAMP.sql` - Database backup
- `uploads_TIMESTAMP.tar.gz` - Files backup

Backups are automatically retained for 7 days.

### Restoring from Backup

```bash
chmod +x scripts/restore.sh
./scripts/restore.sh <TIMESTAMP>
```

Example:
```bash
./scripts/restore.sh 20250119_120000
```

### Automated Backups

Add to crontab for daily backups at 2 AM:
```bash
0 2 * * * cd /path/to/travel-coach && ./scripts/backup.sh >> /var/log/coachhub-backup.log 2>&1
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://coach:***@db:5432/coachhub` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:7373` |
| `NEXTAUTH_SECRET` | NextAuth encryption key | (required) |
| `DB_PASSWORD` | Database password | (required) |
| `WEATHER_API_KEY` | OpenWeatherMap API key | (optional) |
| `ADMIN_EMAIL` | Admin user email | `admin@coachhub.com` |
| `ADMIN_PASSWORD` | Admin user password | `admin123` |
| `TEAM_NAME` | Your team name | `My Baseball Team` |

### Port Configuration

The application uses **uncommon ports** to avoid conflicts with other services:

- **7373** - Main application (BASEBALL on a phone keypad)
- **9090** - Traefik dashboard (optional monitoring)

These ports are intentionally obscure to:
- Avoid conflicts with common services (nginx, apache, other apps)
- Run alongside other Docker applications
- Provide additional security through obscurity

To change ports, edit `docker-compose.yml`:
```yaml
ports:
  - "YOUR_PORT:7373"    # Main app
  - "YOUR_DASHBOARD_PORT:8080"    # Traefik dashboard
```

---

## 👥 User Roles

### Head Coach
- Full administrative access
- Manage all team data
- Post announcements
- View all statistics

### Assistant Coach
- View and edit most data
- Enter game statistics
- Post announcements
- Limited administrative functions

### Team Manager
- Focus on travel and logistics
- Manage tournaments and carpools
- Track expenses
- View team information

### Parent (Future)
- Read-only access to schedule
- RSVP to events
- View own player's statistics

### Player (Future)
- View personal statistics
- View team schedule
- Limited profile updates

---

## 🛠️ Development

### Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 16 with Prisma ORM
- **Authentication**: NextAuth.js
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **Calendar**: FullCalendar
- **Charts**: Recharts
- **Deployment**: Docker Compose with Traefik reverse proxy

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up database:
   ```bash
   npm run db:generate
   npm run db:push
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Access at `http://localhost:3000`

### Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Create migration
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

---

## 📁 Project Structure

```
travel-coach/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── announcements/    # Announcements API
│   │   ├── documents/        # Documents API
│   │   ├── events/           # Events/Schedule API
│   │   ├── games/            # Games API
│   │   ├── players/          # Players/Roster API
│   │   └── tournaments/      # Tournaments/Travel API
│   ├── dashboard/            # Dashboard pages
│   │   ├── announcements/    # Announcements page
│   │   ├── documents/        # Documents page
│   │   ├── games/            # Games pages
│   │   ├── roster/           # Roster pages
│   │   ├── schedule/         # Schedule page
│   │   └── travel/           # Travel pages
│   ├── login/                # Login page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── announcements/        # Announcement components
│   ├── dashboard/            # Dashboard components
│   ├── documents/            # Document components
│   ├── games/                # Game components
│   ├── providers/            # Context providers
│   ├── roster/               # Roster components
│   ├── schedule/             # Schedule components
│   ├── travel/               # Travel components
│   └── ui/                   # shadcn/ui components
├── lib/                      # Utility libraries
│   ├── auth.ts               # NextAuth configuration
│   ├── db.ts                 # Prisma client
│   ├── utils.ts              # Helper functions
│   └── weather.ts            # Weather API integration
├── prisma/                   # Database
│   └── schema.prisma         # Database schema
├── scripts/                  # Utility scripts
│   ├── backup.sh             # Backup script
│   ├── restore.sh            # Restore script
│   └── setup-admin.ts        # Admin setup script
├── uploads/                  # File storage
├── docker-compose.yml        # Docker configuration
├── Dockerfile                # Container image
├── .env.example              # Environment template
└── README.md                 # This file
```

---

## 🔒 Security

### Built-in Security Features

- **Authentication Required** - All routes protected by NextAuth.js
- **Role-Based Access Control** - User permissions by role
- **Encrypted Passwords** - bcrypt hashing
- **Secure Sessions** - JWT-based sessions
- **File Upload Validation** - Type and size restrictions
- **SQL Injection Protection** - Prisma ORM parameterized queries
- **HTTPS Support** - Traefik with Let's Encrypt
- **Rate Limiting Ready** - Middleware support included

### Security Best Practices

1. **Change default admin password** immediately after setup
2. **Use strong database password** in production
3. **Keep NEXTAUTH_SECRET secure** and never commit to git
4. **Enable HTTPS** in production with proper SSL certificates
5. **Regularly update dependencies** with `npm update`
6. **Restrict network access** to port 7373 via firewall
7. **Regular backups** of database and files
8. **Monitor logs** for suspicious activity

---

## 🐛 Troubleshooting

### Application won't start

```bash
# Check Docker status
docker ps

# View logs
docker compose logs app

# Rebuild containers
docker compose down
docker compose up -d --build
```

### Database connection errors

```bash
# Check database container
docker compose logs db

# Restart database
docker compose restart db

# Regenerate Prisma client
docker compose exec app npx prisma generate
```

### Login issues

```bash
# Reset admin password
docker compose exec app npx tsx scripts/setup-admin.ts
```

### Port 7373 already in use

```bash
# Find what's using the port
lsof -i :7373

# Stop the conflicting service or change port in docker-compose.yml
```

---

## 📊 Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - Authentication and user management
- **players** - Player roster information
- **player_stats** - Season statistics by player
- **game_player_stats** - Game-by-game statistics
- **events** - Schedule events (practices, games, etc.)
- **tournaments** - Tournament information
- **carpools** - Tournament carpool coordination
- **tournament_expenses** - Tournament expense tracking
- **games** - Game results and scores
- **documents** - File metadata
- **announcements** - Team announcements
- **team_config** - Team configuration

See `prisma/schema.prisma` for complete schema.

---

## 🎓 Support & Contributing

### Getting Help

- Review this README thoroughly
- Check the [Issues](issues) page for known problems
- Review application logs for error messages

### Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 🏆 Credits

Built with ❤️ for travel baseball coaches who deserve better tools.

**Technologies Used:**
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [FullCalendar](https://fullcalendar.io/)
- [Docker](https://www.docker.com/)

---

**Version:** 1.0.0
**Port:** 7373 (BASEBALL)
**Last Updated:** November 19, 2025
