import { describe, it, expect } from 'vitest'
import { mockNilaiAddDaily, mockNilaiSetCell, mockNilaiGetSheet } from './mockNilai'

describe('Nilai API Mock', () => {
  it('addDaily finds the first empty slot and throws BAB_FULL if full', () => {
    // Reset or prepare data for mapel Bahasa Indonesia
    mockNilaiGetSheet('Bahasa Indonesia') // init

    const scores = [{ no: 1, value: 80 }]

    // Fill 4 slots
    const res1 = mockNilaiAddDaily('Bahasa Indonesia', 2, undefined, scores)
    expect(res1.slotUsed).toBe(1)

    const res2 = mockNilaiAddDaily('Bahasa Indonesia', 2, undefined, scores)
    expect(res2.slotUsed).toBe(2)

    const res3 = mockNilaiAddDaily('Bahasa Indonesia', 2, undefined, scores)
    expect(res3.slotUsed).toBe(3)

    const res4 = mockNilaiAddDaily('Bahasa Indonesia', 2, undefined, scores)
    expect(res4.slotUsed).toBe(4)

    // 5th time should throw BAB_FULL
    expect(() => mockNilaiAddDaily('Bahasa Indonesia', 2, undefined, scores)).toThrow('BAB_FULL')
  })

  it('setCell prevents writing to column AB (Nilai Akhir)', () => {
    // In our mock, setCell only accepts 'daily', 'pts', 'pas'.
    // If we try to pass 'nilaiAkhir', typescript prevents it.
    // We can simulate an invalid field test.
    // @ts-expect-error testing invalid field
    expect(() =>
      mockNilaiSetCell('Bahasa Indonesia', 1, 'nilaiAkhir', undefined, undefined, 90),
    ).toThrow('INVALID_INPUT')
  })

  it('setCell null clears the cell instead of 0', () => {
    mockNilaiSetCell('Bahasa Indonesia', 1, 'pts', undefined, undefined, null)
    const sheet = mockNilaiGetSheet('Bahasa Indonesia')
    expect(sheet.rows.find((r) => r.no === 1)?.pts).toBe(null)
  })
})
