import { describe, it, expect, beforeEach } from 'vitest'
import { mockKasPay, mockKasSetWeek, mockKasSummary } from './mockKas'
import { KAS_PER_MINGGU } from '../types/api-contract'

describe('kas actions', () => {
  beforeEach(() => {
    // Reset or we assume fresh state for tests if needed
  })

  it('seharusnya mencentang minggu terlama yang belum lunas (kas.pay)', () => {
    // Siswa 1 belum bayar apa-apa
    const res = mockKasPay('ganjil', 1, 1)
    expect(res.weeksChecked).toEqual([1])
    expect(res.row.weeks[0]).toBe(true)
    expect(res.row.weeks[1]).toBe(false)
    expect(res.row.total).toBe(KAS_PER_MINGGU)
    
    // Set manual minggu 2, 3 lunas
    mockKasSetWeek('ganjil', 1, 2, true)
    mockKasSetWeek('ganjil', 1, 3, true)
    
    // Pay lagi -> harusnya centang minggu 4
    const res2 = mockKasPay('ganjil', 1, 1)
    expect(res2.weeksChecked).toEqual([4])
    expect(res2.row.weeks[3]).toBe(true)
  })

  it('seharusnya menghitung summary total', () => {
    const summary = mockKasSummary()
    expect(summary.pemasukan).toBeGreaterThanOrEqual(KAS_PER_MINGGU * 4) // dari test sebelumnya
  })
})
