import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Search } from 'lucide-react'
import { toISODate, addDays, formatDateID, isSunday } from '../utils/date'
import { CalendarBottomSheet } from '../components/CalendarBottomSheet'
import { apiCall } from '../api/client'
import { useAbsenState } from '../hooks/useAbsenState'
import type { Siswa, AbsenEntry } from '../types/api-contract'

export default function AbsensiPage() {
  const [date, setDate] = useState(toISODate(new Date()))
  const [showCalendar, setShowCalendar] = useState(false)
  const [students, setStudents] = useState<Siswa[]>([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'S' | 'I' | 'A'>('S')
  const [isLoading, setIsLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  
  const { entries, toggleStatus, getEntriesArray, setEntries } = useAbsenState()

  useEffect(() => {
    apiCall('students.list', {}, 'GET')
      .then(data => {
        setStudents(data)
      })
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true)
    apiCall('absensi.getDay', { date }, 'GET')
      .then(data => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const map: Record<number, any> = {}
        data.entries.forEach((e: AbsenEntry) => { map[e.no] = e.status })
        setEntries(map)
        setIsDirty(false)
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false))
  }, [date, setEntries])

  const handlePrev = () => {
    let nextDate = addDays(date, -1)
    if (isSunday(nextDate)) nextDate = addDays(nextDate, -1)
    setDate(nextDate)
  }
  
  const handleNext = () => {
    let nextDate = addDays(date, 1)
    if (isSunday(nextDate)) nextDate = addDays(nextDate, 1)
    setDate(nextDate)
  }

  const handleToggle = (no: number) => {
    toggleStatus(no, activeTab)
    setIsDirty(true)
  }

  const handleSave = async () => {
    try {
      await apiCall('absensi.saveDay', { date, entries: getEntriesArray() }, 'POST')
      setIsDirty(false)
    } catch (err) {
      console.error(err)
    }
  }

  const filteredStudents = useMemo(() => {
    if (!search) return students
    return students.filter(s => s.nama.toLowerCase().includes(search.toLowerCase()))
  }, [students, search])

  let countH = students.length, countS = 0, countI = 0, countA = 0
  for (const s of students) {
    const status = entries[s.no] || 'H'
    if (status === 'S') { countS++; countH-- }
    else if (status === 'I') { countI++; countH-- }
    else if (status === 'A') { countA++; countH-- }
  }

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-[10px] p-2 shadow-sm">
        <button onClick={handlePrev} className="p-2 text-slate-600 active:bg-slate-100 rounded-[10px]">
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => setShowCalendar(true)} className="flex-1 flex justify-center items-center gap-2 font-medium text-slate-800 active:bg-slate-50 py-2 rounded-[10px]">
          <CalendarIcon size={18} className="text-biru-600" />
          {formatDateID(date)}
        </button>
        <button onClick={handleNext} className="p-2 text-slate-600 active:bg-slate-100 rounded-[10px]">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setActiveTab('S')} className={`flex-1 py-2.5 rounded-[10px] font-medium transition-colors ${activeTab === 'S' ? 'bg-biru-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600'}`}>
          Sakit {countS > 0 && <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-md text-xs">{countS}</span>}
        </button>
        <button onClick={() => setActiveTab('I')} className={`flex-1 py-2.5 rounded-[10px] font-medium transition-colors ${activeTab === 'I' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600'}`}>
          Izin {countI > 0 && <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-md text-xs">{countI}</span>}
        </button>
        <button onClick={() => setActiveTab('A')} className={`flex-1 py-2.5 rounded-[10px] font-medium transition-colors ${activeTab === 'A' ? 'bg-merah-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600'}`}>
          Alpha {countA > 0 && <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-md text-xs">{countA}</span>}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Cari nama siswa" 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="w-full bg-white border border-slate-200 rounded-[10px] py-2.5 pl-10 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-biru-600 focus:ring-1 focus:ring-biru-600 shadow-sm"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-slate-500">Memuat data...</div>
      ) : (
        <div className="bg-white rounded-[10px] border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
          {filteredStudents.length === 0 ? (
            <div className="p-4 text-center text-slate-500">Tidak ada siswa ditemukan</div>
          ) : (
            filteredStudents.map(s => {
              const status = entries[s.no]
              
              let badgeClass = ''
              if (status === 'S') badgeClass = 'bg-biru-100 text-biru-700'
              else if (status === 'I') badgeClass = 'bg-emerald-100 text-emerald-700'
              else if (status === 'A') badgeClass = 'bg-merah-100 text-merah-700'
              
              return (
                <button 
                  key={s.no} 
                  onClick={() => handleToggle(s.no)} 
                  className="w-full text-left p-4 flex justify-between items-center active:bg-slate-50 transition-colors min-h-[56px]"
                >
                  <div className="flex items-center">
                    <span className="text-slate-400 w-8 inline-block font-tabular-nums">{s.no}</span>
                    <span className="text-slate-800 font-medium truncate max-w-[200px]">{s.nama}</span>
                  </div>
                  {status && status !== 'H' && (
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm ${badgeClass}`}>
                      {status}
                    </div>
                  )}
                </button>
              )
            })
          )}
        </div>
      )}

      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-50 animate-in slide-in-from-bottom">
           <div className="flex justify-between items-center mb-3">
              <span className="font-medium text-slate-600">Ringkasan</span>
              <span className="font-judul font-semibold text-biru-600">Hadir {countH} dari {students.length}</span>
           </div>
           <button onClick={handleSave} className="w-full bg-biru-600 text-white py-3 rounded-[10px] font-semibold active:bg-biru-700 transition-colors">
             Simpan absensi
           </button>
        </div>
      )}

      <CalendarBottomSheet 
        isOpen={showCalendar} 
        onClose={() => setShowCalendar(false)} 
        selectedDate={date} 
        onSelect={(d) => { setDate(d); setShowCalendar(false) }} 
      />
    </div>
  )
}
