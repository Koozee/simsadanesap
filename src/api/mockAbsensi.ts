import type { AbsenEntry, AbsenDay, AbsenMonthOverview, StatusAbsen } from '../types/api-contract'
import { ApiClientError } from './client'

const db: Record<string, AbsenEntry[] | 'L'> = {}

function isSunday(dateStr: string) {
  const d = new Date(dateStr)
  return d.getDay() === 0
}

export function mockGetDay(date: string): AbsenDay {
  const sunday = isSunday(date)
  const data = db[date]
  
  if (sunday) {
    return { date, sheetExists: true, recorded: false, libur: true, sunday: true, entries: [] }
  }
  
  if (data === 'L') {
    return { date, sheetExists: true, recorded: false, libur: true, sunday: false, entries: [] }
  }
  
  if (Array.isArray(data)) {
    return { date, sheetExists: true, recorded: true, libur: false, sunday: false, entries: data }
  }
  
  return { date, sheetExists: true, recorded: false, libur: false, sunday: false, entries: [] }
}

export function mockMonthOverview(month: string): AbsenMonthOverview {
  const [yearStr, monthStr] = month.split('-')
  const y = parseInt(yearStr, 10)
  const m = parseInt(monthStr, 10)
  const daysInMonth = new Date(y, m, 0).getDate()
  
  const recordedDates: string[] = []
  const liburDates: string[] = []
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dd = d < 10 ? '0' + d : String(d)
    const date = `${month}-${dd}`
    const sunday = isSunday(date)
    const data = db[date]
    
    if (sunday) {
      liburDates.push(date)
    } else if (data === 'L') {
      liburDates.push(date)
    } else if (Array.isArray(data)) {
      recordedDates.push(date)
    }
  }
  
  return { month, sheetExists: true, recordedDates, liburDates }
}

export function mockSaveDay(date: string, entries: AbsenEntry[]) {
  if (isSunday(date)) {
    throw new ApiClientError({ code: 'SUNDAY_LOCKED', message: 'Hari Minggu tidak bisa diabsen' })
  }
  db[date] = entries
  
  const counts: Record<StatusAbsen, number> = { H: 0, S: 0, I: 0, A: 0 }
  
  const map: Record<number, StatusAbsen> = {}
  entries.forEach(e => { map[e.no] = e.status })
  
  for (let i = 1; i <= 32; i++) {
    const s = map[i] || 'H'
    counts[s]++
  }
  
  return { date, counts }
}

export function mockClearDay(date: string) {
  if (isSunday(date)) {
    throw new ApiClientError({ code: 'SUNDAY_LOCKED', message: 'Hari Minggu tidak bisa dihapus' })
  }
  delete db[date]
  return { date }
}

export function mockSetLibur(date: string, libur: boolean) {
  if (isSunday(date)) {
    throw new ApiClientError({ code: 'SUNDAY_LOCKED', message: 'Hari Minggu selalu libur dan terkunci' })
  }
  if (libur) {
    db[date] = 'L'
  } else {
    delete db[date]
  }
  return { date, libur }
}
