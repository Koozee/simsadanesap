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
      .then(res => {
        setSubjects(res)
        if (res.length > 0) setSelectedMapel(res[0])
      })
      .catch(err => {
        console.error(err)
        toast.error('Gagal memuat daftar mapel')
      })
      
    apiCall('students.list', {}, 'GET')
      .then(setStudents)
      .catch(console.error)
  }, [])

  // Fetch sheet data when mapel changes
  useEffect(() => {
    if (!selectedMapel) return
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSheet(null) // clear old data to show loading
    
    apiCall('nilai.getSheet', { mapel: selectedMapel }, 'GET')
      .then(setSheet)
      .catch(err => {
        console.error(err)
        toast.error('Gagal memuat data nilai')
      })
  }, [selectedMapel])

  const filteredStudents = useMemo(() => {
    if (!search) return students
    return students.filter(s => s.nama.toLowerCase().includes(search.toLowerCase()))
  }, [students, search])

  const handleCellChange = async (no: number, field: 'daily' | 'pts' | 'pas', value: number | null, bab?: Bab, slot?: Slot) => {
    if (!selectedMapel) return
    
    // Optimistic update
    setSheet(prev => {
      if (!prev) return prev
      const newRows = [...prev.rows]
      const idx = newRows.findIndex(r => r.no === no)
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
      const updatedRow = await apiCall('nilai.setCell', { mapel: selectedMapel, no, field, bab, slot, value }, 'POST')
      
      // Update with server result (for formulas like rataRata)
      setSheet(prev => {
        if (!prev) return prev
        const newRows = [...prev.rows]
        const idx = newRows.findIndex(r => r.no === no)
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

  const selectedStudent = selectedNo ? students.find(s => s.no === selectedNo) : null
  const selectedRow = selectedNo && sheet ? sheet.rows.find(r => r.no === selectedNo) : null

  return (
    <div className="flex flex-col gap-4 pb-24 relative">
      <div className="bg-white p-4 rounded-[10px] shadow-sm border border-slate-200">
        <label className="block text-sm font-medium text-slate-500 mb-2">Mata Pelajaran</label>
        <div className="relative">
          <select 
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-3 appearance-none focus:outline-none focus:border-biru-500 focus:ring-1 focus:ring-biru-500 font-medium"
            value={selectedMapel || ''}
            onChange={e => setSelectedMapel(e.target.value as Mapel)}
          >
            {subjects.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
        </div>
      </div>

      {!sheet ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="animate-spin mb-4 text-biru-500" size={36} />
          <p className="font-medium">Memuat data nilai...</p>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama siswa" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-full bg-white border border-slate-200 rounded-[10px] py-3 pl-10 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-biru-600 focus:ring-1 focus:ring-biru-600 shadow-sm"
            />
          </div>

          <div className="bg-white rounded-[10px] border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-slate-400">Siswa tidak ditemukan</div>
            ) : (
              filteredStudents.map(s => {
                const row = sheet.rows.find(x => x.no === s.no)
                const rata2 = row?.rataRata ?? '-'
                const pts = row?.pts ?? '-'
                const pas = row?.pas ?? '-'
                
                return (
                  <div key={s.no} className="w-full text-left p-4 flex justify-between items-center active:bg-slate-50 transition-colors cursor-pointer min-h-[72px]" onClick={() => setSelectedNo(s.no)}>
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="text-slate-800 font-medium truncate mb-1">{s.nama}</div>
                      <div className="flex gap-3 text-xs text-slate-500">
                        <span>Rata-rata: <strong className="text-slate-700">{rata2}</strong></span>
                        <span>PTS: <strong className="text-slate-700">{pts}</strong></span>
                        <span>PAS: <strong className="text-slate-700">{pas}</strong></span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200 shrink-0">
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
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6" onClick={() => setSelectedNo(null)}>
          <div 
            className="bg-white w-full max-w-md mx-auto rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-judul font-semibold text-lg text-slate-800">{selectedStudent.nama}</h3>
                <p className="text-sm text-slate-500">{selectedMapel}</p>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-6">
              
              {/* Daily Scores */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-700 flex justify-between">
                  Nilai Harian 
                  <span className="text-biru-600 text-sm bg-biru-50 px-2 py-0.5 rounded">Rata-rata: {selectedRow.rataRata ?? '-'}</span>
                </h4>
                
                {[1, 2, 3, 4, 5].map(bab => (
                  <div key={bab} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Bab {bab}</div>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map(slot => {
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
                            className="w-full bg-white border border-slate-200 rounded md p-2 text-center text-sm font-medium focus:outline-none focus:border-biru-500 focus:ring-1 focus:ring-biru-500"
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
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                    <div className="text-xs font-medium text-indigo-500 mb-2 uppercase tracking-wider">PTS</div>
                    <input
                      type="number"
                      placeholder="-"
                      value={selectedRow.pts === null ? '' : selectedRow.pts}
                      onChange={(e) => {
                        const v = e.target.value === '' ? null : Number(e.target.value)
                        handleCellChange(selectedNo, 'pts', v)
                      }}
                      className="w-full bg-white border border-indigo-200 rounded md p-2 text-center text-lg font-semibold text-indigo-700 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                    <div className="text-xs font-medium text-emerald-500 mb-2 uppercase tracking-wider">PAS</div>
                    <input
                      type="number"
                      placeholder="-"
                      value={selectedRow.pas === null ? '' : selectedRow.pas}
                      onChange={(e) => {
                        const v = e.target.value === '' ? null : Number(e.target.value)
                        handleCellChange(selectedNo, 'pas', v)
                      }}
                      className="w-full bg-white border border-emerald-200 rounded md p-2 text-center text-lg font-semibold text-emerald-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

            </div>
            
            <div className="p-4 border-t border-slate-100 bg-white">
              <button 
                onClick={() => setSelectedNo(null)}
                className="w-full bg-biru-600 text-white font-medium py-3 rounded-xl active:bg-biru-700 shadow-sm"
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
