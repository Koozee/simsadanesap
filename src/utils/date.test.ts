import { describe, it, expect } from 'vitest'
import {
  toISODate,
  toISOMonth,
  parseISODate,
  isSunday,
  getDaysInMonth,
  addDays,
  getCalendarGrid,
  formatDateID,
  formatMonthID,
} from './date'

describe('Date Utilities', () => {
  it('toISODate dan parseISODate', () => {
    const d = new Date(2026, 7, 15) // 15 Agustus 2026
    const iso = toISODate(d)
    expect(iso).toBe('2026-08-15')

    const parsed = parseISODate('2026-08-15')
    expect(parsed.getFullYear()).toBe(2026)
    expect(parsed.getMonth()).toBe(7)
    expect(parsed.getDate()).toBe(15)
  })

  it('toISOMonth', () => {
    const d = new Date(2026, 7, 15)
    expect(toISOMonth(d)).toBe('2026-08')
  })

  it('isSunday', () => {
    // 2 Agustus 2026 adalah Minggu
    expect(isSunday('2026-08-02')).toBe(true)
    // 3 Agustus 2026 adalah Senin
    expect(isSunday('2026-08-03')).toBe(false)
  })

  it('getDaysInMonth (termasuk kabisat)', () => {
    expect(getDaysInMonth(2026, 8)).toBe(31) // Agustus 2026
    expect(getDaysInMonth(2026, 2)).toBe(28) // Februari 2026 bukan kabisat
    expect(getDaysInMonth(2024, 2)).toBe(29) // Februari 2024 kabisat
  })

  it('addDays (batas bulan/tahun)', () => {
    expect(addDays('2026-08-31', 1)).toBe('2026-09-01')
    expect(addDays('2026-09-01', -1)).toBe('2026-08-31')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('getCalendarGrid', () => {
    // Agustus 2026: 1 Agustus adalah hari Sabtu.
    // Minggu mulai Senin, jadi offset = 6 - 1 = 5 hari.
    // Senin adalah 27 Juli 2026.
    const grid = getCalendarGrid(2026, 8)
    expect(grid.length).toBe(42)

    const firstCell = grid[0]
    expect(firstCell.getFullYear()).toBe(2026)
    expect(firstCell.getMonth()).toBe(6) // Juli (0-indexed)
    expect(firstCell.getDate()).toBe(27)

    // index 5 = Sabtu, 1 Agustus
    expect(grid[5].getDate()).toBe(1)
    expect(grid[5].getMonth()).toBe(7)
  })

  it('formatDateID dan formatMonthID', () => {
    expect(formatDateID('2026-08-05')).toBe('Rabu, 5 Agustus 2026')
    expect(formatMonthID('2026-08')).toBe('Agustus 2026')
  })
})
