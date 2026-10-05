# tasks.md

Satu tugas per sesi. Tugas bertanda **[ANDA]** dikerjakan manual oleh pemilik proyek, agent tidak bisa melakukannya.
Setiap tugas selesai bila kriteria "Selesai bila" terpenuhi dan `typecheck`, `lint`, `test` lolos.

## Keputusan yang sudah dipakai

- Kolom **Hadir (`H`)** ditambahkan di sheet absensi bulanan (kolom `AM`).
- Penanda **"menunggak"** pada kas **ditunda** (tidak dikerjakan di MVP).
- Libur memakai huruf **`L`** dengan latar merah `#C62E24`.
- Semester genap 22 minggu, sheet dibuat dari salinan ganjil. Saldo kas kumulatif.
- Tanpa autentikasi dan tanpa pengamanan tambahan.
- Saldo kas **kumulatif** lintas semester (`prd.md` A4): total centang semua sheet semester × 2000 − total `Catatan Pengeluaran`. Kriteria "sama dengan `C40`" berlaku selama baru ada Semester Ganjil.
- Format uang **`Rp 2.000`** dengan spasi (`prd.md` bagian 10), dengan titik sebagai pemisah ribuan.
- `merah-600` = `#C62E24`, sama dengan warna libur (`prd.md` 14.4).

---

## Fase 0 — Fondasi

- [ ] **T0.1 [ANDA] Siapkan salinan spreadsheet.** Duplikat ketiga file, beri akhiran `_DEV`. Di salinan absensi, ganti nama `Sheet1` menjadi `Template`. Buat proyek Apps Script, isi Script Properties: `ABSENSI_SS_ID`, `NILAI_SS_ID`, `KAS_SS_ID` (mengarah ke salinan `_DEV`).
  *Selesai bila:* tiga ID tercatat di Script Properties.

- [x] **T0.2 Inisialisasi proyek.** Vite + React + TS strict, Tailwind, React Router, TanStack Query, date-fns, lucide-react, fontsource Lexend dan Source Sans 3. Tambahkan skrip `typecheck`, `lint`, `test` (vitest). `.env.example` berisi `VITE_GAS_URL=` dan `VITE_USE_MOCK=true`.
  *Selesai bila:* `npm run dev` menampilkan halaman kosong, ketiga skrip berjalan.

- [x] **T0.3 Token desain.** Pasang token `design.md` bagian 10 (warna, radius, bayangan, font) ke `index.css` dan konfigurasi Tailwind. Tambahkan `meta theme-color` `#00359D`.
  *Selesai bila:* kelas utilitas untuk semua warna inti dan status tersedia.

- [x] **T0.4 Kerangka layar.** Header (logo 36 px, "Kelas 3", "SDN 1 Pandanmulyo", garis emas 2 px), navigasi bawah 4 tab (Beranda, Absensi, Nilai, Kas), rute dasar dengan halaman kosong.
  *Selesai bila:* berpindah tab berfungsi di lebar 360 px, tab aktif sesuai `design.md` 6.1.

- [ ] **T0.5 Kontrak dan klien API.** Salin `api-contract.ts` ke `src/types/`. Buat `src/api/client.ts` (GET dengan query, POST dengan `text/plain`, parsing `ApiResult`, galat menjadi `ApiError` bertipe). Buat mode mock: fixture 32 siswa fiktif, handler mock untuk `students.list`, pemilihan lewat `VITE_USE_MOCK`.
  *Selesai bila:* `students.list` mengembalikan 32 siswa pada mode mock, ada tes untuk parsing galat.

- [ ] **T0.6 Kerangka Apps Script.** `Code.gs` (router `doGet`/`doPost`, format `ApiResult`, penanganan galat), `Config.gs` (konstanta dari `spreadsheet-schema.md`), `Utils.gs` (tanggal WIB, nama bulan Indonesia, `withLock`), `Students.gs` (`students.list`).
  *Selesai bila:* memanggil URL Web App `?action=students.list` mengembalikan 32 siswa dari salinan `_DEV`.

- [ ] **T0.7 `validate`.** Periksa: ketiga spreadsheet terbuka, sheet wajib ada, header sesuai konstanta, urutan nama siswa sama di ketiga file. Laporkan `issues[]`.
  *Selesai bila:* mengembalikan `ok: true` pada salinan `_DEV`, dan melaporkan masalah bila satu nama sengaja diubah.

- [ ] **T0.8 [ANDA] Deploy Web App.** *Deploy → Web app*, Execute as: Me, akses: Anyone. Salin URL ke `.env` lokal. Untuk perubahan berikutnya, buat versi baru **pada deployment yang sama**.
  *Selesai bila:* `VITE_USE_MOCK=false` menampilkan siswa dari spreadsheet `_DEV`.

- [ ] **T0.9 Verifikasi `spreadsheet-schema.md`.** Bandingkan seluruh konstanta di dokumen dengan salinan `_DEV` yang sebenarnya. Perbarui dokumen bila ada selisih.
  *Selesai bila:* tidak ada selisih tersisa atau selisih dicatat dan dikonfirmasi.

## Fase 1 — Absensi harian

- [ ] **T1.1 Template absensi.** Apps Script menyiapkan `Template`: aturan format bersyarat (`L` → latar `#C62E24`, huruf putih) pada `E7:AI38`, header kolom `H` di `AM`. Fungsi `ensureMonthSheet(month)` menyalin template, menamai `Bulan-Tahun`, mengisi judul `E4`, rumus `AJ:AM` (S, I, A, H) untuk 32 baris, mengabukan kolom tanggal yang tidak ada, dan mengisi `L` pada seluruh kolom hari Minggu.
  *Selesai bila:* memanggil `ensureMonthSheet('2026-08')` menghasilkan sheet `Agustus-2026` yang benar; memanggil dua kali tidak membuat duplikat.

- [ ] **T1.2 `absensi.getDay`, `absensi.monthOverview`.** Baca satu kolom tanggal, kembalikan `recorded`, `libur`, `sunday`, `entries`; hitung `recordedDates` dan `liburDates` (Minggu ikut `liburDates`).
  *Selesai bila:* sesuai isi sheet uji, termasuk bulan yang sheet-nya belum ada (`sheetExists: false`).

- [ ] **T1.3 `absensi.saveDay`, `absensi.clearDay`, `absensi.setLibur`.** Tulis satu kolom (dengan lock). `H` ditulis `v`. Tolak hari Minggu dengan `SUNDAY_LOCKED`. `setLibur(true)` mengisi `L`, `setLibur(false)` mengosongkan.
  *Selesai bila:* menyimpan 5 Juli menulis kolom `I` saja, `L` di tanggal 17 terisi pada 32 sel dan tampil merah.

- [ ] **T1.4 Handler mock untuk absensi** dengan perilaku yang sama (termasuk Minggu terkunci).
  *Selesai bila:* seluruh alur absensi bisa dicoba tanpa backend.

- [ ] **T1.5 Halaman Absensi: tanggal dan kalender.** Pemilih tanggal (panah kiri/kanan dan bottom sheet kalender), titik penanda tanggal terisi, merah untuk Minggu dan libur, tanggal Minggu tidak bisa dipilih untuk diabsen.
  *Selesai bila:* kalender sesuai `design.md` 6.3; helper tanggal punya tes (batas bulan, tahun kabisat, hari Minggu).

- [ ] **T1.6 Halaman Absensi: input.** Tab Sakit/Izin/Alpha dengan penghitung, daftar siswa dengan lencana huruf, cari nama, ringkasan `Hadir n`, bar Simpan menggantikan tab bawah saat ada perubahan. Siswa pada status lain dipindahkan, bukan digandakan.
  *Selesai bila:* alur sesuai `prd.md` 7.2; ada tes untuk logika pemindahan status.

- [ ] **T1.7 Libur dan mode edit.** Tombol "Tandai libur", banner libur dengan "Batalkan libur", pemuatan data lama (mode edit), hapus absensi dengan konfirmasi, toast sesuai `design.md` 8.
  *Selesai bila:* semua kriteria penerimaan absensi di `prd.md` 7.2 tercentang.

## Fase 2 — Rekap absensi

- [ ] **T2.1 `absensi.summary`.** Hitung per siswa lintas bulan: hadir, sakit, izin, alpha, `hariEfektif`, `persen`. Libur dan sel kosong tidak dihitung. Bulan tanpa sheet masuk `skippedMonths`.
  *Selesai bila:* hasil sama dengan hitungan manual dari sheet uji (ada tes untuk fungsi hitungnya).

- [ ] **T2.2 Halaman rekap.** Pemilih bulan awal dan akhir, semua siswa atau satu siswa, cincin progres (`design.md` 6.6), rincian per bulan, catatan bulan yang dilewati.
  *Selesai bila:* rentang Juli–September menjumlahkan tiga sheet dengan benar.

## Fase 3 — Kas

- [ ] **T3.1 `kas.getSemester`, `kas.summary`.** Baca checkbox 22 minggu per siswa, total, dan ringkasan (pemasukan, pengeluaran, saldo kumulatif lintas semester).
  *Selesai bila:* total sama dengan kolom `Y` dan sel ringkasan di sheet.

- [ ] **T3.2 `kas.pay`, `kas.setWeek`.** `pay` mencentang `count` minggu terlama yang belum lunas; galat `NOTHING_TO_PAY` bila semua lunas.
  *Selesai bila:* siswa kosong minggu 5–22 → `pay` mencentang minggu 5. Ada tes untuk fungsi pemilih minggu.

- [ ] **T3.3 `kas.expenses.*` dan `kas.createSemester`.** Tambah, ubah, hapus, dan daftar pengeluaran (tanggal sebagai nilai tetap; sisipkan baris dan perbarui rumus total bila 19 baris penuh). Buat sheet Semester Genap dari salinan ganjil dengan centang direset.
  *Selesai bila:* saldo di app sama dengan sel total di sheet.

- [ ] **T3.4 Handler mock untuk kas.**
  *Selesai bila:* seluruh alur kas bisa dicoba tanpa backend.

- [ ] **T3.5 Halaman Kas.** Tab semester, ringkasan saldo, daftar siswa dengan tombol cepat `+`, bottom sheet 22 chip dengan cincin emas pada chip berikutnya, tombol "Catat bayar minggu n", koreksi manual dengan konfirmasi pembatalan, optimistic update.
  *Selesai bila:* sesuai `design.md` 6.4 dan kriteria penerimaan di `prd.md` 7.5.

- [ ] **T3.6 Halaman Pengeluaran.** Daftar, tambah, ubah, hapus; keadaan kosong sesuai `design.md` 8.
  *Selesai bila:* menambah pengeluaran mengurangi saldo yang tampil.

## Fase 4 — Nilai

- [ ] **T4.1 `nilai.getSheet`, `nilai.subjects`.** Baca 7 mapel: 20 slot harian, rata-rata (baca saja), PTS, PAS, nilai akhir (baca saja).
  *Selesai bila:* rata-rata yang tampil sama dengan kolom `Y`.

- [ ] **T4.2 `nilai.addDaily`.** Tentukan slot kosong pertama pada bab (kolom yang seluruh 32 selnya kosong), atau pakai `slot` bila diberikan. Galat `BAB_FULL` bila keempat slot terisi. Sel kosong tidak ditulis 0.
  *Selesai bila:* Matematika Bab 2 menempati kolom `I` bila kosong, atau `J` bila `I` sudah terisi. Ada tes untuk fungsi pemilih slot.

- [ ] **T4.3 `nilai.setExam`, `nilai.setCell`.** Tulis PTS/PAS (`Z`/`AA`) dan edit satu sel; `null` mengosongkan sel. **Kolom `AB` tidak boleh ditulis**, tambahkan tes pelindung.
  *Selesai bila:* percobaan menulis ke `AB` ditolak dengan `INVALID_INPUT`.

- [ ] **T4.4 Handler mock untuk nilai.**
  *Selesai bila:* seluruh alur nilai bisa dicoba tanpa backend.

- [ ] **T4.5 Halaman Nilai.** Chip 7 mapel, daftar rekap (rata-rata, PTS, PAS, Nilai Akhir `—` bila kosong), detail siswa dengan 20 slot yang bisa diedit (debounce, indikator tersimpan), form "Tambah penilaian" per bab, input PTS/PAS.
  *Selesai bila:* sesuai `prd.md` 7.4; mengosongkan nilai mengosongkan sel, bukan mengisi 0.

## Fase 5 — Penyempurnaan

- [ ] **T5.1 Beranda.** Cincin kehadiran hari ini atau banner (belum diabsen, libur), kartu saldo kas, pintasan.
  *Selesai bila:* sesuai `design.md` 6.2.

- [ ] **T5.2 PWA ringan.** Manifest, ikon 192/512 (ruang aman 10%), favicon dari perisai dan obor. Tanpa mode offline.
  *Selesai bila:* bisa dipasang ke layar utama HP dengan ikon yang benar.

- [ ] **T5.3 Penanganan galat dan keadaan kosong.** Pesan galat sesuai `design.md` 8, skeleton di semua halaman, peringatan sebelum meninggalkan halaman bila ada perubahan belum disimpan.
  *Selesai bila:* mematikan jaringan menampilkan pesan yang jelas dan tombol coba lagi.

- [ ] **T5.4 Pemeriksaan akhir.** Daftar periksa `design.md` bagian 11, kontras, lebar 360 px, uji di HP sungguhan.
  *Selesai bila:* seluruh kotak daftar periksa tercentang.

- [ ] **T5.5 [ANDA] Pindah ke spreadsheet asli.** Ganti Script Properties ke ID file asli (setelah mengubah nama `Sheet1` → `Template` dan mencadangkan file), deploy versi baru, isi `VITE_GAS_URL` di Vercel.
  *Selesai bila:* `validate` mengembalikan `ok: true` pada file asli dan satu absensi percobaan tersimpan dengan benar.

- [ ] **T5.6 Deploy Vercel.** Hubungkan repositori privat, preset Vite, `vercel.json` rewrite ke `index.html`.
  *Selesai bila:* app bisa dibuka dari HP lewat URL Vercel.

---

## Temuan (diisi agent)

Catat hal di luar tugas yang perlu diperhatikan. Jangan dikerjakan tanpa persetujuan.

- (T0.2, diputuskan) **Saldo kas vs sel `C40`:** ikut `prd.md` A4 (kumulatif). Lihat "Keputusan yang sudah dipakai".
- (T0.2, diputuskan) **Format rupiah:** ikut `prd.md` bagian 10, `Rp 2.000`.
- (T0.2, diputuskan) **Token `merah-600`** = `#C62E24`, dipasang pada T0.3.
- (T0.2, diputuskan) **Parameter `nilai.getSheet`:** tetap `mapel` sesuai `api-contract.ts`. `subject` di tabel `prd.md` bagian 8 tidak dipakai.
- (T0.2) **Perintah `typecheck`:** `CLAUDE.md` menulis `tsc --noEmit`, tetapi tsconfig memakai project references sehingga perintah itu tidak memeriksa apa pun. Skrip memakai `tsc -b` (semua tsconfig sudah `noEmit`).
- (T0.2) `public/favicon.svg` dan `public/favicon.ico` masih logo Vite, dan `README.md` masih isi template Vite. Diganti pada T5.2 dan bila diminta.
- (T0.2, diputuskan) Nama siswa tanpa NIPD tetap tertulis di `prd.md` dan `spreadsheet-schema.md` seperti adanya. Repositori harus privat (`prd.md` bagian 10).
