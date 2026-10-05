import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { toISODate, addDays, formatDateID, isSunday } from '../utils/date'
import { CalendarBottomSheet } from '../components/CalendarBottomSheet'

export default function AbsensiPage() {
  const [date, setDate] = useState(toISODate(new Date()))
  const [showCalendar, setShowCalendar] = useState(false)
  
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

  return (
    <div className="flex flex-col gap-4">
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

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-center text-slate-500">
        (Isi halaman absensi akan menyusul di tugas berikutnya)
      </div>

      <CalendarBottomSheet 
        isOpen={showCalendar} 
        onClose={() => setShowCalendar(false)} 
        selectedDate={date} 
        onSelect={(d) => { setDate(d); setShowCalendar(false) }} 
      />
    </div>
  )
}
