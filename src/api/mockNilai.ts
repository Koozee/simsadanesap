import type { NilaiSheet, Mapel, Bab, Slot, NilaiScore, NilaiRow } from '../types/api-contract'
import { MAPEL, SLOT_HARIAN_TOTAL } from '../types/api-contract'

// Mock Data
const mockNilaiDb: Record<Mapel, NilaiRow[]> = {} as Record<Mapel, NilaiRow[]>

function initMockData(mapel: Mapel) {
  if (!mockNilaiDb[mapel]) {
    const rows: NilaiRow[] = []
    for (let i = 1; i <= 32; i++) {
      rows.push({
        no: i,
        daily: Array(SLOT_HARIAN_TOTAL).fill(null),
        rataRata: null,
        pts: null,
        pas: null,
        nilaiAkhir: null
      })
    }
    mockNilaiDb[mapel] = rows
  }
}

// Inisialisasi awal
MAPEL.forEach(m => initMockData(m))

function updateRataRata(row: NilaiRow) {
  const filled = row.daily.filter(x => x !== null) as number[]
  if (filled.length === 0) {
    row.rataRata = null
  } else {
    const sum = filled.reduce((a, b) => a + b, 0)
    row.rataRata = Math.round((sum / filled.length) * 10) / 10
  }
}

export function mockNilaiSubjects(): Mapel[] {
  return [...MAPEL]
}

export function mockNilaiGetSheet(mapel: Mapel): NilaiSheet {
  initMockData(mapel)
  return {
    mapel,
    rows: mockNilaiDb[mapel]
  }
}

export function mockNilaiAddDaily(mapel: Mapel, bab: Bab, slotRequested: Slot | undefined, scores: NilaiScore[]) {
  initMockData(mapel)
  const rows = mockNilaiDb[mapel]
  
  const baseIdx = (bab - 1) * 4
  let targetSlot = -1
  
  if (slotRequested) {
    targetSlot = slotRequested
  } else {
    for (let s = 1; s <= 4; s++) {
      const idx = baseIdx + (s - 1)
      let isEmpty = true
      for (const r of rows) {
        if (r.daily[idx] !== null) {
          isEmpty = false
          break
        }
      }
      if (isEmpty) {
        targetSlot = s
        break
      }
    }
  }
  
  if (targetSlot === -1) {
    throw new Error('BAB_FULL')
  }
  
  const targetIdx = baseIdx + (targetSlot - 1)
  
  for (const s of scores) {
    const row = rows.find(r => r.no === s.no)
    if (row) {
      row.daily[targetIdx] = s.value
      updateRataRata(row)
    }
  }
  
  return { bab, slotUsed: targetSlot }
}

export function mockNilaiSetExam(mapel: Mapel, type: 'PTS' | 'PAS', scores: NilaiScore[]) {
  initMockData(mapel)
  const rows = mockNilaiDb[mapel]
  
  for (const s of scores) {
    const row = rows.find(r => r.no === s.no)
    if (row) {
      if (type === 'PTS') row.pts = s.value
      else row.pas = s.value
    }
  }
  
  return { mapel, type }
}

export function mockNilaiSetCell(mapel: Mapel, no: number, field: 'daily' | 'pts' | 'pas', bab: Bab | undefined, slot: Slot | undefined, value: number | null): NilaiRow {
  initMockData(mapel)
  const row = mockNilaiDb[mapel].find(r => r.no === no)
  if (!row) throw new Error('SISWA_NOT_FOUND')
  
  if (field === 'daily') {
    if (!bab || !slot) throw new Error('INVALID_INPUT')
    const idx = (bab - 1) * 4 + (slot - 1)
    row.daily[idx] = value
    updateRataRata(row)
  } else if (field === 'pts') {
    row.pts = value
  } else if (field === 'pas') {
    row.pas = value
  }
  
  return { ...row }
}
