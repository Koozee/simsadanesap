# Design — Administrasi Kelas 3 SDN 1 Pandanmulyo

Panduan visual untuk web app absensi, nilai, dan kas. Dokumen pendamping `prd.md`.

## 1. Arah desain

**Lambang sekolah ramai, antarmukanya tenang.**
Logo berisi burung Garuda, perisai, obor, buku, bukit, dan padi. Isinya sudah banyak, jadi app tidak perlu menambah hiasan. Dari logo kita hanya mengambil tiga hal: **warna** (biru ring, emas tepi, hijau bukit), **bentuk lingkaran ganda** (ring biru berbingkai garis emas tipis), dan **ketegasan huruf** pada tulisan melingkarnya.

**Siapa yang memakai:** wali kelas, satu tangan, di HP, sering sambil berdiri di depan kelas. Jadi yang diutamakan adalah keterbacaan, target ketuk yang besar, dan tombol simpan yang selalu terjangkau. Tampilan yang menarik perhatian bukan prioritas.

**Satu hal yang dibuat istimewa:** *cincin progres* bergaya ring logo (jalur biru dengan garis emas tipis di dalamnya). Cincin ini muncul di beranda (kehadiran hari ini) dan di rekap per siswa. Selain itu, semuanya sengaja polos.

## 2. Warna

Nilai biru dan emas diambil dari piksel logo (`#00359D` pada ring, `#FCBC23` pada tepi emas, `#F7F3DE` pada latar perisai). Warna lain diturunkan darinya.

### 2.1 Warna inti

| Token | Hex | Dipakai untuk |
|---|---|---|
| `biru-600` | `#00359D` | Warna utama: tombol utama, tautan, tab aktif, header |
| `biru-700` | `#002A7D` | Tombol utama saat ditekan |
| `biru-50` | `#EAF0FB` | Latar tab aktif, avatar inisial, baris terpilih |
| `navy-900` | `#0C1B4B` | Teks utama |
| `slate-600` | `#4A5578` | Teks sekunder (nomor absen, keterangan) |
| `garis` | `#D6DCEB` | Garis pemisah dan batas input |
| `latar` | `#F5F7FC` | Latar halaman (putih kebiruan, bukan krem) |
| `permukaan` | `#FFFFFF` | Baris daftar, sheet, input |
| `emas-400` | `#F6BE26` | **Hanya** garis tepi header dan penanda "berikutnya" (lihat 2.3) |
| `krem-100` | `#F7F3DE` | Latar banner informasi (mis. "Hari ini belum diabsen") |

Latar halaman sengaja putih kebiruan. Krem dari logo hanya dipakai pada banner kecil, supaya halaman tidak terlihat kekuningan.

### 2.2 Warna status

Setiap status punya tiga bagian: **huruf** (selalu tampil), warna isi, dan warna teks. Warna tidak pernah menjadi satu-satunya pembeda.

| Status | Huruf | Latar lembut | Teks di latar lembut | Warna solid (tab aktif) |
|---|---|---|---|---|
| Hadir | `v` | `#DDF1E2` | `#17612D` | `#1F7A3A` |
| Sakit | `S` | `#FCE9C2` | `#7A4A00` | `#A35F00` |
| Izin | `I` | `#D8EBFA` | `#0B4F86` | `#1C6FB5` |
| Alpha | `A` | `#F9D9D5` | `#8E1C14` | `#C62E24` |
| Libur | `L` | `#C62E24` | `#FFFFFF` | `#C62E24` |

- **Libur dan Alpha sama-sama merah, tetapi tidak pernah tampil di tempat yang sama.** Alpha menempel pada siswa, Libur menempel pada tanggal (banner, titik kalender, dan satu kolom penuh di spreadsheet). Aturan pewarnaan sheet memakai `#C62E24` agar seragam.
- Hijau, biru muda, dan merah diambil dari bukit, langit, dan atap gedung di logo.

### 2.3 Aturan pemakaian emas

Emas gampang berubah menjadi hiasan. Di app ini emas hanya punya **dua tugas**:
1. Garis tipis (2 px) di bawah header, menggemakan tepi emas pada ring logo.
2. Penanda minggu kas **yang akan terisi** bila wali kelas mengetuk "Catat bayar" (cincin emas pada chip). Maknanya: "yang berikutnya".

Emas tidak dipakai untuk tombol, latar, gradasi, ikon, atau teks.

### 2.4 Kontras (sudah dihitung)

| Pasangan | Rasio |
|---|---|
| `navy-900` di `permukaan` | 16,5 : 1 |
| `slate-600` di `latar` | 6,8 : 1 |
| Putih di `biru-600` | 10,5 : 1 |
| `navy-900` di `emas-400` | 9,7 : 1 |
| Teks status di latar lembut | 6,3 sampai 6,9 : 1 |
| Putih di warna solid status | 5,0 sampai 5,5 : 1 |

Semua pasangan lolos WCAG AA (4,5 : 1) untuk teks normal.

## 3. Tipografi

Dua keluarga huruf yang jelas berbeda, dipasang lokal (*self-host*) supaya tetap cepat di jaringan sekolah dan tidak bergantung pada layanan font pihak ketiga.

| Peran | Font | Alasan |
|---|---|---|
| Judul, nama halaman, angka besar, label tab | **Lexend** (variabel) | Dirancang untuk memudahkan membaca. Bentuknya lebar dan tegas, dekat dengan karakter huruf tebal pada ring logo. |
| Teks daftar, tabel angka, keterangan | **Source Sans 3** (variabel) | Lebih rapat sehingga muat banyak nama, dan mendukung angka sejajar (`tabular-nums`) untuk nilai dan rupiah. |

Paket: `@fontsource-variable/lexend` dan `@fontsource-variable/source-sans-3`.

### Skala (mobile, rasio ±1,25)

| Gaya | Ukuran / tinggi baris | Font, bobot |
|---|---|---|
| Angka besar (ringkasan) | 32 / 36 | Lexend 600 |
| Judul halaman | 24 / 30 | Lexend 600 |
| Judul bagian | 18 / 24 | Lexend 500 |
| Teks, nama siswa | 17 / 24 | Source Sans 3 500 |
| Teks sekunder | 15 / 22 | Source Sans 3 400 |
| Keterangan kecil | 13 / 18 | Source Sans 3 400 (minimum) |

Aturan:
- Kalimat memakai huruf kecil biasa (*sentence case*). **Tidak ada huruf kapital semua** untuk label, dan tidak ada label kecil di atas judul.
- Angka nilai, nomor absen, dan rupiah memakai `font-variant-numeric: tabular-nums`.
- Lebar baris teks maksimal 60 karakter. Nama siswa dipotong dengan elipsis di satu baris, tidak dibungkus.

## 4. Bentuk, jarak, dan ukuran

**Satuan jarak:** kelipatan 4 px (4, 8, 12, 16, 24, 32). Padding halaman 16 px.

**Radius mengikuti peran, tidak sama rata:**

| Elemen | Radius |
|---|---|
| Input, chip minggu, lencana status | 6 px |
| Tombol | 10 px |
| Bottom sheet (sudut atas saja) | 20 px |
| Avatar inisial, cincin progres | lingkaran penuh |

**Struktur daftar, bukan tumpukan kartu.** Daftar siswa adalah satu permukaan putih dengan garis pemisah 1 px (`garis`) di antara baris. Kartu terpisah hanya dipakai untuk ringkasan di beranda.

**Bayangan.** Baris dan kartu memakai garis, bukan bayangan. Bayangan hanya untuk elemen yang melayang di atas isi: bar simpan, bottom sheet, dan toast. Warna bayangan diturunkan dari navy (`rgba(12, 27, 75, 0.14)`).

**Target ketuk:** baris daftar minimal 56 px, tombol dan chip minimal 44 px. Jarak antar target minimal 8 px.

**Ikon:** Lucide, ukuran 20 px, garis 1,75 px. Ikon selalu disertai label teks pada navigasi.

**Fokus keyboard:** garis 2 px `biru-600` dengan jarak 2 px, terlihat di semua elemen interaktif.

## 5. Penggunaan logo

File: `SDNegeri1Pandanmulyo.webp` (1254 × 1254 px, latar transparan).

| Konteks | Ukuran | Catatan |
|---|---|---|
| Header app | 36 px | Pada ukuran ini tulisan melingkar tidak terbaca, jadi lambang dipakai sebagai tanda saja. Nama sekolah ditulis dengan teks di sebelahnya. |
| Beranda (puncak halaman) | 96 px | Tulisan melingkar mulai terbaca. |
| Ikon PWA / layar utama HP | 192 dan 512 px | Beri ruang kosong 10% di semua sisi agar aman saat dipotong (*maskable*). |
| Favicon | 32 px dari bagian tengah | Pangkas ke perisai dan obor saja. Ring dan tulisan menjadi kabur di 32 px. |

Aturan:
- Jarak bebas di sekeliling logo minimal seperdelapan diameter.
- Jangan diubah warnanya, diberi bayangan, diberi bingkai, diregangkan, atau diletakkan di atas foto.
- Letakkan di atas `permukaan` putih atau `biru-600`. Logo sudah memiliki ring biru, jadi di atas biru pekat ring bisa menyatu. Beri lingkaran putih setebal 3 px di sekelilingnya pada kasus itu.
- Berkas saat ini berupa raster. Bila ada, minta versi **SVG** dari pembuat logo agar tajam di semua ukuran. Sementara itu, ekspor ke `logo-40.webp`, `logo-96.webp`, `icon-192.png`, `icon-512.png`.
- `theme-color` browser: `#00359D`.

## 6. Pola layar

### 6.1 Kerangka

```
┌────────────────────────────────┐
│ [logo]  Kelas 3                │  biru-600, teks putih
│         SDN 1 Pandanmulyo      │
├────────────────────────────────┤  garis emas 2 px
│                                │
│   isi halaman (latar #F5F7FC)  │
│                                │
├────────────────────────────────┤
│ Beranda  Absensi  Nilai   Kas  │  tab bawah, 4 item
└────────────────────────────────┘
```

Tab aktif: ikon dan label `biru-600` bobot 600, dengan latar `biru-50` di belakang ikon. Tab tidak aktif: `slate-600`.

**Saat ada perubahan belum disimpan** (absensi, penilaian), tab bawah digantikan bar **Simpan** selebar layar. Tab muncul kembali setelah tersimpan atau dibatalkan. Dengan begitu hanya ada satu aksi di dasar layar.

### 6.2 Beranda

```
┌────────────────────────────────┐
│ Senin, 5 Oktober 2026          │
│                                │
│   (◯ cincin)   Hadir 29 dari 32│
│    90%         Sakit 1  Izin 1 │
│                Alpha 1         │
│   [ Buka absensi hari ini ]    │
├────────────────────────────────┤
│ Kas semester ganjil            │
│ Saldo  Rp 198.000              │
│ Pemasukan 264.000  Keluar 66.000│
│ [ Catat pembayaran ]           │
└────────────────────────────────┘
```

- Jika hari ini belum diabsen: cincin diganti banner `krem-100` bertuliskan "Absensi hari ini belum diisi" dan satu tombol "Isi absensi".
- Jika hari ini libur atau Minggu: banner `merah-600` bertuliskan "Hari ini libur".

### 6.3 Absensi

```
┌────────────────────────────────┐
│ Absensi                        │
│ [ ◀  Senin, 5 Oktober 2026  ▶ ]│  ketuk untuk membuka kalender
│ [ Tandai libur ]               │
│                                │
│ [ Sakit 2 ][ Izin 1 ][ Alpha 0 ]│  segmen, aktif = warna solid
│ Cari nama siswa                │
│────────────────────────────────│
│ (AB)  1  Ahmad Rizky       [S] │
│ (BA)  2  Bunga Alya            │
│ ...                            │
│────────────────────────────────│
│ Hadir 29 · ...   [Simpan absensi]│  bar simpan (muncul bila ada perubahan)
└────────────────────────────────┘
```

- Siswa yang dipilih menampilkan lencana huruf (`S`, `I`, `A`) di kanan, memakai warna latar lembut status itu. Siswa lain tidak diberi tanda apa pun, karena sisanya otomatis hadir.
- Kalender muncul sebagai bottom sheet. Angka hari Minggu dan tanggal libur berwarna `merah-600`. Tanggal yang sudah diabsen memakai titik kecil di bawah angka.
- Jika tanggal sudah libur, daftar siswa diredam dan banner "Hari ini libur" memuat tombol "Batalkan libur".

### 6.4 Kas

```
┌────────────────────────────────┐
│ Kas                            │
│ [ Ganjil ][ Genap ]            │
│ Saldo Rp 198.000               │
│ Cari nama siswa                │
│────────────────────────────────│
│ Ahmad Rizky     5 dari 22      │
│                 Rp 10.000 [+]  │
│ ...                            │
└────────────────────────────────┘

Bottom sheet saat nama diketuk:
┌────────────────────────────────┐
│ Ahmad Rizky                    │
│ Sudah bayar 5 dari 22 minggu   │
│  ①②③④⑤ ⑥  7  8  9 10 11 12     │  chip 44 px, 6 kolom
│ 13 14 15 16 17 18 19 20 21 22  │
│ [ Catat bayar minggu 6 ]       │
└────────────────────────────────┘
```

- Chip lunas: isi `#1F7A3A`, angka putih, dengan ikon centang kecil. Chip belum bayar: garis `garis`, angka `slate-600`.
- Chip **berikutnya** (minggu terlama yang belum lunas) diberi cincin `emas-400` setebal 2 px. Tombol di bawah menyebut nomornya ("Catat bayar minggu 6"), sehingga aturan "mengisi minggu terlama" terlihat langsung.
- Mengetuk chip lain adalah koreksi manual. Membatalkan minggu yang sudah lunas meminta konfirmasi.

### 6.5 Nilai

- Pilihan mapel berupa baris chip yang bisa digeser ke samping, 7 mapel.
- Daftar siswa menampilkan rata-rata sebagai angka besar rata kanan (tabular), PTS dan PAS sebagai teks kecil. Nilai Akhir yang masih kosong ditulis `—`.
- Form "Tambah penilaian": satu kolom input angka per siswa (keyboard numerik), pemilih Bab di atas. Kolom kosong dibiarkan kosong, tidak diisi 0.

### 6.6 Cincin progres

Satu-satunya elemen dekoratif-fungsional.
- Jalur luar: biru (`biru-600`) 10 px, bagian yang terisi mengikuti persentase, sisanya `biru-50`.
- Garis emas tipis (1,5 px) di dalam jalur, penuh melingkar, menggemakan ring logo.
- Angka persen di tengah (Lexend 600).
- Ukuran 96 px di beranda, 56 px pada rekap per siswa.

## 7. Gerak

Gerak hanya muncul sebagai **jawaban atas ketukan**, bukan sebagai hiasan.

| Peristiwa | Gerak |
|---|---|
| Bottom sheet dibuka / ditutup | Naik/turun, 220 ms |
| Chip kas dicentang | Isi berubah dan centang muncul, 120 ms |
| Tombol ditekan | Warna berubah ke `biru-700`, tanpa membesar |
| Toast | Muncul dari bawah, hilang setelah 3 detik |
| Cincin progres berubah | Menyesuaikan nilai baru, 300 ms |

Tidak ada animasi saat halaman dimuat, tidak ada efek muncul saat menggulir, dan tidak ada efek melayang saat kursor lewat. Seluruh gerak dimatikan jika perangkat meminta `prefers-reduced-motion`.

## 8. Bahasa antarmuka

Bahasa Indonesia sehari-hari, kata kerja jelas, huruf kecil biasa, tanpa tanda seru, tanpa emoji. Satu aksi memakai satu nama di seluruh alur: tombol, judul, dan toast menyebutnya sama.

| Situasi | Teks |
|---|---|
| Tombol simpan absensi | Simpan absensi |
| Toast setelah simpan | Absensi 5 Oktober tersimpan |
| Tombol libur | Tandai libur |
| Toast libur | 5 Oktober ditandai libur |
| Tombol kas | Catat bayar minggu 6 |
| Toast kas | Ahmad Rizky: minggu 6 tercatat |
| Banner belum diabsen | Absensi hari ini belum diisi |
| Konfirmasi hapus | Hapus absensi 5 Oktober? Data di spreadsheet ikut terhapus. |
| Daftar kosong (pengeluaran) | Belum ada pengeluaran. Tambah pengeluaran pertama. |
| Gagal menyimpan | Absensi belum tersimpan. Periksa koneksi, lalu coba lagi. |
| Gagal memuat | Data tidak bisa dimuat. Tarik ke bawah untuk memuat ulang. |
| Hari Minggu dipilih | Hari Minggu libur dan tidak bisa diabsen. |

Pesan galat tidak meminta maaf dan tidak samar: sebutkan apa yang gagal dan apa yang bisa dilakukan.

## 9. Yang dihindari

- Gradasi warna, kaca buram, atau latar bertekstur.
- Satu radius dan satu bayangan yang sama untuk semua elemen.
- Daftar siswa dibuat kartu-kartu identik.
- Label huruf kapital semua, label kecil di atas judul, atau tanda panah `→` di ujung tombol.
- Teks dengan satu kata berwarna lain di tengah judul.
- Emoji, ilustrasi stok, konfeti, atau ilustrasi kosong ala template.
- Angka besar dengan gradasi sebagai pembuka halaman.
- Latar krem dengan huruf serif dan aksen oranye bata, atau latar hitam dengan aksen hijau neon.
- Emas di luar dua tugas pada bagian 2.3.
- Mode gelap (di luar lingkup saat ini).

## 10. Token siap pakai

Letakkan di `src/index.css`. Sesuaikan penamaan jika memakai Tailwind v4 (`@theme`) atau menambahkannya ke `theme.extend.colors` pada Tailwind v3.

```css
:root {
  /* inti */
  --biru-600: #00359D;
  --biru-700: #002A7D;
  --biru-50:  #EAF0FB;
  --navy-900: #0C1B4B;
  --slate-600: #4A5578;
  --garis:     #D6DCEB;
  --latar:     #F5F7FC;
  --permukaan: #FFFFFF;
  --emas-400:  #F6BE26;
  --krem-100:  #F7F3DE;

  /* status: lembut, teks, solid */
  --hadir-bg: #DDF1E2; --hadir-fg: #17612D; --hadir-solid: #1F7A3A;
  --sakit-bg: #FCE9C2; --sakit-fg: #7A4A00; --sakit-solid: #A35F00;
  --izin-bg:  #D8EBFA; --izin-fg:  #0B4F86; --izin-solid:  #1C6FB5;
  --alpha-bg: #F9D9D5; --alpha-fg: #8E1C14; --alpha-solid: #C62E24;
  --libur-solid: #C62E24;

  /* bentuk */
  --r-kecil: 6px;
  --r-tombol: 10px;
  --r-sheet: 20px;
  --bayang-melayang: 0 -4px 16px rgba(12, 27, 75, 0.14);

  /* huruf */
  --font-judul: 'Lexend Variable', system-ui, sans-serif;
  --font-teks: 'Source Sans 3 Variable', system-ui, sans-serif;
}

html { background: var(--latar); color: var(--navy-900); font-family: var(--font-teks); font-size: 16px; }
.angka { font-variant-numeric: tabular-nums; }

@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
```

## 11. Daftar periksa sebelum rilis

- [ ] Semua teks lolos kontras 4,5 : 1.
- [ ] Setiap status terbaca tanpa warna (huruf `v/S/I/A/L` selalu tampil).
- [ ] Semua target ketuk minimal 44 px, baris daftar minimal 56 px.
- [ ] Uji di lebar 360 px dan layar HP kecil, tanpa gulir ke samping.
- [ ] Bar simpan tidak menutupi baris terakhir daftar (beri ruang kosong di bawah daftar).
- [ ] Tidak ada animasi saat halaman dimuat, dan `prefers-reduced-motion` dihormati.
- [ ] Emas hanya muncul di garis header dan penanda "berikutnya".
- [ ] Logo tidak diubah dan tidak dipakai di bawah 36 px.
