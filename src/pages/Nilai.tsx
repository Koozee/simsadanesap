import { useState, useEffect, useMemo } from 'react'
import { apiCall } from '../api/client'
import { toast } from 'sonner'
import { Search, ChevronDown, Loader2, Edit3 } from 'lucide-react'
import type { Siswa, Mapel, NilaiSheet, Bab, Slot } from '../types/api-contract'

export default function NilaiPage() {
  const [subjects, setSubjects] = useState<Mapel[]>([])
  const [selectedMapel, setSelectedMapel] = useState<Mapel | null>(null)

  const [students, setStudents] = useState<Siswa[]>([])
  const [search, setSearch] = useState('')

  const [sheet, setSheet] = useState<NilaiSheet | null>(null)

  const [selectedNo, setSelectedNo] = useState<number | null>(null)

  // Fetch subjects & students on mount
  useEffect(() => {
    apiCall('nilai.subjects', {}, 'GET')
      .then((res) => {
        setSubjects(res)
        if (res.length > 0) setSelectedMapel(res[0])
      })
      .catch((err) => {
        console.error(err)
        toast.error('Gagal memuat daftar mapel')
      })

    apiCall('students.list', {}, 'GET').then(setStudents).catch(console.error)
  }, [])

  // Fetch sheet data when mapel changes
  useEffect(() => {
    if (!selectedMapel) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSheet(null) // clear old data to show loading

    apiCall('nilai.getSheet', { mapel: selectedMapel }, 'GET')
      .then(setSheet)
      .catch((err) => {
        console.error(err)
        toast.error('Gagal memuat data nilai')
      })
  }, [selectedMapel])

  const filteredStudents = useMemo(() => {
    if (!search) return students
    return students.filter((s) => s.nama.toLowerCase().includes(search.toLowerCase()))
  }, [students, search])

  const handleCellChange = async (
    no: number,
    field: 'daily' | 'pts' | 'pas',
    value: number | null,
    bab?: Bab,
    slot?: Slot,
  ) => {
    if (!selectedMapel) return

    // Optimistic update
    setSheet((prev) => {
      if (!prev) return prev
      const newRows = [...prev.rows]
      const idx = newRows.findIndex((r) => r.no === no)
      if (idx !== -1) {
        const r = { ...newRows[idx], daily: [...newRows[idx].daily] }
        if (field === 'daily' && bab && slot) {
          const arrIdx = (bab - 1) * 4 + (slot - 1)
          r.daily[arrIdx] = value
        } else if (field === 'pts') {
          r.pts = value
        } else if (field === 'pas') {
          r.pas = value
        }
        newRows[idx] = r
      }
      return { ...prev, rows: newRows }
    })

    try {
      const updatedRow = await apiCall(
        'nilai.setCell',
        { mapel: selectedMapel, no, field, bab, slot, value },
        'POST',
      )

      // Update with server result (for formulas like rataRata)
      setSheet((prev) => {
        if (!prev) return prev
        const newRows = [...prev.rows]
        const idx = newRows.findIndex((r) => r.no === no)
        if (idx !== -1) {
          newRows[idx] = updatedRow
        }
        return { ...prev, rows: newRows }
      })
    } catch (err: unknown) {
      console.error(err)
      toast.error((err as Error).message || 'Gagal menyimpan nilai')
      // Revert data
      apiCall('nilai.getSheet', { mapel: selectedMapel }, 'GET').then(setSheet)
    }
  }

  const selectedStudent = selectedNo ? students.find((s) => s.no === selectedNo) : null
  const selectedRow = selectedNo && sheet ? sheet.rows.find((r) => r.no === selectedNo) : null

  return (
    <div className="relative flex flex-col gap-4 pb-24">
      <div className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-slate-500">Mata Pelajaran</label>
        <div className="relative">
          <select
            className="focus:border-biru-500 focus:ring-biru-500 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 p-3 font-medium text-slate-800 focus:ring-1 focus:outline-none"
            value={selectedMapel || ''}
            onChange={(e) => setSelectedMapel(e.target.value as Mapel)}
          >
            {subjects.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
            size={20}
          />
        </div>
      </div>

      {!sheet ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="text-biru-500 mb-4 animate-spin" size={36} />
          <p className="font-medium">Memuat data nilai...</p>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama siswa"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus:border-biru-600 focus:ring-biru-600 w-full rounded-[10px] border border-slate-200 bg-white py-3 pr-4 pl-10 text-slate-800 shadow-sm placeholder:text-slate-400 focus:ring-1 focus:outline-none"
            />
          </div>

          <div className="divide-y divide-slate-100 overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-slate-400">Siswa tidak ditemukan</div>
            ) : (
              filteredStudents.map((s) => {
                const row = sheet.rows.find((x) => x.no === s.no)
                const rata2 = row?.rataRata ?? '-'
                const pts = row?.pts ?? '-'
                const pas = row?.pas ?? '-'

                return (
                  <div
                    key={s.no}
                    className="flex min-h-[72px] w-full cursor-pointer items-center justify-between p-4 text-left transition-colors active:bg-slate-50"
                    onClick={() => setSelectedNo(s.no)}
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="mb-1 truncate font-medium text-slate-800">{s.nama}</div>
                      <div className="flex gap-3 text-xs text-slate-500">
                        <span>
                          Rata-rata: <strong className="text-slate-700">{rata2}</strong>
                        </span>
                        <span>
                          PTS: <strong className="text-slate-700">{pts}</strong>
                        </span>
                        <span>
                          PAS: <strong className="text-slate-700">{pas}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400">
                      <Edit3 size={16} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}

      {/* Editor Modal / Bottom Sheet */}
      {selectedNo !== null && selectedStudent && selectedRow && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/40 p-4 backdrop-blur-sm sm:p-6"
          onClick={() => setSelectedNo(null)}
        >
          <div
            className="animate-in slide-in-from-bottom-10 mx-auto flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4">
              <div>
                <h3 className="font-judul text-lg font-semibold text-slate-800">
                  {selectedStudent.nama}
                </h3>
                <p className="text-sm text-slate-500">{selectedMapel}</p>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
              {/* Daily Scores */}
              <div className="space-y-4">
                <h4 className="flex justify-between font-semibold text-slate-700">
                  Nilai Harian
                  <span className="text-biru-600 bg-biru-50 rounded px-2 py-0.5 text-sm">
                    Rata-rata: {selectedRow.rataRata ?? '-'}
                  </span>
                </h4>

                {[1, 2, 3, 4, 5].map((bab) => (
                  <div key={bab} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-2 text-xs font-medium tracking-wider text-slate-500 uppercase">
                      Bab {bab}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((slot) => {
                        const idx = (bab - 1) * 4 + (slot - 1)
                        const val = selectedRow.daily[idx]
                        return (
                          <input
                            key={slot}
                            type="number"
                            placeholder="-"
                            value={val === null ? '' : val}
                            onChange={(e) => {
                              const v = e.target.value === '' ? null : Number(e.target.value)
                              handleCellChange(selectedNo, 'daily', v, bab as Bab, slot as Slot)
                            }}
                            className="md focus:border-biru-500 focus:ring-biru-500 w-full rounded border border-slate-200 bg-white p-2 text-center text-sm font-medium focus:ring-1 focus:outline-none"
                          />
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <hr className="border-slate-100" />

              {/* Exams */}
              <div className="space-y-4 pb-4">
                <h4 className="font-semibold text-slate-700">Ujian Semester</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
                    <div className="mb-2 text-xs font-medium tracking-wider text-indigo-500 uppercase">
                      PTS
                    </div>
                    <input
                      type="number"
                      placeholder="-"
                      value={selectedRow.pts === null ? '' : selectedRow.pts}
                      onChange={(e) => {
                        const v = e.target.value === '' ? null : Number(e.target.value)
                        handleCellChange(selectedNo, 'pts', v)
                      }}
                      className="md w-full rounded border border-indigo-200 bg-white p-2 text-center text-lg font-semibold text-indigo-700 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                    <div className="mb-2 text-xs font-medium tracking-wider text-emerald-500 uppercase">
                      PAS
                    </div>
                    <input
                      type="number"
                      placeholder="-"
                      value={selectedRow.pas === null ? '' : selectedRow.pas}
                      onChange={(e) => {
                        const v = e.target.value === '' ? null : Number(e.target.value)
                        handleCellChange(selectedNo, 'pas', v)
                      }}
                      className="md w-full rounded border border-emerald-200 bg-white p-2 text-center text-lg font-semibold text-emerald-700 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-white p-4">
              <button
                onClick={() => setSelectedNo(null)}
                className="bg-biru-600 active:bg-biru-700 w-full rounded-xl py-3 font-medium text-white shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
