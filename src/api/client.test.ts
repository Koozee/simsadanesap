import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { apiCall, ApiClientError } from './client'
import type { ApiFail } from '../types/api-contract'

describe('ApiClient', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  it('mengembalikan 32 siswa pada mode mock', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'true')
    const result = await apiCall('students.list', {}, 'GET')
    expect(result).toHaveLength(32)
    expect(result[0].nama).toMatch(/Siswa Fiktif/)
  })

  it('melempar ApiClientError dengan kode yang tepat saat respons { ok: false }', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'false')
    vi.stubEnv('VITE_GAS_URL', 'https://script.google.com/macros/s/xxx/exec')
    
    const mockErrorRes: ApiFail = {
      ok: false,
      error: { code: 'INVALID_INPUT', message: 'Input salah' }
    }
    
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockErrorRes
    } as Response)

    try {
      await apiCall('students.list', {}, 'GET')
      expect.unreachable('Harus melempar error')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiClientError)
      if (error instanceof ApiClientError) {
        expect(error.code).toBe('INVALID_INPUT')
        expect(error.message).toBe('Input salah')
      }
    }
  })
})
