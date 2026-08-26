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
  "copies": 1
}
```

Bridge wajib mengembalikan JSON berikut ketika pekerjaan sudah diterima:

```json
{ "success": true }
```

Jika printer offline, kertas habis, atau job tidak dapat diterima, kembalikan HTTP `4xx/5xx` atau:

```json
{ "success": false, "message": "Printer sedang offline" }
```

Frontend menyimpan job dan gambar di IndexedDB perangkat booth. Job gagal dapat dicoba ulang tanpa meminta pelanggan mengambil foto lagi. `jobId` harus diperlakukan sebagai idempotency key oleh bridge agar retry tidak mencetak dua kali.

Jika bridge belum dikonfigurasi, frontend menggunakan dialog print bawaan browser. Mode ini cocok untuk uji coba, tetapi operator harus memastikan hasil fisik karena browser tidak bisa mengetahui status printer.

## Konfigurasi

Atur environment frontend sebelum build:

```env
NEXT_PUBLIC_PRINT_BRIDGE_URL=http://127.0.0.1:8787/print
```

Pastikan bridge hanya bind ke jaringan lokal booth, memvalidasi ukuran payload, dan tidak mengekspos endpoint print ke internet publik.
