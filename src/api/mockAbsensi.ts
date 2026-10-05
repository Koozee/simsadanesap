import type { AbsenEntry, AbsenDay, AbsenMonthOverview, StatusAbsen, AbsenSummary, RekapSiswa } from '../types/api-contract'
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

export function mockSummary(from: string, to: string, no?: number): AbsenSummary {
  const [yFrom, mFrom] = from.split('-').map(Number)
  const [yTo, mTo] = to.split('-').map(Number)
  
  let currentY = yFrom
  let currentM = mFrom
  
  const rekap: RekapSiswa[] = []
  for (let i = 1; i <= 32; i++) {
    rekap.push({ no: i, hadir: 0, sakit: 0, izin: 0, alpha: 0, hariEfektif: 0, persen: 0 })
  }
  
  const perBulan: { month: string; rekap: RekapSiswa }[] = []
  const skippedMonths: string[] = []
  
  while (currentY < yTo || (currentY === yTo && currentM <= mTo)) {
    const mm = currentM < 10 ? '0' + currentM : String(currentM)
    const monthStr = `${currentY}-${mm}`
    
    const daysInMonth = new Date(currentY, currentM, 0).getDate()
    let hasAnyData = false
    
    let bulanHadir = 0, bulanSakit = 0, bulanIzin = 0, bulanAlpha = 0
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dd = d < 10 ? '0' + d : String(d)
      const dateStr = `${monthStr}-${dd}`
      const data = db[dateStr]
      
      if (data && data !== 'L') {
        hasAnyData = true
        const map: Record<number, StatusAbsen> = {}
        data.forEach(e => { map[e.no] = e.status })
        
        for (let i = 1; i <= 32; i++) {
          if (no && i !== no) continue
          
          const s = map[i] || 'H'
          if (s === 'H') rekap[i - 1].hadir++
          else if (s === 'S') rekap[i - 1].sakit++
          else if (s === 'I') rekap[i - 1].izin++
          else if (s === 'A') rekap[i - 1].alpha++
          
          if (no && i === no) {
            if (s === 'H') bulanHadir++
            else if (s === 'S') bulanSakit++
            else if (s === 'I') bulanIzin++
            else if (s === 'A') bulanAlpha++
          }
        }
      }
    }
    
    if (!hasAnyData) {
      // we consider it skipped if no recorded data, as mock db only saves recorded days
      skippedMonths.push(monthStr)
    } else if (no) {
      const hE = bulanHadir + bulanSakit + bulanIzin + bulanAlpha
      const p = hE === 0 ? 0 : Math.round((bulanHadir / hE) * 100)
      perBulan.push({
        month: monthStr,
        rekap: {
          no, hadir: bulanHadir, sakit: bulanSakit, izin: bulanIzin, alpha: bulanAlpha, hariEfektif: hE, persen: p
        }
      })
    }
    
    currentM++
    if (currentM > 12) {
      currentM = 1
      currentY++
    }
  }
  
  const perSiswa: RekapSiswa[] = []
  for (let i = 0; i < 32; i++) {
    if (no && i + 1 !== no) continue
    const r = rekap[i]
    r.hariEfektif = r.hadir + r.sakit + r.izin + r.alpha
    r.persen = r.hariEfektif === 0 ? 0 : Math.round((r.hadir / r.hariEfektif) * 100)
    perSiswa.push(r)
  }
  
  const res: AbsenSummary = { from, to, perSiswa, skippedMonths }
  if (no) res.perBulan = perBulan
  return res
}
