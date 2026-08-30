# Panduan Migrasi: Supabase → Neon PostgreSQL + Cloudflare R2

## Overview

| Layanan Lama | Layanan Baru | Fungsi |
|---|---|---|
| Supabase PostgreSQL | **Neon PostgreSQL** | Database utama |
| Supabase Storage | **Cloudflare R2** | Penyimpanan foto |

---

## STEP 1: Setup Neon PostgreSQL (Database)

### 1.1 Buat Akun & Database
1. Buka https://console.neon.tech → Sign up gratis
2. Klik **"New Project"**
3. Nama project: `photobooth`
4. Region: **AWS Asia Pacific (Singapore)** (paling dekat ke Indonesia)
5. Klik **"Create Project"**

### 1.2 Ambil Connection String
1. Di dashboard Neon → klik project `photobooth`
2. Di panel **"Connection Details"**, pilih:
   - Role: `neondb_owner`
   - Database: `neondb`
   - Connection type: `Pooled connection` (penting untuk Vercel serverless)
3. Copy Connection string:
   ```
   postgresql://neondb_owner:PASSWORD@ep-xxxx-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

### 1.3 Update .env
Ganti `DATABASE_URL` dengan connection string Neon:
```env
DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
PRISMA_PGBOUNCER="true"
```

### 1.4 Jalankan Migrasi Database
```bash
cd backend
npx prisma migrate deploy
```

---

## STEP 2: Setup Cloudflare R2 (Storage Foto)

### 2.1 Buat Akun Cloudflare
1. Buka https://dash.cloudflare.com → Sign up gratis

### 2.2 Buat R2 Bucket
1. Sidebar kiri → klik **"R2 Object Storage"**
2. Klik **"Create bucket"**
3. Nama bucket: `photobooth-photos`
4. Region: **APAC** → klik **"Create bucket"**

### 2.3 Buat R2 API Token
1. Halaman R2 → klik **"Manage R2 API Tokens"** (kanan atas)
2. Klik **"Create API token"**
3. Nama: `photobooth-backend`
4. Permissions: **Object Read & Write**
5. Bucket: `photobooth-photos`
6. Klik **"Create API Token"** → **SIMPAN** credentials:
   - `Access Key ID`
   - `Secret Access Key`
   - `Account ID` (ada di URL dashboard: `dash.cloudflare.com/ACCOUNT_ID/...`)

### 2.4 Update .env
```env
CF_ACCOUNT_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
R2_ACCESS_KEY_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
R2_SECRET_ACCESS_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
R2_BUCKET_NAME="photobooth-photos"
```

---

## STEP 3: Deploy ke Vercel

### 3.1 Update Environment Variables di Vercel
1. Buka vercel.com → project backend → **Settings** → **Environment Variables**
2. **Hapus** variable lama:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. **Tambah** variable baru:
   ```
   DATABASE_URL          = [Neon connection string]
   CF_ACCOUNT_ID         = [Cloudflare Account ID]
   R2_ACCESS_KEY_ID      = [R2 Access Key ID]
   R2_SECRET_ACCESS_KEY  = [R2 Secret Access Key]
   R2_BUCKET_NAME        = photobooth-photos
   ```

### 3.2 Redeploy
```bash
git add .
git commit -m "chore: migrate storage from Supabase to Cloudflare R2"
git push
```

---

## STEP 4: Verifikasi

```bash
# Cek database terhubung
curl https://your-backend.vercel.app/ready

# Upload foto test lalu cek di Cloudflare R2 dashboard
# R2 → photobooth-photos → Objects → harus ada file baru
```

---

## Troubleshooting

| Error | Solusi |
|---|---|
| `R2 client tidak terkonfigurasi` | Cek `CF_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` di .env |
| `NoSuchKey` saat download | File tidak ada di R2 bucket. Cek nama bucket di `R2_BUCKET_NAME` |
| Prisma connection error | Cek format `DATABASE_URL` Neon. Pastikan `?sslmode=require` ada |
| CORS error | Cek `FRONTEND_URL` di .env sudah benar |
