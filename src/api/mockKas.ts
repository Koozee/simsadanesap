import type { KasData, KasSummary, KasRow, Pengeluaran } from '../types/api-contract'
import { KAS_PER_MINGGU, JUMLAH_MINGGU_KAS } from '../types/api-contract'

const db: Record<number, KasRow[]> = {}
let expensesDb: Pengeluaran[] = []
let nextExpId = 2

function initData(year: number) {
  if (!db[year]) {
    db[year] = []
    for (let i = 1; i <= 32; i++) {
      db[year].push({
        no: i,
        weeks: Array(JUMLAH_MINGGU_KAS).fill(false),
        total: 0,
      })
    }
  }
}

// Inisialisasi default
initData(2026)

export function mockKasGetData(year: number): KasData {
  return {
    sheetExists: !!db[year],
    rows: db[year] || [],
  }
}

export function mockKasSummary(year: number): KasSummary {
  const data = db[year] || []
  const pemasukan = data.reduce((acc, row) => acc + row.total, 0)

  const totalExp = expensesDb.reduce((acc, exp) => acc + exp.jumlah, 0)

  return {
    pemasukan,
    pengeluaran: totalExp,
    saldo: pemasukan - totalExp,
  }
}

export function mockKasSetWeek(year: number, no: number, week: number, paid: boolean): KasRow {
  if (!db[year]) throw new Error('YEAR_NOT_FOUND')
  const r = db[year].find((x) => x.no === no)
  if (!r) throw new Error('SISWA_NOT_FOUND')

  r.weeks[week - 1] = paid
  r.total = r.weeks.filter(Boolean).length * KAS_PER_MINGGU

  return { ...r }
}

export function mockKasPay(year: number, no: number, count: number) {
  if (!db[year]) throw new Error('YEAR_NOT_FOUND')
  const r = db[year].find((x) => x.no === no)
  if (!r) throw new Error('SISWA_NOT_FOUND')

  const checked: number[] = []
  let c = 0
  for (let w = 0; w < JUMLAH_MINGGU_KAS && c < count; w++) {
    if (!r.weeks[w]) {
      r.weeks[w] = true
      checked.push(w + 1)
      c++
    }
  }

  if (c === 0) {
    throw new Error('NOTHING_TO_PAY')
  }

  r.total = r.weeks.filter(Boolean).length * KAS_PER_MINGGU

  return {
    weeksChecked: checked,
    row: { ...r },
  }
}

export function mockKasCreateYear(year: number) {
  if (db[year]) throw new Error('SHEET_EXISTS')
  initData(year)
  return { sheetName: `Tahun ${year}` }
}

export function mockKasExpensesList() {
  return [...expensesDb]
}

export function mockKasExpensesAdd(exp: Omit<Pengeluaran, 'id'>) {
  const newExp = { ...exp, id: nextExpId++ }
  expensesDb.push(newExp)
  return newExp
}

export function mockKasExpensesUpdate(exp: Pengeluaran) {
  const idx = expensesDb.findIndex((x) => x.id === exp.id)
  if (idx !== -1) {
    expensesDb[idx] = { ...exp }
  }
  return { ...exp }
}

export function mockKasExpensesDelete(id: number) {
  expensesDb = expensesDb.filter((x) => x.id !== id)
  return { id }
}
