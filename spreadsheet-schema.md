# spreadsheet-schema.md

Peta pasti ketiga spreadsheet. Angka di sini berasal dari analisis file asli
(`ABSENSI_KELAS_3.xlsx`, `DAFTAR_NILAI_KELAS_3_SDN_1_PANDANMULYO.xlsx`, `DAFTAR_IURAN_KELAS_3_SDN_1_PANDANMULYO.xlsx`).
**Tugas T0.9 memverifikasi ulang semuanya terhadap salinan `_DEV`.** Jika ada selisih, perbarui dokumen ini, lalu `Config.gs`. Jangan menebak.

## 0. Konvensi

- Semua indeks baris dan kolom di sini berbasis spreadsheet (baris 1, kolom A).
- Siswa dikenali dengan `no` (1–32). Urutan siswa **sama** di ketiga file.
- Konversi `no` → baris:

| Spreadsheet | Baris siswa | Rumus |
|---|---|---|
| Absensi (semua sheet bulan dan `Template`) | 7–38 | `baris = no + 6` |
| Nilai (semua sheet mapel) | 7–38 | `baris = no + 6` |
| Kas (sheet semester) | **6–37** | `baris = no + 5` (bergeser satu!) |

- Rumus lewat `setFormula` memakai sintaks Inggris (koma). Rumus pada file asli tampil dengan titik koma karena lokal Indonesia.
- Checkbox dibaca sebagai boolean `true`/`false`, ditulis dengan `setValue(true|false)`.
- Siswa **AZKA MUTIA AZAHRA** tidak punya NIPD. NIPD 2395 dan 2400 terlewat dalam urutan. Perlakukan NIPD sebagai teks opsional (`null` bila kosong).

## 1. Master siswa

Sumber: sheet `Template` pada spreadsheet absensi, baris 7–38.

| Kolom | Isi |
|---|---|
| A | `no` (1–32) |
| B | NIPD (bisa kosong) |
| C | Nama |
| D | `L` atau `P` |

`validate` membandingkan kolom nama (C pada absensi dan nilai, kolom nama pada kas) baris demi baris dengan master. Selisih dilaporkan sebagai `STRUCTURE_MISMATCH`.

## 2. Spreadsheet ABSENSI

### 2.1 Sheet

| Sheet | Fungsi |
|---|---|
| `Template` | Bekas `Sheet1`. Disalin untuk membuat bulan baru. Boleh disembunyikan. |
| `Juli-2026`, `Agustus-2026`, ... | Satu sheet per bulan. Format nama **`NamaBulan-Tahun`** dengan nama bulan Indonesia: Januari, Februari, Maret, April, Mei, Juni, Juli, Agustus, September, Oktober, November, Desember. |

Tahun pelajaran 2026/2027: Semester Ganjil = Juli–Desember 2026, Semester Genap = Januari–Juni 2027.

### 2.2 Tata letak

| Item | Posisi |
|---|---|
| Judul bulan | `E4` (sel gabungan `E4:AI4`), contoh `BULAN JULI TAHUN 2026` |
| Angka tanggal | `E6:AI6` berisi 1–31 |
| Data siswa | A7:D38 |
| Kolom tanggal | `E` (tgl 1) sampai `AI` (tgl 31). Kolom tanggal `d` = kolom nomor `4 + d` (tgl 1 = E = kolom 5) |
| Rekap Sakit | `AJ` |
| Rekap Izin | `AK` |
| Rekap Alpha | `AL` |
| Rekap Hadir (**ditambahkan**) | `AM` |

Rumus rekap (baris 7, diisi untuk 7–38):

```
AJ7: =COUNTIF(E7:AI7,"S")
AK7: =COUNTIF(E7:AI7,"I")
AL7: =COUNTIF(E7:AI7,"A")
AM7: =COUNTIF(E7:AI7,"v")
```

`COUNTIF` tidak membedakan huruf besar dan kecil, jadi `V` juga terhitung. `✓` dan `√` tidak terhitung oleh rumus ini. Karena app menulis `v`, ini tidak menjadi masalah. Rekap lintas bulan dihitung oleh Apps Script, bukan oleh kolom ini.

### 2.3 Nilai sel absensi

| Isi sel | Arti |
|---|---|
| `v` | Hadir |
| `S` | Sakit |
| `I` | Izin |
| `A` | Alpha |
| `L` | Libur (latar merah) |
| kosong | Belum diabsen |

Saat membaca, `v`, `V`, `✓`, `√` semuanya dianggap hadir.

### 2.4 Membuat sheet bulan baru (`ensureMonthSheet`)

1. Jika sheet bernama `NamaBulan-Tahun` sudah ada, berhenti (idempoten).
2. Salin `Template`, ubah nama.
3. Isi `E4` dengan `BULAN <NAMA BULAN HURUF BESAR> TAHUN <tahun>`.
4. Isi rumus rekap `AJ:AM` untuk baris 7–38.
5. Beri latar abu-abu pada kolom tanggal yang tidak ada di bulan itu (misal tanggal 29–31 pada Februari). Kolom itu tidak pernah ditulis.
6. Isi `L` pada seluruh 32 sel (baris 7–38) di setiap kolom yang jatuh pada hari **Minggu**.
7. Aturan format bersyarat sudah ada di `Template` sehingga ikut tersalin.

### 2.5 Format bersyarat (dipasang sekali di `Template`)

- Rentang: `E7:AI38`
- Kondisi: isi sel sama dengan `L`
- Format: latar `#C62E24`, huruf putih

## 3. Spreadsheet NILAI

### 3.1 Sheet (tujuh mapel, nama persis)

`Bahasa Indonesia`, `Seni Rupa`, `Bahasa Jawa`, `Bahasa Inggris`, `IPAS`, `Matematika`, `Pendidikan Pancasila`

### 3.2 Tata letak (sama untuk semua sheet)

| Item | Posisi |
|---|---|
| Header bab dan sub-kolom | Baris 5–6 |
| Data siswa | A7:D38 |
| Nilai harian (20 slot) | `E:X` |
| **Rata-rata** | `Y`, rumus `AVERAGE(E:X)` per baris. **Hanya dibaca.** |
| **PTS** | `Z` |
| **PAS** | `AA` |
| **Nilai Akhir** | `AB`. **Tidak pernah ditulis app.** Pemilik mengisi rumusnya sendiri. Kosong untuk saat ini. |

Pemetaan bab dan slot:

| Bab | Kolom | Nomor kolom |
|---|---|---|
| 1 | E–H | 5–8 |
| 2 | I–L | 9–12 |
| 3 | M–P | 13–16 |
| 4 | Q–T | 17–20 |
| 5 | U–X | 21–24 |

Kolom slot: `kolom = 5 + (bab - 1) * 4 + (slot - 1)`, dengan `bab` 1–5 dan `slot` 1–4.

### 3.3 Aturan

- Sel kosong = tidak dinilai. `AVERAGE` mengabaikannya. **Jangan menulis 0.**
- Nilai valid: 0–100, boleh desimal.
- Slot dianggap **kosong** bila seluruh 32 sel pada kolom itu kosong.
- Bila keempat slot dalam satu bab terisi, `nilai.addDaily` mengembalikan `BAB_FULL`.
- Menulis ke kolom `Y` atau `AB` harus ditolak dengan `INVALID_INPUT`.
- Pada file asli, rumus `Y` mungkin tidak menutup galat pada baris tanpa nilai. Bila `Y` berisi galat, app menampilkan `—`.

## 4. Spreadsheet KAS

### 4.1 Sheet

| Sheet | Fungsi |
|---|---|
| `Tahun 2026` | **Semester Ganjil.** Nama dipertahankan seperti adanya. |
| (dibuat otomatis) | **Semester Genap.** Salinan sheet ganjil dengan seluruh centang direset. Beri nama `Semester Genap 2026-2027`. |
| `Catatan Pengeluaran` | Dipakai bersama oleh kedua semester. |

Peta semester → sheet disimpan sebagai konstanta di `Config.gs`.

### 4.2 Tata letak sheet semester

| Item | Posisi |
|---|---|
| Header minggu | Baris 4, `C:X` berisi 1–22 |
| Data siswa | Baris **6–37** (baris 5 kosong). Nomor di kolom A, nama di kolom B |
| Pembayaran | `C:X` (22 minggu), checkbox boolean |
| Total siswa | `Y`, rumus `=COUNTIF(C6:X6,TRUE)*2000` |
| Total tabungan kelas | `C38` |
| Total pengeluaran | `C39` (mengambil dari `Catatan Pengeluaran`) |
| Total akhir | `C40` |

Kolom minggu: `kolom = 2 + minggu` (minggu 1 = C = kolom 3).

Nominal **Rp2.000 per minggu** tertanam di rumus kolom `Y`. App memakai konstanta `KAS_PER_MINGGU = 2000`. Bila nominal berubah, ubah keduanya sekaligus.

### 4.3 Sheet `Catatan Pengeluaran`

| Kolom | Isi |
|---|---|
| A | Nomor (rumus otomatis) |
| B | Tanggal |
| C | Jumlah (angka) |
| D | Keterangan |

- Baris data 2–20 (19 baris). Baris 21 = total (`SUM` pada `C2:C20`).
- **Kolom B pada file asli berisi rumus `IF(C2<>"", TODAY(), "")`** yang membuat tanggal berubah setiap hari. Saat app menulis pengeluaran, kolom B ditulis sebagai **nilai tanggal tetap** (bukan rumus). Jika baris lama masih berisi rumus itu, ganti dengan nilai tetap saat pertama kali baris diubah.
- Baris kosong berikutnya = baris pertama dengan kolom C kosong.
- Jika 19 baris penuh: sisipkan satu baris sebelum baris total, lalu perbarui rumus `SUM` agar mencakup baris baru.

### 4.4 Aturan pembayaran

`kas.pay` memilih minggu dengan nilai `false` yang **terkecil** pada baris siswa, lalu mengubahnya menjadi `true`. Untuk `count > 1`, ambil `count` minggu belum lunas terkecil secara berurutan. Jika tidak ada yang belum lunas, kembalikan `NOTHING_TO_PAY`.

### 4.5 Saldo

```
saldo = (jumlah semua centang di semua sheet semester × 2000) − (total pengeluaran)
```

Dihitung kumulatif lintas semester. Sel `C38:C40` di tiap sheet semester hanya menunjukkan angka semester itu.

## 5. Script Properties (Apps Script)

| Kunci | Isi |
|---|---|
| `ABSENSI_SS_ID` | ID spreadsheet absensi (`_DEV` saat pengembangan) |
| `NILAI_SS_ID` | ID spreadsheet nilai |
| `KAS_SS_ID` | ID spreadsheet kas |

## 6. Hal yang rawan salah

1. Offset baris kas (`no + 5`) berbeda dari absensi dan nilai (`no + 6`).
2. Kolom hari Minggu pada sheet absensi terisi `L` sejak sheet dibuat. Jangan menimpanya.
3. Hari yang belum diabsen (kosong) berbeda dari hari libur (`L`): hanya `v/S/I/A` yang dihitung sebagai hari efektif.
4. `TODAY()` pada `Catatan Pengeluaran` kolom B.
5. Nilai kosong tidak boleh menjadi 0.
6. Jangan pernah menulis ke `AB` (Nilai Akhir) maupun `Y` (Rata-rata) pada sheet nilai.
7. Rumus Apps Script memakai koma, bukan titik koma.
