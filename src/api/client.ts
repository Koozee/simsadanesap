import type {
  ActionName,
  ParamsOf,
  ResultOf,
  ApiResult,
  ApiError,
  MethodOf,
  AbsenEntry,
} from '../types/api-contract'
import { mockStudents } from './mockData'
import {
  mockGetDay,
  mockMonthOverview,
  mockSaveDay,
  mockClearDay,
  mockSetLibur,
  mockSummary,
} from './mockAbsensi'
import {
  mockKasGetData,
  mockKasSummary,
  mockKasSetWeek,
  mockKasPay,
  mockKasCreateYear,
  mockKasExpensesList,
  mockKasExpensesAdd,
  mockKasExpensesUpdate,
  mockKasExpensesDelete,
} from './mockKas'
import {
  mockNilaiSubjects,
  mockNilaiGetSheet,
  mockNilaiAddDaily,
  mockNilaiSetExam,
  mockNilaiSetCell,
} from './mockNilai'
import { mockAgendaGetMonth } from './mockAgenda'
import type { Pengeluaran, Mapel, Bab, Slot, NilaiScore } from '../types/api-contract'

export class ApiClientError extends Error {
  code: string
  constructor(error: ApiError) {
    super(error.message)
    this.name = 'ApiClientError'
    this.code = error.code
  }
}

async function handleMock<A extends ActionName>(
  action: A,
  params: ParamsOf<A>,
): Promise<ResultOf<A>> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (action === 'students.list') return mockStudents as ResultOf<A>
  if (action === 'absensi.getDay')
    return mockGetDay((params as { date: string }).date) as ResultOf<A>
  if (action === 'absensi.monthOverview')
    return mockMonthOverview((params as { month: string }).month) as ResultOf<A>
  if (action === 'absensi.summary') {
    const p = params as { from: string; to: string; no?: number }
    return mockSummary(p.from, p.to, p.no) as ResultOf<A>
  }
  if (action === 'absensi.saveDay') {
    const p = params as { date: string; entries: AbsenEntry[] }
    return mockSaveDay(p.date, p.entries) as ResultOf<A>
  }
  if (action === 'absensi.clearDay')
    return mockClearDay((params as { date: string }).date) as ResultOf<A>
  if (action === 'absensi.setLibur') {
    const p = params as { date: string; libur: boolean }
    return mockSetLibur(p.date, p.libur) as ResultOf<A>
  }
  if (action === 'kas.getData') {
    const p = params as { year: number }
    return mockKasGetData(p.year) as ResultOf<A>
  }
  if (action === 'kas.summary') {
    const p = params as { year: number }
    return mockKasSummary(p.year) as ResultOf<A>
  }
  if (action === 'kas.setWeek') {
    const p = params as { year: number; no: number; week: number; paid: boolean }
    return mockKasSetWeek(p.year, p.no, p.week, p.paid) as ResultOf<A>
  }
  if (action === 'kas.pay') {
    const p = params as { year: number; no: number; count?: number }
    return mockKasPay(p.year, p.no, p.count ?? 1) as ResultOf<A>
  }
  if (action === 'kas.createYear') {
    const p = params as { year: number }
    return mockKasCreateYear(p.year) as ResultOf<A>
  }
  if (action === 'kas.expenses.list') return mockKasExpensesList() as ResultOf<A>
  if (action === 'kas.expenses.add') {
    return mockKasExpensesAdd(params as Omit<Pengeluaran, 'id'>) as ResultOf<A>
  }
  if (action === 'kas.expenses.update') {
    return mockKasExpensesUpdate(params as Pengeluaran) as ResultOf<A>
  }
  if (action === 'kas.expenses.delete') {
    return mockKasExpensesDelete((params as { id: number }).id) as ResultOf<A>
  }
  if (action === 'nilai.subjects') {
    return mockNilaiSubjects() as ResultOf<A>
  }
  if (action === 'nilai.getSheet') {
    const p = params as { mapel: Mapel }
    return mockNilaiGetSheet(p.mapel) as ResultOf<A>
  }
  if (action === 'nilai.addDaily') {
    const p = params as { mapel: Mapel; bab: Bab; slot?: Slot; scores: NilaiScore[] }
    return mockNilaiAddDaily(p.mapel, p.bab, p.slot, p.scores) as ResultOf<A>
  }
  if (action === 'nilai.setExam') {
    const p = params as { mapel: Mapel; type: 'PTS' | 'PAS'; scores: NilaiScore[] }
    return mockNilaiSetExam(p.mapel, p.type, p.scores) as ResultOf<A>
  }
  if (action === 'nilai.setCell') {
    const p = params as {
      mapel: Mapel
      no: number
      field: 'daily' | 'pts' | 'pas'
      bab?: Bab
      slot?: Slot
      value: number | null
    }
    return mockNilaiSetCell(p.mapel, p.no, p.field, p.bab, p.slot, p.value) as ResultOf<A>
  }
  if (action === 'agenda.getMonth') {
    const p = params as { year: number; month: number }
    return mockAgendaGetMonth(p.year, p.month) as ResultOf<A>
  }
  if (action === 'beranda.overview') {
    const p = params as { date: string; year: number; month: number }
    const monthStr = p.year + '-' + String(p.month).padStart(2, '0')
    return {
      absenDay: mockGetDay(p.date),
      kasSummary: mockKasSummary(p.year),
      absenMonthOverview: mockMonthOverview(monthStr),
      agendaMonth: mockAgendaGetMonth(p.year, p.month),
    } as ResultOf<A>
  }

  throw new Error(`Mock for action ${action} not implemented`)
}

export async function apiCall<A extends ActionName>(
  action: A,
  params: ParamsOf<A>,
  method: MethodOf<A>,
): Promise<ResultOf<A>> {
  try {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true'
    if (isMock) {
      return await handleMock(action, params)
    }

    const gasUrl = import.meta.env.VITE_GAS_URL || ''
    if (!gasUrl) {
      throw new Error('VITE_GAS_URL is not set')
    }

    let url = `${gasUrl}?action=${encodeURIComponent(action)}`
    let body: BodyInit | undefined = undefined

    if (method === 'GET') {
      const searchParams = new URLSearchParams()
      Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
        searchParams.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
      })
      const qs = searchParams.toString()
      if (qs) {
        url += `&${qs}`
      }
    } else if (method === 'POST') {
      // POST payload as JSON inside body, with Content-Type: text/plain
      body = JSON.stringify({ action, params })
    }

    const response = await fetch(url, {
      method,
      headers: method === 'POST' ? { 'Content-Type': 'text/plain;charset=utf-8' } : undefined,
      body,
    })

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
    }

    const result = (await response.json()) as ApiResult<ResultOf<A>>

    if (!result.ok) {
      throw new ApiClientError(result.error)
    }

    return result.data
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error
    }
    throw new ApiClientError({
      code: 'UNKNOWN',
      message: error instanceof Error ? error.message : 'Unknown network error',
    })
  }
}
