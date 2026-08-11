<p align="center">
  <img src="https://raw.githubusercontent.com/tegokkk/RIRI/main/frontend/public/icons/icon-512x512.png" alt="RIRI PHOTOBOOTH login banner" width="200" style="border-radius: 20px;" />
</p>

<h1 align="center">RIRI PHOTOBOOTH</h1>

<p align="center">
  Web photobooth digital interaktif dengan efek kamera real-time, kustomisasi bingkai, dan integrasi penyimpanan cloud (Supabase).
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-18-20232a?logo=react&logoColor=61dafb" />
  <img alt="Express" src="https://img.shields.io/badge/Express-4-111111?logo=express&logoColor=white" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-5-2d3748?logo=prisma&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Supabase-4169e1?logo=postgresql&logoColor=white" />
</p>

---

## Overview

RIRI PHOTOBOOTH adalah aplikasi full-stack untuk memberikan pengalaman photobooth digital yang nyata langsung melalui browser. Frontend dibuat dengan Next.js + React, backend memakai Express + Prisma, dan database serta penyimpanan file menggunakan PostgreSQL/Supabase.

Fokus project ini adalah membuat proses pengambilan foto yang mulus: kamera beroperasi seperti cermin (mirror) mirip antarmuka iPhone, pengguna bisa memilih berbagai macam bingkai, memberikan efek filter visual, dan kemudian foto disimpan ke cloud serta dapat diunduh langsung.

## Fitur

| Modul | Fitur |
| --- | --- |
| Kamera | antarmuka bergaya iPhone, fitur cermin otomatis, filter gambar |
| Bingkai | kustomisasi frame transparan otomatis, pemosisian wajah cerdas |
| Export | unduh foto satuan resolusi tinggi, bagikan tautan, mode cetak |
| Proteksi | anti-spam klik ganda (debounce), JWT Access Token |
| Penyimpanan | unggah otomatis ke Supabase Storage, privasi aman |
| Backend | REST API modular, Prisma ORM, arsitektur Vercel Serverless |

## Alur Aplikasi

```mermaid
flowchart LR
  A["Akses Kamera"] --> B["Pilih Frame & Efek"]
  B --> C["Hitung Mundur (Timer)"]
  C --> D["Jepret Foto"]
  D --> E["Proses Compositing (Gabung Frame)"]
  E --> F["Simpan ke Cloud (Supabase)"]
  F --> G["Unduh / Bagikan Link"]
```

## Tech Stack

| Layer | Teknologi |
| --- | --- |
| Frontend | Next.js 14, React 18, React Webcam, Zustand |
| Styling | Tailwind CSS, CSS Filters, Lucide / Material Icons |
| Backend | Node.js, Express, Prisma Client, Vercel Serverless |
| Database | PostgreSQL (Supabase) |
| Cloud Storage | Supabase Storage (Private Buckets) |
| Integrasi | CORS, Multer, Supabase JS SDK |

## Struktur Folder

```text
RIRI/
|-- backend/
|   |-- prisma/
|   |   `-- schema.prisma
|   |-- src/
|   |   |-- controllers/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- lib/
|   |   `-- app.js
|   `-- vercel.json
|
|-- frontend/
|   |-- src/
|   |   |-- app/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- store/
|   |   `-- lib/
|   `-- public/
```

## Instalasi Lokal

```bash
# 1. Kloning repository
git clone https://github.com/tegokkk/RIRI.git

# 2. Setup Backend
cd RIRI/backend
npm install
# Buat file .env dan isi dengan DATABASE_URL dari Supabase (Gunakan port 5432)
npx prisma migrate dev
npm run dev

# 3. Setup Frontend
cd ../frontend
npm install
# Buat file .env dan isi NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev
```
