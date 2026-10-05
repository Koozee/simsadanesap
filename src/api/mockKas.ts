import type { KasSemesterData, KasSummary, KasRow, Semester, Pengeluaran } from '../types/api-contract'
import { KAS_PER_MINGGU, MINGGU_PER_SEMESTER } from '../types/api-contract'

const db: Record<string, KasRow[]> = {}
let expensesDb: Pengeluaran[] = []
let nextExpId = 2

function initSemester(semester: Semester) {
  if (!db[semester]) {
    const rows: KasRow[] = []
    for (let i = 1; i <= 32; i++) {
      rows.push({
        no: i,
        weeks: Array(MINGGU_PER_SEMESTER).fill(false),
        total: 0
      })
    }
    db[semester] = rows
  }
}

// Inisialisasi ganjil default
initSemester('ganjil')

export function mockKasGetSemester(semester: Semester): KasSemesterData {
  return {
    semester,
    sheetExists: !!db[semester],
    rows: db[semester] || []
  }
}

export function mockKasSummary(): KasSummary {
  let pemasukan = 0
  
  if (db['ganjil']) {
    pemasukan += db['ganjil'].reduce((acc, row) => acc + row.total, 0)
  }
  if (db['genap']) {
    pemasukan += db['genap'].reduce((acc, row) => acc + row.total, 0)
  }
  
  const totalExp = expensesDb.reduce((acc, exp) => acc + exp.jumlah, 0)
  
  return {
    pemasukan,
    pengeluaran: totalExp,
    saldo: pemasukan - totalExp
  }
}

export function mockKasSetWeek(semester: Semester, no: number, week: number, paid: boolean): KasRow {
  if (!db[semester]) throw new Error('SEMESTER_NOT_FOUND')
  const r = db[semester].find(x => x.no === no)
  if (!r) throw new Error('SISWA_NOT_FOUND')
  
  r.weeks[week - 1] = paid
  r.total = r.weeks.filter(Boolean).length * KAS_PER_MINGGU
  
  return { ...r }
}

export function mockKasPay(semester: Semester, no: number, count: number) {
  if (!db[semester]) throw new Error('SEMESTER_NOT_FOUND')
  const r = db[semester].find(x => x.no === no)
  if (!r) throw new Error('SISWA_NOT_FOUND')
  
  const checked: number[] = []
  let c = 0
  for (let w = 0; w < MINGGU_PER_SEMESTER && c < count; w++) {
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

export function mockKasCreateSemester(semester: Semester) {
  if (db[semester]) throw new Error('SEMESTER_EXISTS')
  initSemester(semester)
  return { sheetName: semester === 'genap' ? 'Semester Genap 2026-2027' : 'Tahun 2026' }
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
