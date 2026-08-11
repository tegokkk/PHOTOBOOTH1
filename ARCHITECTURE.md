# Photobooth Production Architecture Decision (Task 1)

**Generated:** 2026-08-10
**Status:** Phase 1 implementation aligned; PostgreSQL remains the phase 2 migration target.

## Overview
This document outlines the production architecture for the Photobooth application, ensuring reliability, security, and scalability.

## 1. Hosting Providers
* **Frontend:** Deployed via **Vercel** (or standard VPS running Next.js build). This is optimized for Next.js features and edge caching.
* **Backend:** Deployed on a **VPS (Virtual Private Server) using PM2** for process management, or as a Docker container.

## 2. Database
* **Phase 1 launch database:** SQLite on a single VPS with a persistent filesystem path. This matches the current Prisma schema and PM2 deployment shape.
* **Phase 2 target:** PostgreSQL before horizontal scaling, multiple backend instances, or high write concurrency. The migration should be rehearsed separately against a staging database before changing the production datasource provider.

## 3. Media Storage
* **Primary Storage:** Local disk (`backend/uploads`) mapped to a persistent volume on the VPS for the initial launch.
* **Future Upgrade Path:** S3-compatible Object Storage (e.g., AWS S3, Cloudflare R2, DigitalOcean Spaces) for scale.
* **Privacy:** All uploads are stored privately and served via authorized API endpoints (`/api/media/:filename`), never exposed directly via static public routing.

## 4. Production Domains & Environment
* **App URL:** `https://photobooth.example.com` (Target frontend domain)
* **API URL:** `https://api.photobooth.example.com` (Target backend domain)
* **Environment Variables:**
  * `DATABASE_URL` (absolute SQLite file path for phase 1; PostgreSQL connection string after the phase 2 migration)
  * `JWT_SECRET` (Strong randomly generated string)
  * `FRONTEND_URL` (Matches the App URL for CORS validation)
  * `UPLOAD_DIR` (Absolute path for persistent volume)
  * `NODE_ENV=production`

## 5. Reverse Proxy & TLS
* The backend will run behind a reverse proxy (Nginx or Caddy) which terminates TLS (SSL) using Let's Encrypt.
* The frontend on Vercel automatically manages its own TLS.

## 6. Rollback Plan
* **Database:** Nightly SQLite file backups using `scripts/backup.ps1` for phase 1, with a restore drill. After the PostgreSQL migration, replace this with managed `pg_dump` plus point-in-time recovery.
* **Application:** Git tags per release; rollback by checking out the previous tag, running `npm ci`, building, and reloading PM2/Vercel.
