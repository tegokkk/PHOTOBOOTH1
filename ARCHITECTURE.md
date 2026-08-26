# Photobooth Production Architecture Decision (Task 1)

**Generated:** 2026-08-10
**Status:** Production baseline aligned to PostgreSQL with object storage for online photos.

## Overview
This document outlines the production architecture for the Photobooth application, ensuring reliability, security, and scalability.

## 1. Hosting Providers
* **Frontend:** Deployed via **Vercel** (or standard VPS running Next.js build). This is optimized for Next.js features and edge caching.
* **Backend:** Deployed on a **VPS (Virtual Private Server) using PM2** for process management, or as a Docker container.

## 2. Database
* **Production database:** PostgreSQL. This matches the Prisma datasource and is suitable for the Vercel/cloud deployment currently being tested.
* **Local development:** Use a separate PostgreSQL database or a disposable hosted development database; do not point the kiosk at a local SQLite file.

## 3. Media Storage
* **Primary Storage:** Supabase Storage (or another S3-compatible object store) for online/QR photos.
* **Local fallback:** `backend/uploads` is supported for local development only and must be mounted on persistent storage if used outside development.
* **Privacy:** All uploads are stored privately and served via authorized API endpoints (`/api/media/:filename`), never exposed directly via static public routing.

## 4. Production Domains & Environment
* **App URL:** `https://photobooth.example.com` (Target frontend domain)
* **API URL:** `https://api.photobooth.example.com` (Target backend domain)
* **Environment Variables:**
  * `DATABASE_URL` (PostgreSQL connection string)
  * `JWT_SECRET` (Strong randomly generated string)
  * `FRONTEND_URL` (Matches the App URL for CORS validation)
  * `UPLOAD_DIR` (Absolute path for persistent volume)
  * `NODE_ENV=production`
  * `GUEST_PHOTO_RETENTION_HOURS` (default 168 hours / 7 days)

## 5. Reverse Proxy & TLS
* The backend will run behind a reverse proxy (Nginx or Caddy) which terminates TLS (SSL) using Let's Encrypt.
* The frontend on Vercel automatically manages its own TLS.

## 6. Rollback Plan
* **Database:** Use managed PostgreSQL backups plus scheduled `pg_dump` exports and a periodic restore drill. The old SQLite backup script is not a production backup strategy.
* **Application:** Git tags per release; rollback by checking out the previous tag, running `npm ci`, building, and reloading PM2/Vercel.
