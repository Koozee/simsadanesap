import { describe, it, expect, beforeEach } from 'vitest'
import { mockSaveDay, mockSetLibur, mockSummary } from './mockAbsensi'

describe('absensi.summary', () => {
  beforeEach(() => {
    // We can clear DB but module scope is persistent in tests sometimes, 
    // let's just clear specific dates or use distinct dates
  })

  it('seharusnya menghitung hadir, sakit, izin, alpha dengan benar untuk satu siswa', () => {
    mockSaveDay('2026-08-01', [{ no: 1, status: 'S' }])
    mockSaveDay('2026-08-03', [{ no: 1, status: 'I' }])
    mockSaveDay('2026-08-04', [{ no: 1, status: 'A' }])
    mockSaveDay('2026-08-05', []) // Default H for all
    
    // Libur should not be counted
    mockSetLibur('2026-08-06', true)

    const sum = mockSummary('2026-08', '2026-08', 1)
    
    expect(sum.perSiswa.length).toBe(1)
    const p = sum.perSiswa[0]
    expect(p.no).toBe(1)
    expect(p.sakit).toBe(1)
    expect(p.izin).toBe(1)
    expect(p.alpha).toBe(1)
    expect(p.hadir).toBe(1) // from 2026-08-05 default H
    expect(p.hariEfektif).toBe(4)
    expect(p.persen).toBe(25) // (1 / 4) * 100
  })

  it('seharusnya menghitung untuk semua siswa', () => {
    mockSaveDay('2026-09-01', [{ no: 1, status: 'S' }, { no: 2, status: 'I' }])
    mockSaveDay('2026-09-02', [{ no: 2, status: 'A' }])
    
    const sum = mockSummary('2026-09', '2026-09')
    
    expect(sum.perSiswa.length).toBe(32)
    
    const s1 = sum.perSiswa.find(s => s.no === 1)
    expect(s1?.sakit).toBe(1)
    expect(s1?.hadir).toBe(1) // from 09-02
    expect(s1?.hariEfektif).toBe(2)
    expect(s1?.persen).toBe(50)

    const s2 = sum.perSiswa.find(s => s.no === 2)
    expect(s2?.izin).toBe(1) // from 09-01
    expect(s2?.alpha).toBe(1) // from 09-02
    expect(s2?.hadir).toBe(0)
    expect(s2?.hariEfektif).toBe(2)
    expect(s2?.persen).toBe(0)
  })
})
