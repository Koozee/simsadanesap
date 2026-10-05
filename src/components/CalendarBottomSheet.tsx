import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toISODate, toISOMonth, parseISODate, getCalendarGrid, isSunday, formatMonthID } from '../utils/date'
import { apiCall } from '../api/client'
import type { AbsenMonthOverview } from '../types/api-contract'

interface CalendarBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelect: (date: string) => void;
}

export function CalendarBottomSheet({ isOpen, onClose, selectedDate, onSelect }: CalendarBottomSheetProps) {
  const [viewMonth, setViewMonth] = useState(toISOMonth(parseISODate(selectedDate)))
  const [overview, setOverview] = useState<AbsenMonthOverview | null>(null)

  useEffect(() => {
    if (isOpen) {
      apiCall('absensi.monthOverview', { month: viewMonth }, 'GET')
        .then(data => {
          setOverview(data)
        })
        .catch(err => {
          console.error(err)
        })
    }
  }, [isOpen, viewMonth])

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setViewMonth(toISOMonth(parseISODate(selectedDate)))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  if (!isOpen) return null
  
  const [y, m] = viewMonth.split('-').map(Number)
  const grid = getCalendarGrid(y, m)
  const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

  const handlePrevMonth = () => {
    const d = new Date(y, m - 2, 1)
    setViewMonth(toISOMonth(d))
  }
  
  const handleNextMonth = () => {
    const d = new Date(y, m, 1)
    setViewMonth(toISOMonth(d))
  }

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 z-40 transition-opacity" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[20px] shadow-lg z-50 p-4 max-w-md mx-auto animate-in slide-in-from-bottom duration-200">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />
        
        <div className="flex justify-between items-center mb-4">
          <button onClick={handlePrevMonth} className="p-2 text-slate-600 active:bg-slate-100 rounded-full"><ChevronLeft size={20} /></button>
          <span className="font-judul font-semibold text-lg text-slate-800">{formatMonthID(viewMonth)}</span>
          <button onClick={handleNextMonth} className="p-2 text-slate-600 active:bg-slate-100 rounded-full"><ChevronRight size={20} /></button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {DAYS.map((d, i) => (
            <div key={d} className={`text-xs font-medium py-1 ${i === 6 ? 'text-merah-600' : 'text-slate-500'}`}>
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {grid.map(date => {
            const iso = toISODate(date)
            const isCurrentMonth = date.getMonth() === m - 1
            const isSun = isSunday(iso)
            const isLibur = isSun || overview?.liburDates?.includes(iso)
            const isRecorded = overview?.recordedDates?.includes(iso)
            const isSelected = iso === selectedDate

            let btnClass = "w-full aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative "
            
            if (!isCurrentMonth) {
              btnClass += "text-slate-300 "
            } else if (isSelected) {
              btnClass += "bg-biru-600 text-white font-semibold "
            } else if (isLibur) {
              btnClass += "text-merah-600 bg-merah-50 "
            } else {
              btnClass += "text-slate-800 active:bg-slate-100 "
            }

            return (
              <button 
                key={iso} 
                onClick={() => {
                  if (!isLibur) onSelect(iso)
                }}
                disabled={isLibur}
                className={btnClass}
              >
                <span>{date.getDate()}</span>
                {isRecorded && (
                  <div className={`w-1 h-1 rounded-full absolute bottom-1 ${isSelected ? 'bg-white' : 'bg-biru-500'}`} />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
