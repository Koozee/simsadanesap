import { describe, it, expect, beforeEach } from 'vitest'
import { mockKasPay, mockKasSetWeek, mockKasSummary, mockKasExpensesAdd, mockKasExpensesList, mockKasExpensesUpdate, mockKasExpensesDelete } from './mockKas'
import { KAS_PER_MINGGU } from '../types/api-contract'

describe('kas actions', () => {
  beforeEach(() => {
    // Reset or we assume fresh state for tests if needed
  })

  it('seharusnya mencentang minggu terlama yang belum lunas (kas.pay)', () => {
    // Siswa 1 belum bayar apa-apa
    const res = mockKasPay(2026, 1, 1)
    expect(res.weeksChecked).toEqual([1])
    expect(res.row.weeks[0]).toBe(true)
    expect(res.row.weeks[1]).toBe(false)
    expect(res.row.total).toBe(KAS_PER_MINGGU)
    
    // Set manual minggu 2, 3 lunas
    mockKasSetWeek(2026, 1, 2, true)
    mockKasSetWeek(2026, 1, 3, true)
    
    // Pay lagi -> harusnya centang minggu 4
    const res2 = mockKasPay(2026, 1, 1)
    expect(res2.weeksChecked).toEqual([4])
    expect(res2.row.weeks[3]).toBe(true)
  })

  it('seharusnya menghitung summary total', () => {
    const summary = mockKasSummary(2026)
    expect(summary.pemasukan).toBeGreaterThanOrEqual(KAS_PER_MINGGU * 4) // dari test sebelumnya
  })

  it('seharusnya bisa menambah, mengubah, dan menghapus pengeluaran (T3.3)', () => {
    const exp1 = mockKasExpensesAdd({ tanggal: '2026-08-01', jumlah: 50000, keterangan: 'Beli sapu' })
    expect(exp1.id).toBeDefined()
    
    let list = mockKasExpensesList()
    expect(list.length).toBe(1)
    
    mockKasExpensesUpdate({ ...exp1, jumlah: 60000 })
    list = mockKasExpensesList()
    expect(list[0].jumlah).toBe(60000)
    
    mockKasExpensesDelete(exp1.id)
    list = mockKasExpensesList()
    expect(list.length).toBe(0)
  })
})
