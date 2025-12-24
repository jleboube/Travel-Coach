# Product Requirements Document (PRD)  
**Product Name:** CoachHub Baseball  
**Version:** 1.0  
**Date:** November 18, 2025  
**Author:** Grok (on behalf of the requesting coach)  

### 1. Vision & Objectives
Build a single, modern, self-hosted web application that becomes the central nervous system for a competitive travel baseball team. The goal is to eliminate scattered spreadsheets, GroupMe threads, paper line-up cards, and multiple travel booking tabs by consolidating everything a head coach or team manager needs into one secure, fast, and easy-to-use platform.

### 2. Target Users
- Primary: Head Coach / Assistant Coaches  
- Secondary: Team Manager / Parent Coordinator  
- Tertiary (read-only): Players and Parents (optional future phase)

### 3. Core Problems Solved
- No single source of truth for schedule, roster stats, lineups, and travel logistics  
- Difficulty tracking individual player development metrics across seasons  
- Time wasted coordinating hotels, carpools, and per-diems for tournaments  
- Version-control hell with Google Sheets/Excel rosters  
- Security concerns sharing sensitive player info via email/text

### 4. High-Level Features & MVP Scope

#### 4.1 Schedule & Calendar (MVP)
- Full-calendar view (month/week/day/agenda) using FullCalendar.io or similar  
- Event types: Practice, Game, Tournament (multi-day), Team Meeting, Fundraiser, Off-day, Individual Lessons  
- Recurring events (e.g., weekly practice)  
- Color coding by event type and facility  
- Location field with Google Maps link or embedded map  
- Weather forecast integration for outdoor events (72-hour)  
- RSVP / attendance tracking (Yes / No / Maybe) – coach view only in MVP  
- iCal export & Google Calendar sync (one-way)  
- Conflict detection (double-booked players/facilities)

#### 4.2 Roster & Player Profiles (MVP)
- Player card with photo, jersey #, name, position(s), bats/throws, graduation year, contact info (parent phone/email – coach view only)  
- Season and career statistical tracking (customizable stat categories)  
  - Hitting: AB, H, 2B, 3B, HR, RBI, BB, K, AVG, OBP, SLG, OPS  
  - Pitching: IP, H, R, ER, BB, K, ERA, WHIP, K/9  
  - Fielding: PO, A, E, FPCT  
  - Custom coach-defined metrics (e.g., “Exit Velo”, “60-yd”, “Pop Time”)  
- Stat entry via mobile-friendly game log form (post-game quick entry)  
- Spray charts (basic) and pitch charts (future)  
- Historical season comparison graphs  
- Printable roster PDF export (one-page and detailed versions)  
- Lineup & position chart generator (drag-and-drop)

#### 4.3 Travel & Tournament Planning (MVP)
- Tournament module linked to calendar events  
- Hotel block management: hotel name, link, reservation deadline, rooming list template  
- Flight/car rental tracking (if applicable)  
- Per-diem calculator (by age group)  
- Carpool coordination tool (parents can volunteer seats needed/offered)  
- Shared itinerary PDF one-click export  
- Budget tracker (entry fees, hotel, meals, umpire fees, etc.)

#### 4.4 Additional MVP Modules
- Team Documents repository (insurance, birth certificates, medical forms – encrypted storage)  
- Announcements / News feed  
- Basic messaging (coach → all parents broadcast only in MVP)  
- Game scores & results log (auto-linked to player stats)  
- User roles: Head Coach (full admin), Assistant Coach, Team Manager (travel focus)

### 5. Non-functional Requirements
- Self-hosted via Docker Compose (single `docker-compose up -d`)  
- Exposed on uncommon port: **7373** (BASEBALL = 7373 on phone keypad → memorable yet obscure)  
- Responsive design – must be usable on phone at the field  
- Offline-capable stat entry (PWA with local storage sync when back online)  
- All sensitive data encrypted at rest (PostgreSQL + volumes)  
- Backup script included (daily pg_dump + volume backup)  
- Rate limiting & brute-force protection  
- HTTPS via Traefik or Caddy reverse proxy (Let’s Encrypt auto-renew)

### 6. Technical Stack (Recommended)
| Layer              | Technology                              | Reason |
|--------------------|-----------------------------------------|--------|
| Frontend           | Next.js 15 (App Router) + TypeScript + TailwindCSS | Fast, SSR, great DX |
| Backend            | Next.js API routes OR NestJS (if separate) | Flexibility |
| Database           | PostgreSQL 16                           | Strong relational needs |
| Auth               | NextAuth.js or Clerk (self-hosted option: Authelia or Keycloak) | Easy OAuth + local |
| Calendar UI        | FullCalendar Premium or @fullcalendar/react | Industry standard |
| File storage       | Local volume + optional S3-compatible (MinIO in docker) | Simple |
| Containerization   | Docker Compose (multi-container: app, db, redis, traefik) | Requirement |
| Reverse proxy      | Traefik v3 (auto HTTPS + middleware)    | Zero config SSL |
| Port exposure      | 7373 → Traefik → app container          | Meets obscure port need |

Example `docker-compose.yml` snippet (final deliverable will include complete file):

```yaml
services:
  traefik:
    image: traefik:v3.0
    command:
      - "--providers.docker=true"
      - "--entrypoints.websecure.address=:7373"
      - "--certificatesresolvers.letsencrypt.acme.email=coach@example.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "7373:7373"    # Obscure port exposed to host
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - letsencrypt:/letsencrypt

  app:
    image: coachhub/baseball:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.coachhub.rule=Host(`baseball.yourdomain.com`)"
      - "traefik.http.routers.coachhub.entrypoints=websecure"
      - "traefik.http.routers.coachhub.tls.certresolver=letsencrypt"
    depends_on:
      - db
      - redis

  db:
    image: postgres:16
    environment:
      POSTGRES_DB: coachhub
      POSTGRES_USER: coach
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pg_data:/var/lib/postgresql/data

volumes:
  pg_data:
  letsencrypt:
```

### 7. Future Phases (Post-MVP)
- Parent/player mobile app (React Native or PWA)  
- Opponent scouting database  
- Advanced analytics (Statcast-like metrics)  
- College recruiting profile export  
- Payment collection (team dues, tournament fees) via Stripe  
- Video highlight clipping integration  
- Two-way parent messaging + notifications (Push + Email + SMS)

### 8. Success Metrics (6 months post-launch)
- 100% of games and practices entered in app (vs. texts/Google calendar)  
- Zero lost medical forms or birth certificates at tournaments  
- Average post-game stat entry time < 10 minutes  
- Coach spends < 2 hours total organizing multi-day tournament travel

### 9. Deliverables
1. Complete PRD (this document)  
2. Full Docker Compose repository ready to `git clone && docker compose up -d`  
3. Production-ready web app accessible at `https://yourdomain.com:7373` (or local IP:7373)  
4. Admin user creation script + coach quick-start guide  
5. Backup & restore documentation

This product will give a travel baseball coach superpowers and dramatically reduce administrative burnout — finally letting them focus on developing players instead of herding cats.

Ready to move to wireframes → development when you give the green light.