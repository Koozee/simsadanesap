import type { Siswa } from '../types/api-contract'

export const mockStudents: Siswa[] = Array.from({ length: 32 }, (_, i) => ({
  no: i + 1,
  nipd: `232410${(i + 1).toString().padStart(2, '0')}`,
  nama: `Siswa Fiktif ${i + 1}`,
  jk: i % 2 === 0 ? 'L' : 'P',
}))
