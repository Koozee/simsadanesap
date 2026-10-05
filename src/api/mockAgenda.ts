import type { AgendaItem } from '../types/api-contract'
import { toISODate } from '../utils/date'

export function mockAgendaGetMonth(year: number, month: number): AgendaItem[] {
  const d1 = new Date(year, month - 1, 15)
  const d2 = new Date(year, month - 1, 20)

  return [
    {
      tanggal: toISODate(d1),
      mapel: 'Matematika',
      keterangan: 'Penilaian Harian Bab 2',
    },
    {
      tanggal: toISODate(d2),
      mapel: 'Bahasa Indonesia',
      keterangan: 'Ujian Tengah Semester',
    },
  ]
}
