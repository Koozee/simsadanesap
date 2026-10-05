import type { ActionName, ParamsOf, ResultOf, ApiResult, ApiError, MethodOf } from '../types/api-contract'
import { mockStudents } from './mockData'


export class ApiClientError extends Error {
  code: string
  constructor(error: ApiError) {
    super(error.message)
    this.name = 'ApiClientError'
    this.code = error.code
  }
}

async function handleMock<A extends ActionName>(action: A, _params: ParamsOf<A>): Promise<ResultOf<A>> {
  void _params
  await new Promise(resolve => setTimeout(resolve, 500))
  
  if (action === 'students.list') {
    return mockStudents as ResultOf<A>
  }
  
  throw new Error(`Mock for action ${action} not implemented`)
}

export async function apiCall<A extends ActionName>(
  action: A,
  params: ParamsOf<A>,
  method: MethodOf<A>
): Promise<ResultOf<A>> {
  const isMock = import.meta.env.VITE_USE_MOCK === 'true'
  if (isMock) {
    return handleMock(action, params)
  }

  const gasUrl = import.meta.env.VITE_GAS_URL || ''
  if (!gasUrl) {
    throw new Error('VITE_GAS_URL is not set')
  }

  try {
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
