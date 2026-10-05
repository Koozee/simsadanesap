import type { KasData, KasSummary, KasRow, Pengeluaran } from '../types/api-contract'
import { KAS_PER_MINGGU, JUMLAH_MINGGU_KAS } from '../types/api-contract'

const db: KasRow[] = []
let expensesDb: Pengeluaran[] = []
let nextExpId = 2

function initData() {
  if (db.length === 0) {
    for (let i = 1; i <= 32; i++) {
      db.push({
        no: i,
        weeks: Array(JUMLAH_MINGGU_KAS).fill(false),
        total: 0
      })
    }
  }
}

// Inisialisasi default
initData()

export function mockKasGetData(): KasData {
  return {
    sheetExists: db.length > 0,
    rows: db || []
  }
}

export function mockKasSummary(): KasSummary {
  const pemasukan = db.reduce((acc, row) => acc + row.total, 0)
  
  const totalExp = expensesDb.reduce((acc, exp) => acc + exp.jumlah, 0)
  
  return {
    pemasukan,
    pengeluaran: totalExp,
    saldo: pemasukan - totalExp
  }
}

export function mockKasSetWeek(no: number, week: number, paid: boolean): KasRow {
  const r = db.find(x => x.no === no)
  if (!r) throw new Error('SISWA_NOT_FOUND')
  
  r.weeks[week - 1] = paid
  r.total = r.weeks.filter(Boolean).length * KAS_PER_MINGGU
  
  return { ...r }
}

export function mockKasPay(no: number, count: number) {
  const r = db.find(x => x.no === no)
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
    row: { ...r }
  }
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
  const idx = expensesDb.findIndex(x => x.id === exp.id)
  if (idx !== -1) {
    expensesDb[idx] = { ...exp }
  }
  return { ...exp }
}

export function mockKasExpensesDelete(id: number) {
  expensesDb = expensesDb.filter(x => x.id !== id)
  return { id }
}
