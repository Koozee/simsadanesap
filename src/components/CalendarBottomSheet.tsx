import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  toISODate,
  toISOMonth,
  parseISODate,
  getCalendarGrid,
  isSunday,
  formatMonthID,
} from '../utils/date'
import { apiCall } from '../api/client'
import type { AbsenMonthOverview } from '../types/api-contract'

interface CalendarBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: string
  onSelect: (date: string) => void
}

export function CalendarBottomSheet({
  isOpen,
  onClose,
  selectedDate,
  onSelect,
}: CalendarBottomSheetProps) {
  const [viewMonth, setViewMonth] = useState(toISOMonth(parseISODate(selectedDate)))
  const [overview, setOverview] = useState<AbsenMonthOverview | null>(null)

  useEffect(() => {
    if (isOpen) {
      apiCall('absensi.monthOverview', { month: viewMonth }, 'GET')
        .then((data) => {
          setOverview(data)
        })
        .catch((err) => {
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
      <div className="fixed inset-0 z-40 bg-slate-900/40 transition-opacity" onClick={onClose} />
      <div className="animate-in slide-in-from-bottom fixed right-0 bottom-0 left-0 z-50 mx-auto max-w-md rounded-t-[20px] bg-white p-4 shadow-lg duration-200">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />

        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="rounded-full p-2 text-slate-600 active:bg-slate-100"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-heading text-lg font-semibold text-slate-800">
            {formatMonthID(viewMonth)}
          </span>
          <button
            onClick={handleNextMonth}
            className="rounded-full p-2 text-slate-600 active:bg-slate-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center">
          {DAYS.map((d, i) => (
            <div
              key={d}
              className={`py-1 text-xs font-medium ${i === 6 ? 'text-danger-600' : 'text-slate-500'}`}
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {grid.map((date) => {
            const iso = toISODate(date)
            const isCurrentMonth = date.getMonth() === m - 1
            const isSun = isSunday(iso)
            const isLibur = isSun || overview?.liburDates?.includes(iso)
            const isRecorded = overview?.recordedDates?.includes(iso)
            const isSelected = iso === selectedDate

            let btnClass =
              'w-full aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative '

            if (!isCurrentMonth) {
              btnClass += 'text-slate-300 '
            } else if (isSelected) {
              btnClass += 'bg-primary-600 text-white font-semibold '
            } else if (isLibur) {
              btnClass += 'text-danger-600 bg-merah-50 '
            } else {
              btnClass += 'text-slate-800 active:bg-slate-100 '
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
                  <div
                    className={`absolute bottom-1 h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-primary-500'}`}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
