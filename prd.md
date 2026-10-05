# PRD — Sistem Administrasi Kelas 3 SD Negeri 1 Pandanmulyo

| | |
|---|---|
| **Versi** | 1.2 (Final MVP, termasuk fitur Agenda & Kalender Cerdas) |
| **Tahun pelajaran** | 2026/2027 |
| **Pengguna** | Wali kelas (1 orang, 1 kelas) |
| **Stack** | Vite + React + TypeScript, Google Sheets sebagai database, Google Apps Script sebagai API, deploy di Vercel |
| **Prioritas desain** | Mobile-first, UI berbahasa Indonesia |

---

## 1. Latar Belakang & Tujuan

Wali kelas saat ini mencatat absensi, nilai, dan uang kas langsung di tiga file spreadsheet. Pencatatan lewat HP di Google Sheets sulit dilakukan karena tabelnya lebar (31 kolom tanggal, 20 kolom nilai, 22 kolom minggu) dan rawan salah ketik.

**Tujuan produk:** web app ringan yang membuat tiga pekerjaan rutin itu cepat dilakukan dari HP, tanpa mengubah spreadsheet yang sudah ada sebagai sumber data.

**Indikator berhasil:**
- Absensi satu kelas (32 siswa) selesai diinput kurang dari 30 detik pada hari tanpa kendala.
- Pembayaran kas satu siswa tercatat dalam 2 ketukan.
- Seluruh data tetap bisa dibuka dan diedit manual di Google Sheets kapan saja, dan app langsung mengikuti.

---

## 2. Lingkup

### 2.1 Masuk lingkup (MVP)
1. **Absensi harian** dengan pemilih tanggal (kalender), bisa mengedit tanggal yang sudah lewat, satu sheet per bulan, dan **penandaan hari libur** (Minggu otomatis libur).
2. **Rekap absensi** (Hadir, Izin, Sakit, Alpha) per siswa dalam rentang bulan yang dipilih.
3. **Input nilai** untuk 7 mata pelajaran: penilaian harian, PTS, PAS, serta tampilan rata-rata. Penilaian harian otomatis tersinkronisasi ke sheet Agenda.
4. **Kas mingguan**: centang pembayaran manual, catatan pengeluaran, dan saldo.
5. **Beranda Cerdas**: Kalender interaktif yang menampilkan penanda hari libur dan jadwal penilaian/agenda secara otomatis.

### 2.2 Di luar lingkup (sementara)
- Login, akun, dan RBAC (sengaja ditiadakan karena hanya satu kelas dan satu pengguna).
- Rumus **Nilai Akhir**: kolomnya dibiarkan kosong, rumusnya akan ditentukan sendiri oleh wali kelas di spreadsheet.
- Ekspor PDF/Excel, portal orang tua, notifikasi, mode offline penuh.
- Fitur tambahan akan dibahas saat development berjalan.

---

## 3. Keputusan yang Sudah Disepakati

| # | Topik | Keputusan |
|---|---|---|
| 1 | Struktur absensi | Satu sheet per bulan, bernama **`Bulan-Tahun`** (contoh: `Juli-2026`). Dibuat otomatis dari template jika belum ada. |
| 2 | Pemilih tanggal | Kalender untuk memilih tanggal absensi, termasuk tanggal lampau (editable). |
| 3 | Penanda hadir | Sel diisi huruf **`v`**. Sakit = `S`, Izin = `I`, Alpha = `A`. |
| 4 | Rekap absensi | Hitung Hadir, Izin, Sakit, Alpha per siswa pada rentang bulan yang ditentukan. |
| 5 | Nilai akhir | Kolom `Nilai Akhir` tidak disentuh app (dibiarkan kosong). |
| 6 | Nilai harian | Wali kelas menambah penilaian harian sendiri saat ada penilaian. |
| 7 | Kas | Rp2.000/minggu, berlaku sampai semester genap. Pembayaran **mengisi minggu terlama yang belum lunas**, bukan minggu berjalan. |
| 8 | Pengeluaran kas | Dicatat di app (memakai sheet `Catatan Pengeluaran`). |
| 9 | Backend | **Satu** Apps Script Web App untuk ketiga spreadsheet. |
| 10 | Deploy & UI | Vercel, mobile-first. |
| 11 | Hari libur | Wali kelas dapat menandai sebuah tanggal sebagai **libur**, sehingga seluruh sel tanggal itu berwarna **merah**. Hari **Minggu otomatis libur**. |
| 12 | Keamanan | Belum perlu pengamanan tambahan (tanpa PIN/token) pada tahap ini. |

## 4. Asumsi (Seluruhnya Sudah Disetujui)

| # | Asumsi | Dampak jika salah |
|---|---|---|
| A1 | Satu siswa hanya punya **satu status per hari** (sel absensi hanya memuat satu huruf). | Perlu desain ulang kolom. |
| A2 | *(direvisi)* Hari yang belum diabsen dibiarkan kosong. **Hari libur ditandai oleh wali kelas** (sel berisi `L`, berlatar merah) dan **Minggu otomatis libur**. Rekap hanya menghitung `v/S/I/A`. | — |
| A3 | Satu sheet kas per semester. Sheet `Tahun 2026` yang ada dianggap **Semester Ganjil**, dan sheet Semester Genap dibuat otomatis dari salinannya dengan 22 minggu. | Jumlah minggu genap bisa disesuaikan. |
| A4 | Saldo kas yang ditampilkan di app bersifat **kumulatif** (total pemasukan semua semester dikurangi total pengeluaran). | Saldo per semester jika ingin dipisah. |
| A5 | Nilai berkisar 0–100, boleh desimal. **Sel kosong berarti tidak dinilai**, bukan nol, sehingga tidak ikut dihitung dalam `AVERAGE`. | Perlu aturan khusus untuk siswa yang tidak ikut. |
| A6 | Struktur nilai harian tetap mengikuti spreadsheet: 5 Bab × 4 penilaian (20 slot). | Perlu penambahan kolom otomatis. |
| A7 | *(direvisi)* Tanpa login dan **tanpa pengamanan tambahan** untuk saat ini (PIN/token ditunda). | Lihat bagian 10. |
| A8 | Stack UI: Tailwind CSS, TanStack Query, React Router, date-fns (locale `id`). Tema terang saja, tanpa dark mode. | Mudah diganti. |
| A9 | Siswa diidentifikasi dengan **nomor urut (`NO`, 1–32)**, bukan NIPD. | Lihat risiko R1. |
| A10 | Zona waktu **Asia/Jakarta (WIB)**. | — |

---

## 5. Arsitektur

```
┌──────────────────────────┐   HTTPS (JSON)   ┌─────────────────────────┐
│  React SPA (Vite + TS)   │ ───────────────► │ Google Apps Script       │
│  di Vercel               │ ◄─────────────── │ Web App (satu endpoint)  │
└──────────────────────────┘                  └───────┬─────────────────┘
                                                      │ SpreadsheetApp.openById()
                      ┌───────────────────────────────┼──────────────────────────┐
                      ▼                               ▼                          ▼
              Spreadsheet ABSENSI            Spreadsheet NILAI           Spreadsheet KAS
              (sheet per bulan)              (sheet per mapel)           (sheet per semester
                                                                          + Catatan Pengeluaran)
```

**Prinsip:**
- Spreadsheet adalah **satu-satunya sumber data**. App tidak menyimpan data sendiri, sehingga edit manual di Sheets langsung terbaca.
- Semua rumus yang sudah ada (`AVERAGE`, `COUNTIF`, `SUM`) **tetap berjalan di spreadsheet**. App hanya membaca hasilnya, dan tidak menghitung ulang kecuali untuk rekap lintas bulan.
- Apps Script menjadi satu-satunya pintu akses ke spreadsheet. ID spreadsheet disimpan di **Script Properties**, bukan di kode frontend.

---

## 6. Skema Data per Spreadsheet

Hasil analisis dari file yang Anda kirim. Apps Script membaca baris dan kolom berdasarkan konstanta di `Config.gs`, dan endpoint `validate` (bagian 8) memeriksa kesesuaian strukturnya.

### 6.1 Daftar siswa (master)
32 siswa, kolom `NO | NIPD | NAMA | L/P`. Urutan sama di ketiga file. Sumber master: sheet template absensi (baris 7–38).

### 6.2 Spreadsheet ABSENSI

| Item | Nilai |
|---|---|
| Sheet | `Template` (ganti nama dari `Sheet1`, boleh disembunyikan) dan satu sheet per bulan `Juli-2026`, `Agustus-2026`, dst. |
| Header | Baris 4–6. `E4:AI4` berisi judul bulan, `E6:AI6` berisi tanggal 1–31. |
| Data siswa | Baris 7–38 (kolom A = NO, B = NIPD, C = NAMA, D = L/P) |
| Kolom tanggal | `E` (tgl 1) sampai `AI` (tgl 31) |
| Nilai sel | `v` hadir, `S` sakit, `I` izin, `A` alpha, **`L` libur** (latar merah), kosong = belum diabsen |
| Rekap | `AJ` = S, `AK` = I, `AL` = A, dengan rumus `COUNTIF` |

**Saat membuat sheet bulan baru, Apps Script akan:**
1. Menyalin sheet `Template` dan menamainya sesuai format `Bulan-Tahun`.
2. Mengisi judul `E4` (contoh: `BULAN JULI TAHUN 2026`).
3. Mengisi rumus `COUNTIF` di `AJ:AL` untuk 32 baris. Contoh: `=COUNTIF(E7:AI7;"S")`.
4. Memberi warna abu-abu pada kolom tanggal yang tidak ada di bulan itu (misal 29–31 Februari).
5. **Mengisi `L` pada seluruh 32 sel di setiap kolom hari Minggu** (libur otomatis).
6. Menambahkan kolom `H` (jumlah hadir) di `AM` bersifat opsional, mohon konfirmasi.

**Warna merah libur** memakai *conditional formatting* yang dipasang **sekali di sheet `Template`** pada rentang `E7:AI38`: jika isi sel sama dengan `L`, latar menjadi merah dan huruf putih. Karena aturan ikut tersalin ke setiap sheet bulan, sel yang diketik `L` secara manual di Google Sheets juga otomatis merah. Rumus rekap `S/I/A` tidak terpengaruh oleh `L`.

Pembacaan sel bersifat toleran: `v`, `V`, `✓`, dan `√` semuanya dianggap hadir.

### 6.3 Spreadsheet NILAI

| Item | Nilai |
|---|---|
| Sheet | 7 mapel: `Bahasa Indonesia`, `Seni Rupa`, `Bahasa Jawa`, `Bahasa Inggris`, `IPAS`, `Matematika`, `Pendidikan Pancasila` |
| Header | Baris 5–6 (BAB 1–5, sub-kolom 1–4) |
| Data siswa | Baris 7–38 |
| Nilai harian | `E:X` (20 slot) → Bab 1 = E–H, Bab 2 = I–L, Bab 3 = M–P, Bab 4 = Q–T, Bab 5 = U–X |
| `Y` | **Rata-rata**, rumus `=IFERROR(AVERAGE(E7:X7),"")`, **hanya dibaca** |
| `Z` | PTS (diisi app) |
| `AA` | PAS (diisi app) |
| `AB` | **Nilai Akhir**, **tidak disentuh** (diisi rumus Anda sendiri) |

**Sheet `Agenda` (di dalam file Nilai)**

Sheet khusus bernama `Agenda` untuk menampung riwayat/ jadwal penilaian harian, PTS, dan PAS yang ditambahkan secara otomatis dari form input nilai, dan digunakan sebagai penanda di Kalender Beranda. Kolom: `Tanggal`, `Mapel`, `Keterangan`.

> Catatan: pada permintaan awal tertulis STS/SAS, sedangkan spreadsheet memakai **PTS/PAS**. UI memakai istilah PTS/PAS.

### 6.4 Spreadsheet KAS

**Sheet `Tahun 2026` (= Semester Ganjil)**

| Item | Nilai |
|---|---|
| Header | Baris 4 (kolom `C:X` = minggu 1–22) |
| Data siswa | Baris **6–37**, bergeser satu baris dibanding sheet lain (baris 5 kosong) |
| Pembayaran | `C:X`, checkbox bernilai `TRUE`/`FALSE` |
| `Y` | Total siswa, rumus `=COUNTIF(C6:X6;TRUE)*2000` |
| Ringkasan | `C38` total tabungan kelas, `C39` total pengeluaran, `C40` total akhir |

**Sheet `Catatan Pengeluaran`**

| Kolom | Isi |
|---|---|
| `A` | Nomor (rumus otomatis) |
| `B` | Tanggal pengeluaran |
| `C` | Jumlah |
| `D` | Keterangan |
| Baris 2–20 | Data (19 baris), baris 21 = total |

**Catatan teknis yang perlu ditangani:**
- Kolom `B` saat ini berisi rumus `=IF(C2<>"";TODAY();"")` yang membuat tanggal lama **berubah tiap hari**. Saat app menyimpan pengeluaran, kolom `B` ditulis sebagai **nilai tanggal tetap**, bukan rumus.
- Jika 19 baris penuh, Apps Script menyisipkan baris sebelum baris total dan memperbarui rumus `SUM`.
- Nominal 2000 tertanam di rumus kolom `Y`. App menampilkan nominal dari konstanta `KAS_PER_MINGGU = 2000`. Jika nominal berubah, rumus di sheet dan konstanta di app diperbarui bersama.

---

## 7. Spesifikasi Fitur

### 7.1 Navigasi
Bottom navigation (mobile): **Beranda · Absensi · Nilai · Kas**. Rekap absensi diakses dari menu Absensi.

**Beranda** menampilkan: status absensi hari ini (sudah/belum diabsen, libur, atau jumlah S/I/A), saldo kas, dan pintasan ke tiga fitur utama.

---

### 7.2 Absensi Harian

**Alur:**
1. Halaman membuka **tanggal hari ini**. Wali kelas bisa mengetuk tanggal untuk membuka **kalender** dan memilih tanggal lain (termasuk yang sudah lewat).
2. Kalender memberi **titik penanda** pada tanggal yang sudah punya data absensi.
3. Terdapat tiga tab status: **Sakit · Izin · Alpha**. Wali kelas memilih satu tab terlebih dahulu.
4. Daftar 32 siswa tampil. Wali kelas mengetuk siswa yang sakit/izin/alpha sesuai tab aktif. Siswa yang dipilih diberi lencana warna status.
5. Wali kelas berpindah ke tab lain dan mengulangi langkah 4. Jika siswa yang sudah punya status dipilih lagi di tab berbeda, statusnya **dipindahkan** (sesuai A1).
6. Semua siswa yang tidak dipilih otomatis dianggap **Hadir**.
7. Ada penghitung ringkas: `Hadir n · Sakit n · Izin n · Alpha n`.
8. Tombol **Simpan** menulis satu kolom tanggal pada sheet bulan terkait: `S/I/A` untuk yang dipilih dan `v` untuk sisanya.

**Hari libur:**
- Di atas daftar siswa terdapat tombol **"Tandai Libur"** dengan pertanyaan *"Apakah hari ini libur?"*.
- Jika diaktifkan, daftar siswa dinonaktifkan dan tombol Simpan menulis `L` ke **seluruh 32 sel** pada kolom tanggal itu, yang otomatis tampil **merah** di spreadsheet.
- Tanggal libur ditandai **titik merah** di kalender. Membukanya menampilkan banner *"Hari ini libur"* dengan tombol **Batalkan libur**, yang mengosongkan kolom sehingga absensi bisa diisi normal.
- Menyimpan absensi biasa pada tanggal yang sebelumnya libur menimpa `L` dengan `v/S/I/A`.
- Hari **Minggu otomatis libur**: terisi `L` sejak sheet bulan dibuat. Di app, tanggal Minggu tampil sebagai libur dan **tidak dapat diabsen**. Jika sekali waktu ada kegiatan di hari Minggu, wali kelas dapat mengedit sel langsung di spreadsheet.

**Aturan:**
- Jika tanggal sudah pernah diabsen, data lama **dimuat otomatis** dan halaman berada pada mode "Edit". Menyimpan menimpa kolom tersebut.
- Tersedia tombol **Hapus absensi tanggal ini** (dengan konfirmasi) yang mengosongkan kolomnya.
- Jika sheet bulan belum ada, sheet dibuat otomatis sebelum menyimpan.
- Tanggal masa depan diperbolehkan, tetapi diberi peringatan.
- Pencarian cepat nama siswa tersedia di atas daftar.

**Kriteria penerimaan:**
- [ ] Menyimpan absensi tanggal 5 Juli menulis `v/S/I/A` hanya pada kolom `I` (tgl 5) sheet `Juli-2026`.
- [ ] Membuka tanggal yang sudah terisi menampilkan status yang tepat untuk tiap siswa.
- [ ] Menyimpan pada bulan baru membuat sheet `Agustus-2026` lengkap dengan rumus rekap.
- [ ] Tombol Simpan dinonaktifkan selama proses berjalan (mencegah ganda).
- [ ] Menandai tanggal 17 Agustus sebagai libur mengisi `L` pada 32 sel kolom `Q` (tgl 17) dan sel-sel itu tampil merah.
- [ ] Membatalkan libur mengosongkan kolom tersebut dan warna merah hilang.
- [ ] Setiap hari Minggu pada sheet bulan baru sudah berisi `L` merah, dan tidak bisa diabsen lewat app.
- [ ] Hari libur tidak dihitung sebagai hari efektif pada rekap.

### 7.3 Rekap Absensi (Summary)

**Alur:**
1. Pilih **bulan awal** dan **bulan akhir** (pemilih bulan-tahun). Default: bulan berjalan.
2. Pilih **Semua siswa** atau **satu siswa**.
3. Sistem menghitung untuk tiap siswa: **Hadir, Izin, Sakit, Alpha**, serta persentase kehadiran.

**Aturan perhitungan:**
- Hadir = jumlah sel `v` pada rentang, Sakit = `S`, Izin = `I`, Alpha = `A`.
- **Hari efektif** = jumlah sel yang terisi (hadir + sakit + izin + alpha). Hari kosong dan hari libur (`L`, termasuk Minggu) **tidak dihitung**.
- Persentase kehadiran = Hadir ÷ hari efektif.
- Bulan dalam rentang yang sheet-nya tidak ada **dilewati** dan ditampilkan sebagai catatan.
- Perhitungan dilakukan di sisi Apps Script agar frontend hanya menerima hasil jadi.

**Tampilan:** mode semua siswa berupa daftar kartu ringkas yang dapat diurutkan. Mode satu siswa menampilkan angka besar untuk empat kategori dan rincian per bulan.

**Kriteria penerimaan:**
- [ ] Rentang Juli–September menjumlahkan tiga sheet dengan benar.
- [ ] Hasil sama dengan penjumlahan manual dari spreadsheet.

---

### 7.4 Input Nilai

**Mode di halaman Nilai:**

1. **Pilih mapel**: 7 chip yang dapat digeser horizontal.
2. **Rekap mapel**: daftar siswa dengan Rata-rata, PTS, PAS, dan Nilai Akhir (ditampilkan `—` bila kosong). Mengetuk siswa membuka detail 20 slot nilai harian yang dapat diedit satu per satu.
3. **Tambah Penilaian Harian** (alur utama):
   - Pilih mapel, lalu pilih **Bab (1–5)**.
   - App menentukan slot kosong pertama pada bab itu (penilaian ke-1 sampai ke-4) dan menampilkannya. Slot dapat diganti manual.
   - Daftar 32 siswa tampil dengan kolom angka (keyboard numerik). Siswa yang tidak dinilai dibiarkan kosong.
   - **Simpan** menulis satu kolom ke sheet mapel.
4. **Input PTS / PAS**: pola sama dengan nomor 3, tanpa pemilihan bab.

**Aturan:**
- Slot dianggap "kosong" jika seluruh kolom (32 siswa) belum berisi nilai.
- Jika keempat slot dalam satu bab terisi, app memberi pesan *"Bab ini sudah penuh (4 penilaian)"* dan menawarkan mengedit slot yang ada. Menambah kolom baru ditunda sesuai A6.
- Validasi 0–100. Sel kosong tidak ditulis sebagai 0.
- Kolom **Rata-rata (`Y`)** hanya dibaca. **Kolom Nilai Akhir (`AB`) tidak pernah ditulis app.**
- Perubahan satu sel dari halaman detail disimpan langsung (debounce) dengan indikator tersimpan.

**Kriteria penerimaan:**
- [ ] Penilaian harian Matematika Bab 2 menempati kolom `I` jika `I` kosong, atau `J` jika `I` sudah terisi.
- [ ] Rata-rata yang tampil sama dengan nilai kolom `Y` di spreadsheet.
- [ ] Mengosongkan nilai di app mengosongkan sel, bukan mengisi 0.

---

### 7.5 Kas Mingguan

**Tampilan utama:**
- Tab semester: **Ganjil · Genap**.
- Kartu ringkasan: *Total pemasukan · Total pengeluaran · Saldo* (format `Rp 264.000`).
- Daftar siswa: nama, progres `5/22 minggu`, total `Rp10.000`, dan tombol cepat **+ Bayar**.
- Pencarian nama.

**Alur pembayaran (aturan inti):**
1. Siswa membayar langsung kepada wali kelas.
2. Wali kelas mengetuk **+ Bayar** pada nama siswa.
3. Sistem mencentang **minggu terlama yang belum dibayar** milik siswa itu, bukan minggu berjalan.
   Contoh: siswa belum bayar minggu 5 dan hari ini membayar, maka yang tercentang adalah **minggu 5**.
4. Jika siswa membayar beberapa minggu sekaligus, wali kelas mengetuk berkali-kali atau memakai pengatur jumlah (1–n minggu), dan sistem mencentang n minggu belum lunas terlama secara berurutan.
5. Mengetuk nama siswa membuka rincian 22 chip minggu. Chip dapat diketuk untuk **koreksi manual** (mencentang atau membatalkan minggu tertentu). Pembatalan meminta konfirmasi.

**Pengeluaran:**
- Daftar pengeluaran (tanggal, jumlah, keterangan) dan tombol **Tambah Pengeluaran**.
- Tanggal default = hari ini dan dapat diubah. Tersedia hapus dan edit.
- Saldo = total pemasukan − total pengeluaran (A4).

**Semester genap:** tombol **Buat Semester Genap** menyalin sheet ganjil dengan seluruh centang direset menjadi `FALSE`, memakai nama sheet otomatis (A3).

**Fitur opsional (fase lanjutan):** penanda *"menunggak"* membutuhkan tanggal mulai semester. Jika diberikan, app membandingkan jumlah minggu berjalan dengan jumlah minggu terbayar.

**Kriteria penerimaan:**
- [ ] Tombol **+ Bayar** pada siswa yang kosong minggu 5–22 mencentang kolom minggu 5, dan total siswa bertambah Rp2.000.
- [ ] Respons UI instan (optimistic update), dikembalikan otomatis jika penyimpanan gagal.
- [ ] Menambah pengeluaran mengurangi saldo yang tampil, dan sama dengan sel `C40` di sheet.

---

## 8. Kontrak API Apps Script

**Endpoint tunggal** (`VITE_GAS_URL`). Respons selalu berbentuk:
```json
{ "ok": true, "data": { } }
{ "ok": false, "error": { "code": "BAB_FULL", "message": "Bab ini sudah penuh" } }
```

**Aturan teknis Web App:**
- Pembacaan memakai `GET ?action=...&param=...`.
- Penulisan memakai `POST` dengan header `Content-Type: text/plain;charset=utf-8` dan body JSON string. Ini menghindari *CORS preflight* yang tidak didukung Apps Script.
- Semua penulisan dibungkus `LockService.getScriptLock()` agar dua permintaan tidak saling menimpa.
- Tanggal selalu `YYYY-MM-DD`, bulan selalu `YYYY-MM`.

| Action | Metode | Parameter | Hasil |
|---|---|---|---|
| `validate` | GET | – | Cek struktur ketiga spreadsheet, urutan nama siswa sama, dan sheet wajib ada |
| `students.list` | GET | – | `[{no, nipd, nama, jk}]` |
| `beranda.overview` | GET | `date, year, month` | `{absenDay, kasSummary, absenMonthOverview, agendaMonth}` (Digunakan di Beranda untuk 1x fetch) |
| `absensi.getDay` | GET | `date` | `{recorded, libur, entries:[{no,status}]}` (`H/S/I/A`) |
| `absensi.monthOverview` | GET | `month` | `{recordedDates:[...], liburDates:[...]}` untuk penanda kalender (Minggu ikut `liburDates`) |
| `absensi.saveDay` | POST | `date, entries[]` | Menulis kolom tanggal, membuat sheet bulan bila perlu. Ditolak (`SUNDAY_LOCKED`) untuk hari Minggu |
| `absensi.setLibur` | POST | `date, libur(bool)` | `true` mengisi `L` pada 32 sel kolom tanggal, `false` mengosongkannya. Ditolak untuk hari Minggu |
| `absensi.clearDay` | POST | `date` | Mengosongkan kolom tanggal |
| `absensi.summary` | GET | `from, to, no?` | Per siswa: `{hadir, sakit, izin, alpha, hariEfektif, persen}` + `skippedMonths[]` |
| `nilai.subjects` | GET | – | Daftar mapel |
| `nilai.getSheet` | GET | `subject` | Per siswa: `{no, daily:[20], rataRata, pts, pas, nilaiAkhir}` |
| `nilai.addDaily` | POST | `subject, bab, slot?, scores[]` | Menulis ke slot kosong pertama (atau `slot`), kode `BAB_FULL` bila penuh |
| `nilai.setExam` | POST | `subject, type(PTS/PAS), scores[]` | Menulis kolom `Z`/`AA` |
| `nilai.setCell` | POST | `subject, no, field, bab?, slot?, value` | Edit satu sel (`value: null` untuk mengosongkan) |
| `kas.getSemester` | GET | `semester` | Per siswa: `{no, weeks:[22 bool], total}` + ringkasan |
| `kas.pay` | POST | `semester, no, count=1` | Mencentang `count` minggu terlama belum bayar; mengembalikan minggu yang tercentang |
| `kas.setWeek` | POST | `semester, no, week, paid` | Koreksi satu minggu |
| `kas.createSemester` | POST | `semester` | Membuat sheet Genap dari salinan Ganjil |
| `kas.expenses.list/add/update/delete` | GET/POST | – | Mengelola `Catatan Pengeluaran` |
| `kas.summary` | GET | – | `{pemasukan, pengeluaran, saldo}` |

**Struktur kode Apps Script:** `Code.gs` (router `doGet`/`doPost`), `Config.gs` (konstanta baris/kolom/nama sheet), `Students.gs`, `Absensi.gs`, `Nilai.gs`, `Kas.gs`, `Utils.gs`.

**Script Properties:** `ABSENSI_SS_ID`, `NILAI_SS_ID`, `KAS_SS_ID`, `API_TOKEN` (opsional, belum dipakai).

**Cara mencari baris:** siswa dicari berdasarkan nomor urut (`NO`) pada kolom A dengan offset per sheet (absensi/nilai = `NO + 6`, kas = `NO + 5`). `validate` memastikan nama pada tiap file cocok dengan master.

---

## 9. Spesifikasi Frontend

### 9.1 Struktur proyek
```
kelas-app/
├─ apps-script/            # kode GAS (opsional dikelola dengan clasp)
├─ src/
│  ├─ api/                 # client.ts (fetch + parsing), absensi.ts, nilai.ts, kas.ts
│  ├─ components/          # BottomNav, DatePickerSheet, StudentRow, StatusTabs, Toast, Skeleton, ...
│  ├─ features/
│  │  ├─ absensi/          # AbsensiPage, RekapPage, hooks
│  │  ├─ nilai/            # NilaiPage, TambahPenilaian, DetailSiswa
│  │  └─ kas/              # KasPage, BayarSheet, PengeluaranPage
│  ├─ lib/                 # tanggal.ts (nama bulan ID), rupiah.ts, konstanta.ts
│  ├─ types/               # tipe bersama
│  ├─ App.tsx, main.tsx, routes.tsx
├─ .env.example            # VITE_GAS_URL=
├─ vercel.json             # SPA rewrite
└─ README.md
```

### 9.2 Rute
`/` Beranda · `/absensi` · `/absensi/rekap` · `/nilai` · `/nilai/:mapel` · `/kas` · `/kas/pengeluaran`

### 9.3 Tipe inti (TypeScript)
```ts
export type Siswa = { no: number; nipd: string | null; nama: string; jk: 'L' | 'P' };
export type StatusAbsen = 'H' | 'S' | 'I' | 'A';
export type AbsenEntry = { no: number; status: StatusAbsen };
export type AbsenDay = { date: string; recorded: boolean; libur: boolean; entries: AbsenEntry[] };
export type RekapSiswa = { no: number; hadir: number; sakit: number; izin: number; alpha: number; hariEfektif: number; persen: number };
export type NilaiRow = { no: number; daily: (number | null)[]; rataRata: number | null; pts: number | null; pas: number | null; nilaiAkhir: number | null };
export type KasRow = { no: number; weeks: boolean[]; total: number };
export type Pengeluaran = { id: number; tanggal: string; jumlah: number; keterangan: string };
```

### 9.4 Perilaku UI/state
- **TanStack Query** untuk cache. Daftar siswa di-cache panjang, data absensi/nilai/kas di-refetch saat halaman dibuka dan saat tab aktif kembali.
- **Optimistic update** untuk centang kas dan edit sel nilai, dengan rollback dan toast error bila gagal.
- **Skeleton loader** saat memuat, karena Apps Script bisa lambat (≈1–3 detik, lebih lama saat *cold start*).
- Tombol aksi selalu dinonaktifkan saat permintaan berjalan.
- Peringatan sebelum meninggalkan halaman jika ada perubahan absensi/nilai yang belum disimpan.

---

## 10. Persyaratan Non-Fungsional

| Aspek | Persyaratan |
|---|---|
| **Mobile-first** | Dirancang mulai lebar 360 px. Target sentuh minimal 44×44 px. Aksi utama (Simpan) berada pada bar bawah yang menempel. Tabel lebar diganti kartu/daftar. |
| **Bahasa** | Seluruh UI Bahasa Indonesia, tanggal `5 Juli 2026`, uang `Rp 2.000`. |
| **Kinerja** | Tampilan pertama < 2 detik pada 4G. Data absensi 1 hari dimuat dengan satu panggilan. |
| **Keandalan** | Penulisan di-lock, kesalahan jaringan memberi pesan jelas dan opsi coba lagi, tidak ada penyimpanan ganda. |
| **Kompatibilitas** | Chrome/Safari mobile terbaru dan browser desktop modern. |
| **Aksesibilitas** | Kontras warna memadai, status tidak hanya dibedakan warna (ada huruf S/I/A). |
| **PWA (opsional)** | Manifest agar bisa dipasang di layar utama HP. Mode offline tidak termasuk. |

### Keamanan
Sesuai keputusan, **tidak ada pengamanan tambahan pada tahap ini**. Risikonya diketahui dan diterima: siapa pun yang mengetahui URL Apps Script atau URL web app bisa membaca dan mengubah data.

Praktik minimum yang tetap dijalankan:
- URL Apps Script disimpan di environment variable Vercel, tidak ditulis di kode.
- Repositori dibuat **privat**, dan tidak ada data siswa di dalam repositori.
- URL web app tidak disebarkan.

**Opsi yang ditunda** (bisa ditambahkan kapan saja tanpa mengubah fitur): proxy Vercel Serverless Function (`api/gas.ts`) dengan token rahasia di sisi server, atau PIN sederhana saat membuka app.

Data pribadi anak sebaiknya tidak disertakan dalam repositori publik. Pakai repositori privat.

---

## 11. Deploy

**Apps Script**
1. Buat proyek Apps Script, tempelkan kode, lalu isi Script Properties dengan ID tiga spreadsheet.
2. *Deploy → Web app*: **Execute as: Me**, **Who has access: Anyone**.
3. Untuk setiap perubahan kode, buat **versi deployment baru pada deployment yang sama** supaya URL tidak berubah.

**Vercel**
1. Hubungkan repositori, framework preset **Vite**.
2. Environment variable: `VITE_GAS_URL`.
3. `vercel.json` berisi rewrite semua rute ke `index.html` untuk React Router.

---

## 12. Tahapan Pengerjaan

| Fase | Isi | Hasil |
|---|---|---|
| **0. Fondasi** | Rapikan spreadsheet (ganti nama `Template`, cek `validate`), kerangka Apps Script (router, config, students), proyek Vite + Tailwind + routing + client API, layout bottom nav | App kosong terhubung ke spreadsheet |
| **1. Absensi** | `getDay/saveDay/clearDay/setLibur/monthOverview`, pembuatan sheet bulanan otomatis (Minggu otomatis libur, format bersyarat merah), UI status-dulu-baru-siswa, kalender, tombol Tandai Libur | Absensi harian berfungsi penuh |
| **2. Rekap absensi** | `summary` lintas bulan, UI rentang bulan dan detail siswa | Rekap sesuai hitungan manual |
| **3. Kas** | `getSemester/pay/setWeek`, pengeluaran, saldo, pembuatan semester genap | Kas dan saldo konsisten dengan sheet |
| **4. Nilai** | `getSheet/addDaily/setExam/setCell`, UI tambah penilaian dan detail | Nilai harian, PTS, PAS tersimpan benar |
| **5. Penyempurnaan** | Beranda, PWA, uji di beberapa HP, perbaikan UX | Siap dipakai harian |

Saya menyarankan urutan Absensi → Kas → Nilai karena absensi dipakai tiap hari dan kas tiap minggu.

---

## 13. Risiko & Penanganan

| # | Risiko | Penanganan |
|---|---|---|
| R1 | Siswa **AZKA MUTIA AZAHRA** belum memiliki NIPD (dan nomor 2395 serta 2400 terlewat). | Identitas memakai nomor urut `NO`, NIPD ditampilkan `—` bila kosong. Mohon dilengkapi nanti. |
| R2 | Urutan siswa berbeda antar file bila ada siswa pindah/masuk. | `validate` membandingkan nama per baris dan melaporkan selisih. Perubahan daftar dilakukan serentak di ketiga file. |
| R3 | Apps Script lambat atau kena kuota. | Skeleton, optimistic update, pemanggilan dikelompokkan, cache TanStack Query. |
| R4 | Spreadsheet diedit manual saat struktur berubah (kolom disisipkan, dll.). | Konstanta di `Config.gs`, `validate` mendeteksi header yang bergeser. |
| R5 | Tanggal `TODAY()` di pengeluaran berubah terus. | Ditulis sebagai nilai tetap (bagian 6.4). |
| R6 | Kebocoran URL karena tanpa autentikasi. | Risiko diterima untuk saat ini. Praktik minimum dan opsi proxy/PIN yang ditunda ada di bagian 10. |
| R7 | Salah tanggal menimpa absensi hari lain. | Tanggal terpilih selalu ditampilkan jelas, mode "Edit" jika sudah terisi, ada konfirmasi sebelum menimpa. |

---

## 14. Keputusan Akhir atas Pertanyaan Terbuka

Seluruh asumsi (A1–A10) disetujui. Pertanyaan terbuka diputuskan memakai asumsi dasar:

1. Kolom **Hadir (`H`)** **ditambahkan** pada sheet absensi bulanan (kolom `AM`).
2. Penanda **"menunggak"** pada kas **ditunda** (di luar MVP).
3. Warna dan logo sekolah: lihat `design.md`.
4. Libur memakai huruf **`L`** dengan latar merah `#C62E24`.

Dokumen pendamping untuk pengembangan: `design.md`, `spreadsheet-schema.md`, `api-contract.ts`, `tasks.md`, `CLAUDE.md`.
