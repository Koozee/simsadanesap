import { describe, expect, it } from 'vitest'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

// Uji asap T0.2: memastikan vitest berjalan dan date-fns memakai locale Indonesia.
describe('setup proyek', () => {
  it('memformat tanggal dalam bahasa Indonesia', () => {
    const tanggal = new Date(2026, 9, 5) // 5 Oktober 2026, waktu lokal
    expect(format(tanggal, 'EEEE, d MMMM yyyy', { locale: id })).toBe('Senin, 5 Oktober 2026')
  })
})
