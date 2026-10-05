# CLAUDE.md — Administrasi Kelas 3 SDN 1 Pandanmulyo

Web app untuk satu wali kelas: absensi harian, nilai, dan kas mingguan. Tanpa login. Data disimpan di tiga Google Spreadsheet, diakses lewat satu Google Apps Script Web App.

## Baca dulu (urut)

1. `tasks.md` — tugas yang sedang dikerjakan. **Kerjakan satu tugas per sesi.**
2. `prd.md` — apa yang dibangun, alur fitur, kriteria penerimaan.
3. `spreadsheet-schema.md` — posisi baris/kolom sel yang pasti dan keanehan data.
4. `api-contract.ts` — tipe request/response Apps Script. Sumber kebenaran antara frontend dan backend.
5. `design.md` — warna, huruf, bentuk, teks antarmuka. Wajib dibaca sebelum membuat atau mengubah UI apa pun.

Bila dokumen saling bertentangan, urutan di atas menang dari bawah ke atas untuk soal data (schema > prd) dan untuk soal tampilan `design.md` menang.

## Stack

- Vite + React + TypeScript (`strict: true`, dilarang memakai `any`)
- Tailwind CSS (token warna dari `design.md` bagian 10)
- TanStack Query (cache, optimistic update), React Router
- date-fns dengan locale `id` untuk tanggal
- lucide-react untuk ikon, font `@fontsource-variable/lexend` dan `@fontsource-variable/source-sans-3`
- Backend: Google Apps Script (folder `apps-script/`), deploy sebagai Web App
- Deploy frontend: Vercel
- **Jangan menambah dependensi baru tanpa bertanya.**

## Perintah

```
npm run dev          # pengembangan (default memakai data mock)
npm run build        # build produksi
npm run typecheck    # tsc --noEmit
npm run lint
npm run test         # vitest
```

Sebelum menandai tugas selesai, `typecheck`, `lint`, dan `test` harus lolos.

## Struktur folder

```
apps-script/          Code.gs, Config.gs, Utils.gs, Students.gs, Absensi.gs, Nilai.gs, Kas.gs
src/api/              client.ts (satu-satunya pintu ke backend), mock/ (fixture + handler mock)
src/features/         absensi/ nilai/ kas/
src/components/       komponen bersama
src/lib/              tanggal.ts, rupiah.ts, konstanta.ts
src/types/            api-contract.ts disalin/diimpor dari sini
```

## Aturan data (jangan dilanggar)

- Spreadsheet adalah **satu-satunya sumber data**. Jangan menyimpan data kelas di `localStorage`, IndexedDB, atau database lain.
- Semua panggilan ke backend lewat `src/api/client.ts`. Komponen tidak boleh memanggil `fetch` langsung.
- Tipe request/response diambil dari `api-contract.ts`. Mengubah kontrak berarti mengubah **frontend dan Apps Script sekaligus**, dan harus dikonfirmasi dulu.
- Siswa dikenali dengan **`no` (nomor urut 1–32)**, bukan NIPD (ada siswa tanpa NIPD).
- **Kolom Nilai Akhir tidak pernah ditulis app.** Kolom Rata-rata juga hanya dibaca.
- Sel nilai kosong berarti tidak dinilai. **Jangan menulis 0 untuk sel kosong.**
- Absensi: hadir ditulis `v`, sakit `S`, izin `I`, alpha `A`, libur `L`. Saat membaca, terima `v`, `V`, `✓`, `√` sebagai hadir.
- **Hari Minggu otomatis libur dan tidak bisa diabsen.** Apps Script menolak dengan kode `SUNDAY_LOCKED`.
- Kas: "Catat bayar" mencentang **minggu terlama yang belum lunas**, bukan minggu berjalan. Nominal Rp2.000 per minggu, 22 minggu per semester.
- Tanggal pengeluaran kas ditulis sebagai **nilai tetap**, bukan rumus `TODAY()`.
- Tanggal selalu string `YYYY-MM-DD`, bulan `YYYY-MM`. Zona waktu Asia/Jakarta. Jangan memakai `new Date('2026-07-05')` untuk memproses tanggal (bergeser karena UTC); pakai helper di `src/lib/tanggal.ts`.
- Apps Script: semua operasi tulis dibungkus `LockService.getScriptLock()`. Pembacaan `GET`, penulisan `POST` dengan `Content-Type: text/plain;charset=utf-8` (menghindari CORS preflight).
- Rumus yang dipasang lewat `setFormula` memakai sintaks Inggris (koma, bukan titik koma).

## Aturan UI

- Seluruh teks antarmuka berbahasa Indonesia. Pakai teks pada `design.md` bagian 8; jangan mengarang gaya baru (tanpa tanda seru, tanpa emoji, huruf kecil biasa).
- Mobile-first, mulai lebar 360 px. Target ketuk minimal 44 px, baris daftar minimal 56 px. Tidak boleh ada gulir ke samping pada halaman.
- Pakai token warna dan radius dari `design.md`. **Dilarang:** gradasi, kaca buram, bayangan di semua kartu, label huruf kapital semua, label kecil di atas judul, panah `→` di tombol, ilustrasi stok.
- Warna emas hanya untuk garis header dan penanda "minggu berikutnya" pada kas.
- Setiap status absensi selalu tampil dengan hurufnya, tidak hanya dengan warna.
- Tombol aksi dinonaktifkan selama permintaan berjalan. Tampilkan skeleton saat memuat, bukan spinner kosong.
- Optimistic update untuk centang kas dan edit sel nilai, dengan rollback dan pesan galat bila gagal.
- Hormati `prefers-reduced-motion`. Tidak ada animasi saat halaman dimuat.

## Keamanan dan data

- Jangan commit: `.env`, ID spreadsheet, URL Apps Script, atau data siswa asli. Data contoh memakai **nama fiktif**.
- Saat pengembangan, Apps Script terhubung ke **salinan** spreadsheet (akhiran `_DEV`). **Jangan menulis ke spreadsheet asli.**
- Belum ada autentikasi atau token (keputusan pemilik). Jangan menambahkannya tanpa diminta.

## Cara bekerja

1. Buka `tasks.md`, ambil tugas berikutnya yang belum dicentang.
2. Baca bagian terkait di `prd.md` dan `spreadsheet-schema.md`.
3. Kerjakan **hanya** tugas itu. Jika menemukan hal lain yang perlu diperbaiki, catat di bagian "Temuan" pada `tasks.md`, jangan dikerjakan sekaligus.
4. Tulis tes untuk logika yang mudah salah: aturan bayar minggu terlama, penentuan slot nilai kosong, rekap lintas bulan, penamaan sheet `Bulan-Tahun`, penentuan hari Minggu.
5. Jalankan `typecheck`, `lint`, `test`. Periksa tampilan pada lebar 360 px.
6. Centang tugas, lalu commit: `T1.3: simpan absensi harian`.

## Kapan harus berhenti dan bertanya

- Posisi baris/kolom di spreadsheet tidak cocok dengan `spreadsheet-schema.md`.
- Tugas memerlukan perubahan pada `api-contract.ts`, struktur spreadsheet, atau dependensi.
- Ada dua cara masuk akal untuk memenuhi aturan di dokumen, dan dokumen tidak menentukan.

Jangan menebak struktur sheet. Menulis ke sel yang salah merusak data kelas.
