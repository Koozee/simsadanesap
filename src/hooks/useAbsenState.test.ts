import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useAbsenState } from './useAbsenState'

describe('useAbsenState', () => {
  it('seharusnya memindahkan siswa ke status baru (tidak digandakan)', () => {
    const { result } = renderHook(() => useAbsenState([]))
    
    // Klik no 1 saat tab Sakit (S) aktif
    act(() => {
      result.current.toggleStatus(1, 'S')
    })
    expect(result.current.entries[1]).toBe('S')
    
    // Klik no 1 lagi saat tab Izin (I) aktif -> harus pindah ke I
    act(() => {
      result.current.toggleStatus(1, 'I')
    })
    expect(result.current.entries[1]).toBe('I') // Bukan dua status, tapi terganti
    
    // Klik no 1 lagi saat tab Izin (I) aktif -> harus kembali ke H (terhapus dari entri)
    act(() => {
      result.current.toggleStatus(1, 'I')
    })
    expect(result.current.entries[1]).toBeUndefined()
  })

  it('seharusnya me-load initial entries dengan benar', () => {
    const { result } = renderHook(() => useAbsenState([
      { no: 2, status: 'A' },
      { no: 5, status: 'S' }
    ]))
    
    expect(result.current.entries[2]).toBe('A')
    expect(result.current.entries[5]).toBe('S')
    expect(result.current.entries[1]).toBeUndefined()
  })
})
