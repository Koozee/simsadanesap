/**
 * api-contract.ts
 *
 * Kontrak antara frontend (React) dan Apps Script. Sumber kebenaran tunggal.
 * Mengubah file ini berarti mengubah frontend DAN Apps Script, dan harus dikonfirmasi dulu.
 *
 * Transport:
 *  - GET  : ?action=<nama>&param=nilai   (pembacaan)
 *  - POST : body JSON string, Content-Type: text/plain;charset=utf-8
 *           { "action": "<nama>", "params": { ... } }   (penulisan)
 *  - Semua respons berbentuk ApiResult<T>.
 */

// ───────────────────────── Konstanta ─────────────────────────

export const KAS_PER_MINGGU = 2000;
export const JUMLAH_MINGGU_KAS = 22; // Nanti bisa disesuaikan
export const JUMLAH_BAB = 5;
export const SLOT_PER_BAB = 4;
export const SLOT_HARIAN_TOTAL = JUMLAH_BAB * SLOT_PER_BAB; // 20

export const MAPEL = [
  'Bahasa Indonesia',
  'Seni Rupa',
  'Bahasa Jawa',
  'Bahasa Inggris',
  'IPAS',
  'Matematika',
  'Pendidikan Pancasila',
] as const;

// ───────────────────────── Tipe dasar ─────────────────────────

/** 'YYYY-MM-DD', zona waktu Asia/Jakarta. Jangan diproses dengan new Date(string). */
export type ISODate = string;
/** 'YYYY-MM' */
export type ISOMonth = string;

export type Mapel = (typeof MAPEL)[number];

/** Nomor urut siswa 1–32. Dipakai sebagai kunci di semua spreadsheet. */
export type NoSiswa = number;
export type Bab = 1 | 2 | 3 | 4 | 5;
export type Slot = 1 | 2 | 3 | 4;
/** Minggu kas 1–22 */
export type Minggu = number;

/** H ditulis sebagai 'v' di spreadsheet. */
export type StatusAbsen = 'H' | 'S' | 'I' | 'A';

export type Siswa = {
  no: NoSiswa;
  nipd: string | null;
  nama: string;
  jk: 'L' | 'P';
};

// ───────────────────────── Hasil dan galat ─────────────────────────

export type ApiErrorCode =
  | 'INVALID_INPUT'       // parameter tidak valid, atau menulis ke kolom terlarang (Y/AB nilai)
  | 'SUNDAY_LOCKED'       // hari Minggu otomatis libur, tidak bisa diabsen atau diubah libur
  | 'SHEET_NOT_FOUND'     // sheet yang diminta tidak ada
  | 'STRUCTURE_MISMATCH'  // struktur spreadsheet tidak sesuai spreadsheet-schema.md
  | 'BAB_FULL'            // keempat slot penilaian dalam bab sudah terisi
  | 'NOTHING_TO_PAY'      // semua minggu kas siswa sudah lunas
  | 'LOCK_TIMEOUT'        // gagal mendapatkan lock tulis, coba lagi
  | 'UNKNOWN_ACTION'
  | 'UNKNOWN';

export type ApiError = { code: ApiErrorCode; message: string };
export type ApiOk<T> = { ok: true; data: T };
export type ApiFail = { ok: false; error: ApiError };
export type ApiResult<T> = ApiOk<T> | ApiFail;

// ───────────────────────── Absensi ─────────────────────────

export type AbsenEntry = { no: NoSiswa; status: StatusAbsen };

export type AbsenDay = {
  date: ISODate;
  /** false bila sheet bulan belum ada */
  sheetExists: boolean;
  /** true bila ada sel terisi v/S/I/A pada kolom tanggal ini */
  recorded: boolean;
  /** true bila seluruh kolom berisi L (termasuk Minggu) */
  libur: boolean;
  sunday: boolean;
  /** Kosong bila belum diabsen atau libur. Bila recorded, memuat 32 entri. */
  entries: AbsenEntry[];
};

export type AbsenMonthOverview = {
  month: ISOMonth;
  sheetExists: boolean;
  recordedDates: ISODate[];
  /** Termasuk seluruh hari Minggu */
  liburDates: ISODate[];
};

export type RekapSiswa = {
  no: NoSiswa;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  /** hadir + sakit + izin + alpha. Hari kosong dan libur tidak dihitung. */
  hariEfektif: number;
  /** hadir / hariEfektif, 0–100. 0 bila hariEfektif = 0 */
  persen: number;
};

export type AbsenSummary = {
  from: ISOMonth;
  to: ISOMonth;
  perSiswa: RekapSiswa[];
  /** Bulan dalam rentang yang sheet-nya tidak ada */
  skippedMonths: ISOMonth[];
  /** Rincian per bulan, hanya untuk pertanyaan satu siswa (param `no`) */
  perBulan?: { month: ISOMonth; rekap: RekapSiswa }[];
};

// ───────────────────────── Nilai ─────────────────────────

export type NilaiRow = {
  no: NoSiswa;
  /** 20 slot (Bab 1 slot 1 ... Bab 5 slot 4). null = kosong. */
  daily: (number | null)[];
  /** Dibaca dari kolom Y. null bila kosong atau galat. */
  rataRata: number | null;
  pts: number | null;
  pas: number | null;
  /** Dibaca dari kolom AB. App tidak pernah menulisnya. */
  nilaiAkhir: number | null;
};

export type NilaiSheet = { mapel: Mapel; rows: NilaiRow[] };

export type NilaiScore = { no: NoSiswa; value: number | null };

// ───────────────────────── Kas ─────────────────────────

export type KasRow = {
  no: NoSiswa;
  /** Panjang 22. weeks[0] = minggu 1. */
  weeks: boolean[];
  /** jumlah minggu lunas × KAS_PER_MINGGU */
  total: number;
};

export type KasData = {
  sheetExists: boolean;
  rows: KasRow[];
};

export type KasSummary = {
  /** Total pemasukan */
  pemasukan: number;
  pengeluaran: number;
  /** pemasukan − pengeluaran */
  saldo: number;
};

export type Pengeluaran = {
  /** Nomor baris pada sheet, dipakai sebagai id */
  id: number;
  tanggal: ISODate;
  jumlah: number;
  keterangan: string;
};

// ───────────────────────── Validasi ─────────────────────────

export type ValidateIssue = {
  code: ApiErrorCode;
  where: string; // contoh: 'Kas!B12'
  message: string;
};
export type ValidateResult = { ok: boolean; issues: ValidateIssue[] };

// ───────────────────────── Peta aksi ─────────────────────────

type Action<M extends 'GET' | 'POST', P, R> = { method: M; params: P; result: R };

export type ApiActions = {
  validate: Action<'GET', Record<string, never>, ValidateResult>;
  'students.list': Action<'GET', Record<string, never>, Siswa[]>;

  // Absensi
  'absensi.getDay': Action<'GET', { date: ISODate }, AbsenDay>;
  'absensi.monthOverview': Action<'GET', { month: ISOMonth }, AbsenMonthOverview>;
  /** entries wajib memuat seluruh siswa; sisa yang tidak ditandai dikirim sebagai 'H'. */
  'absensi.saveDay': Action<
    'POST',
    { date: ISODate; entries: AbsenEntry[] },
    { date: ISODate; counts: Record<StatusAbsen, number> }
  >;
  /** Mengosongkan kolom tanggal (menghapus absensi atau libur). */
  'absensi.clearDay': Action<'POST', { date: ISODate }, { date: ISODate }>;
  /** true: isi L pada 32 sel. false: kosongkan. Ditolak untuk hari Minggu. */
  'absensi.setLibur': Action<'POST', { date: ISODate; libur: boolean }, { date: ISODate; libur: boolean }>;
  /** no diisi: satu siswa (plus perBulan). Kosong: semua siswa. */
  'absensi.summary': Action<'GET', { from: ISOMonth; to: ISOMonth; no?: NoSiswa }, AbsenSummary>;

  // Nilai
  'nilai.subjects': Action<'GET', Record<string, never>, Mapel[]>;
  'nilai.getSheet': Action<'GET', { mapel: Mapel }, NilaiSheet>;
  /** slot tidak diisi: pakai slot kosong pertama pada bab. */
  'nilai.addDaily': Action<
    'POST',
    { mapel: Mapel; bab: Bab; slot?: Slot; scores: NilaiScore[] },
    { bab: Bab; slotUsed: Slot }
  >;
  'nilai.setExam': Action<
    'POST',
    { mapel: Mapel; type: 'PTS' | 'PAS'; scores: NilaiScore[] },
    { mapel: Mapel; type: 'PTS' | 'PAS' }
  >;
  /** field 'daily' wajib menyertakan bab dan slot. value null mengosongkan sel. */
  'nilai.setCell': Action<
    'POST',
    { mapel: Mapel; no: NoSiswa; field: 'daily' | 'pts' | 'pas'; bab?: Bab; slot?: Slot; value: number | null },
    NilaiRow
  >;

  // Kas
  'kas.getData': Action<'GET', Record<string, never>, KasData>;
  'kas.summary': Action<'GET', Record<string, never>, KasSummary>;
  /** Mencentang `count` minggu terlama yang belum lunas (default 1). */
  'kas.pay': Action<
    'POST',
    { no: NoSiswa; count?: number },
    { weeksChecked: Minggu[]; row: KasRow }
  >;
  'kas.setWeek': Action<'POST', { no: NoSiswa; week: Minggu; paid: boolean }, KasRow>;
  'kas.expenses.list': Action<'GET', Record<string, never>, Pengeluaran[]>;
  'kas.expenses.add': Action<'POST', Omit<Pengeluaran, 'id'>, Pengeluaran>;
  'kas.expenses.update': Action<'POST', Pengeluaran, Pengeluaran>;
  'kas.expenses.delete': Action<'POST', { id: number }, { id: number }>;
};

export type ActionName = keyof ApiActions;
export type ParamsOf<A extends ActionName> = ApiActions[A]['params'];
export type ResultOf<A extends ActionName> = ApiActions[A]['result'];
export type MethodOf<A extends ActionName> = ApiActions[A]['method'];
