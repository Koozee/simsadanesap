export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function toISOMonth(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function isSunday(iso: string): boolean {
  return parseISODate(iso).getDay() === 0
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

/**
 * Mendapatkan 42 kotak tanggal untuk kalender (mulai Senin)
 * month adalah 1-12
 */
export function getCalendarGrid(year: number, month: number): Date[] {
  const grid: Date[] = []
  
  const firstDay = new Date(year, month - 1, 1)
  
  let offset = firstDay.getDay() - 1
  if (offset === -1) offset = 6 // Jika Minggu, mundur 6 hari
  
  const startGridDate = new Date(firstDay)
  startGridDate.setDate(startGridDate.getDate() - offset)
  
  for (let i = 0; i < 42; i++) {
    const d = new Date(startGridDate)
    d.setDate(d.getDate() + i)
    grid.push(d)
  }
  
  return grid
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]
const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

export function formatDateID(iso: string): string {
  const d = parseISODate(iso)
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

export function formatMonthID(isoMonth: string): string {
  const [y, m] = isoMonth.split('-').map(Number)
  return `${MONTH_NAMES[m - 1]} ${y}`
}
