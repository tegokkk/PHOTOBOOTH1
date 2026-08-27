# Arsitektur UI Sistem Photobooth 🎨

Dokumen ini berisi rangkuman komprehensif mengenai arsitektur tampilan antarmuka (UI) dari sistem Photobooth saat ini. Dokumen ini dirancang sebagai panduan dasar sebelum kamu melakukan perombakan UI secara besar-besaran.

---

## 1. Teknologi & Styling Dasar
Sistem ini dibangun menggunakan **Next.js 15 (App Router)** dan **React 19**.

- **Framework CSS**: Tailwind CSS (v4)
- **Komponen UI**: Shadcn UI (terintegrasi dalam Tailwind) + Komponen Kustom
- **Font Utama**:
  - `Bricolage Grotesque` (Untuk Headline, Judul, dan Tombol Interaktif)
  - `Courier Prime` (Untuk Body text, Label, dan tulisan kecil)
- **Tema Desain (Sketch/Doodle Style)**:
  - Menggunakan border tebal bergerigi (kelas `sketch-border` / `sketchy-border`).
  - Menggunakan bayangan tegas/padat (kelas `hard-shadow`).
  - Animasi mikro seperti efek jiggle saat tombol ditekan (`jiggle-active:active`).

---

## 2. Struktur Global CSS ( `globals.css` )
File `frontend/src/app/globals.css` menyimpan seluruh variabel warna (CSS variables) yang mengatur skema warna aplikasi. 

**Warna Utama (Custom Theme):**
- `--color-background`: `#fff8f7` (Putih agak kemerahan)
- `--color-primary`: `#bd001b` (Merah Gelap)
- `--color-curtain-red`: `#E61D2B` (Merah Terang khas Photobooth)
- `--color-ink-black`: `#0F0F0F` (Hitam pekat untuk border sketch/doodle)
- `--color-paper-white`: `#FFFFFF`

**Z-Index Layering Guide:**
- `0`: Konten normal (Base)
- `40`: Elemen dekoratif melayang (Tape corners)
- `50`: Header, Navbar, Kontrol kamera statis
- `100`: Modal, Dialog (Preview frame, peringatan)
- `150`: Toast notifications

---

## 3. Komponen UI Reusable ( `src/components/ui/` )
Ini adalah komponen-komponen kecil yang digunakan berulang kali di seluruh halaman aplikasi. Jika kamu merombak desain, **mulailah dari sini** karena perubahannya akan berdampak ke seluruh sistem:

- `Button.tsx`: Tombol utama dengan efek *hard-shadow* dan *jiggle*.
- `Card.tsx`: Kontainer berbentuk kartu bergaya sketch.
- `Input.tsx`: Kolom input teks.
- `Modal.tsx`: Komponen popup dasar.
- `Toast.tsx`: Notifikasi melayang di pojok layar.
- `Loader.tsx`: Animasi loading berbentuk coretan (*scribble loader*).
- `TopAppBar.tsx` & `SideNavBar.tsx`: Sistem navigasi.

---

## 4. Alur Layar Utama (Screen Flows)
Aplikasi Photobooth berjalan melalui pergantian *state* komponen di dalam halaman utama (`page.tsx`), bukan perpindahan URL (kecuali untuk admin/gallery).

### A. Landing Screen
📄 **File:** `LandingScreen.tsx`
- Layar selamat datang.
- Berisi tombol besar "Mulai Sesi Foto".
- Desain berpusat di tengah dengan ornamen dekoratif (seperti gambar kamera doodle).

### B. Frame Selection Screen (Langkah 1)
📄 **File:** `FrameSelectionScreen.tsx`
- Grid galeri yang menampilkan seluruh frame yang tersedia.
- User memilih salah satu frame.
- Menggunakan komponen **`FramePreviewDialog.tsx`** untuk memunculkan modal popup konfirmasi preview frame sebelum masuk ke kamera.

### C. Camera Screen (Langkah 2)
📄 **File:** `CameraScreen.tsx`
- Ini adalah layar paling kompleks.
- **`CameraOverlays.tsx`**: Menangani animasi Flash putih berkedip, efek Hitung Mundur (3,2,1), dan pesan error perizinan kamera.
- **`CameraControls.tsx`**: Menangani tombol jepret bulat besar di bawah, tombol tukar kamera, dan indikator jepretan (Slot 1/4).
- Menampilkan video stream secara langsung. Frame akan ditimpa (overlay) di atas video stream menggunakan properti transparan (PNG).

### D. Photo Preview & Export Screen (Langkah 3)
📄 **File:** `PhotoPreviewScreen.tsx`
- Menampilkan hasil gabungan akhir (*composite*) antara foto user dan frame (diproses via Canvas di `compositor.ts`).
- Filter warna: Normal, B&W (Hitam Putih), Sepia, dll.
- Tombol aksi:
  - **Ulangi Sesi** (Kembali ke awal)
  - **Cetak Fisik** (Print API / Browser Print)
  - **Simpan ke Gallery** (Upload ke DB & Storage)
  - **Download QR / Share**

---

## 5. Halaman Ekstra
- **Gallery (`/gallery`)**: Grid masonry yang menampilkan foto-foto hasil photobooth user lain yang diatur ke publik.
- **Admin Dashboard (`/admin`)**: Panel untuk mengelola frame, melihat analitik foto, dan manajemen user.
- **Share Page (`/share/[id]`)**: Halaman publik untuk mengunduh spesifik foto (biasanya diakses dari scan QR Code).

---

## 💡 Tips untuk Perombakan UI (Overhaul)

1. **Ubah Tema CSS**: Jika kamu ingin menghilangkan gaya desain "buku gambar/doodle", cukup hapus atau ubah kelas `.sketch-border` dan `.hard-shadow` di `globals.css` menjadi desain modern (misalnya *rounded-xl* dan *drop-shadow-md*).
2. **Ganti Font**: Ubah impor font Google di `globals.css` dari `Bricolage Grotesque` dan `Courier Prime` menjadi font modern minimalis seperti `Inter`, `Geist`, atau `Outfit`.
3. **Warna**: Sesuaikan root variable `--color-curtain-red` dan `--color-background` dengan palet warna barumu.
4. **Layout Kamera**: Susunan komponen di `CameraScreen.tsx` sangat bergantung pada `aspect-ratio`. Jika merombak bentuk kotak kamera, perhatikan bagian container video dan kompositor agar *slot* koordinat frame tidak berantakan.
