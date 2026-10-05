import { useState, useCallback } from 'react'
import type { StatusAbsen, AbsenEntry } from '../types/api-contract'

export function useAbsenState(initialEntries: AbsenEntry[] = []) {
  const [entries, setEntriesState] = useState<Record<number, StatusAbsen>>(() => {
    const map: Record<number, StatusAbsen> = {}
    initialEntries.forEach((e) => {
      map[e.no] = e.status
    })
    return map
  })

  const toggleStatus = useCallback((no: number, activeTab: StatusAbsen) => {
    setEntriesState((prev) => {
      const current = prev[no] || 'H'
      const next = { ...prev }
      if (current === activeTab) {
        // Jika sudah di status ini, kembalikan ke H
        delete next[no]
      } else {
        // Pindahkan ke status baru (menimpa yang lama)
        next[no] = activeTab
      }
      return next
    })
  }, [])

  const getEntriesArray = useCallback((): AbsenEntry[] => {
    return Object.entries(entries).map(([noStr, status]) => ({
      no: parseInt(noStr, 10),
      status,
    }))
  }, [entries])

  const setEntries = useCallback((newEntries: Record<number, StatusAbsen>) => {
    setEntriesState(newEntries)
  }, [])

  return { entries, toggleStatus, getEntriesArray, setEntries }
}
