# Kontrak Print Bridge RIRII

Frontend RIRII dapat mengirim pekerjaan cetak ke aplikasi bridge lokal melalui:

```text
POST ${NEXT_PUBLIC_PRINT_BRIDGE_URL}
Content-Type: application/json
```

Body:

```json
{
  "jobId": "uuid",
  "imageDataUrl": "data:image/jpeg;base64,...",
  "frameName": "Nama Frame",
  "copies": 1,
  "paperSize": "4R",
  "widthMm": 101.6,
  "heightMm": 152.4,
  "dpi": 300
}
```

Semua frame dikirim sebagai satu lembar 4R portrait (4 × 6 inci) beresolusi 1200 × 1800 piksel pada 300 DPI. Foto dan bingkai dipasang utuh secara proporsional pada latar putih. Jika dua strip dipilih, keduanya sudah digabung menjadi satu gambar 4R; bridge tidak perlu menduplikasi gambar lagi. `copies` adalah jumlah lembar 4R.

Bridge harus memilih media 4R / 4 × 6 inci (101,6 × 152,4 mm), orientasi portrait, skala 100%, serta margin nol / borderless jika printer mendukungnya. Jangan memakai ukuran media bawaan A4. Ukuran piksel saja tidak menentukan ukuran cetak fisik.

Bridge wajib mengembalikan JSON berikut ketika pekerjaan sudah diterima:

```json
{ "success": true }
```

Jika printer offline, kertas habis, atau job tidak dapat diterima, kembalikan HTTP `4xx/5xx` atau:

```json
{ "success": false, "message": "Printer sedang offline" }
```

Frontend mempertahankan gambar cetak di memori selama sesi dan mengirim job beserta gambar ke backend untuk riwayat cetak. Job gagal dapat dicoba ulang selama gambar masih tersedia dalam sesi. `jobId` harus diperlakukan sebagai idempotency key oleh bridge agar retry tidak mencetak dua kali.

Jika bridge belum dikonfigurasi, frontend menggunakan dialog print bawaan browser dengan halaman 4 × 6 inci dan satu halaman per salinan. Operator harus memilih kertas 4R, skala 100%, margin nol, dan menonaktifkan header/footer. Pastikan hasil fisik karena browser tidak bisa mengetahui status printer.

## Konfigurasi

Atur environment frontend sebelum build:

```env
NEXT_PUBLIC_PRINT_BRIDGE_URL=http://127.0.0.1:8787/print
```

Pastikan bridge hanya bind ke jaringan lokal booth, memvalidasi ukuran payload, dan tidak mengekspos endpoint print ke internet publik.
