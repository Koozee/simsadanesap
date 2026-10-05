import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { apiCall } from '../api/client'
import { toISODate, formatDateID, getCalendarGrid, formatMonthID } from '../utils/date'
import { Users, Wallet, Receipt, FileText, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import {CircularProgress} from '../components/CircularProgress'
import type { BerandaOverview } from '../types/api-contract'

export default function BerandaPage() {
  const [overview, setOverview] = useState<BerandaOverview | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [activeYear, setActiveYear] = useState(new Date().getFullYear())
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth() + 1)
  const [isLoading, setIsLoading] = useState(true)

  const today = toISODate(new Date())
  const todayString = formatDateID(today)
  const formatRp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  useEffect(() => {
    setIsLoading(true)
    apiCall('beranda.overview', { date: today, year: activeYear, month: activeMonth }, 'GET')
      .then(data => {
        setOverview(data)
        if (!selectedDate) setSelectedDate(today)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today, activeYear, activeMonth])

  const handlePrevMonth = () => {
    if (activeMonth === 1) {
      setActiveMonth(12)
      setActiveYear(y => y - 1)
    } else {
      setActiveMonth(m => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (activeMonth === 12) {
      setActiveMonth(1)
      setActiveYear(y => y + 1)
    } else {
      setActiveMonth(m => m + 1)
    }
  }

  const absen = overview?.absenDay
  const kas = overview?.kasSummary
  const liburDates = overview?.absenMonthOverview?.liburDates || []
  const agenda = overview?.agendaMonth || []

  // Hitung status absen
  let hadir = 0, sakit = 0, izin = 0, alpha = 0
  if (absen && absen.recorded && absen.entries) {
    absen.entries.forEach(e => {
      if (e.status === 'H') hadir++
      if (e.status === 'S') sakit++
      if (e.status === 'I') izin++
      if (e.status === 'A') alpha++
    })
  }
  const persen = absen?.recorded ? Math.round((hadir / 32) * 100) : 0

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="font-judul font-semibold text-2xl text-slate-800">SIM SADANEPA</h1>
        <p className="text-slate-500 font-medium mt-1">{todayString}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin" size={36} />
        </div>
      ) : (
        <>
          {/* Absensi Card */}
          <Link to="/absensi" className="block bg-white rounded-2xl p-5 shadow-sm border border-slate-200 active:scale-[0.98] transition-transform">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-judul font-semibold text-lg text-slate-800 flex items-center gap-2">
                <Users className="text-biru-600" size={20} /> Kehadiran
              </h2>
              <ChevronRight className="text-slate-400" size={20} />
            </div>

            {absen?.sunday || absen?.libur ? (
              <div className="bg-red-50 text-red-600 font-medium p-4 rounded-xl text-center">
                Hari ini Libur
              </div>
            ) : !absen?.recorded ? (
              <div className="bg-yellow-50 text-yellow-700 font-medium p-4 rounded-xl text-center">
                Belum diisi hari ini
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 shrink-0">
                  <CircularProgress percent={persen} />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-y-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-medium uppercase">Hadir</span>
                    <span className="font-semibold text-hadir-solid text-lg">{hadir}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-medium uppercase">Sakit</span>
                    <span className="font-semibold text-sakit-solid text-lg">{sakit}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-medium uppercase">Izin</span>
                    <span className="font-semibold text-izin-solid text-lg">{izin}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-medium uppercase">Alpha</span>
                    <span className="font-semibold text-alpha-solid text-lg">{alpha}</span>
                  </div>
                </div>
              </div>
            )}
          </Link>

          {/* Kas Card */}
          <Link to="/kas" className="block bg-white rounded-2xl p-5 shadow-sm border border-slate-200 active:scale-[0.98] transition-transform">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-judul font-semibold text-lg text-slate-800 flex items-center gap-2">
                <Wallet className="text-emerald-600" size={20} /> Saldo Kas {activeYear}
              </h2>
              <ChevronRight className="text-slate-400" size={20} />
            </div>
            {kas ? (
              <div className="mt-2">
                <div className="text-3xl font-judul font-semibold text-emerald-600 mb-3">
                  {formatRp(kas.saldo)}
                </div>
                <div className="flex gap-4 text-sm font-medium">
                  <div className="text-slate-500">Masuk: <span className="text-slate-700">{formatRp(kas.pemasukan)}</span></div>
                  <div className="text-slate-500">Keluar: <span className="text-slate-700">{formatRp(kas.pengeluaran)}</span></div>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 py-2">Data kas belum tersedia</div>
            )}
          </Link>

          {/* Kalender */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-judul font-semibold text-base sm:text-lg text-slate-800">
                Kalender {formatMonthID(activeYear + '-' + String(activeMonth).padStart(2, '0'))}
              </h2>
              <div className="flex items-center gap-1">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"><ChevronLeft size={20}/></button>
                <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"><ChevronRight size={20}/></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(d => (
                <div key={d} className="text-xs uppercase tracking-tight font-semibold text-slate-400 truncate">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {getCalendarGrid(activeYear, activeMonth).map((d, i) => {
                const iso = toISODate(d)
                const isCurrentMonth = d.getMonth() + 1 === activeMonth
                const isToday = iso === today
                const isSelected = iso === selectedDate
                
                const isLibur = liburDates.includes(iso) || d.getDay() === 0
                const agendaHari = agenda.filter(a => a.tanggal === iso)
                const isUjian = isCurrentMonth && agendaHari.length > 0
                
                return (
                  <button 
                    key={i} 
                    onClick={() => setSelectedDate(iso)}
                    className={`h-10 sm:h-12 flex flex-col items-center justify-center rounded-lg relative transition-colors ${!isCurrentMonth ? 'opacity-30' : ''} ${isSelected ? 'bg-biru-600 text-white shadow-md' : isToday ? 'bg-biru-50 border border-biru-200' : 'hover:bg-slate-50'}`}
                  >
                    <span className={`text-xs sm:text-sm font-medium ${isSelected ? 'text-white' : isLibur ? 'text-red-600' : isToday ? 'text-biru-700' : 'text-slate-700'}`}>
                      {d.getDate()}
                    </span>
                    
                    {/* Penanda bawah */}
                    <div className="flex gap-1 mt-1 h-1.5">
                      {isLibur && liburDates.includes(iso) && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm"></div>}
                      {isUjian && <div className="w-1.5 h-1.5 rounded-full bg-emas-400 shadow-sm"></div>}
                    </div>
                  </button>
                )
              })}
            </div>
            
            <div className="flex gap-4 mt-3 text-[10px] text-slate-500 justify-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Libur</div>
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emas-400"></div> Ujian/Tugas</div>
            </div>

            {/* Detail Tanggal */}
            {selectedDate && (
              <div className="mt-3">
                <h3 className="font-semibold text-slate-700 text-sm mb-2">Agenda {formatDateID(selectedDate!)}</h3>
                <div className="flex flex-col gap-2">
                  {liburDates.includes(selectedDate!) && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-red-700 bg-red-50 p-2 rounded-lg border border-red-100">
                      <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                      Hari Libur
                    </div>
                  )}
                  {/* Render agenda dari database */}
                  {agenda.filter(a => a.tanggal === selectedDate).map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="w-2 h-2 rounded-full bg-emas-400 shrink-0"></div>
                      <div>
                        {a.mapel ? <><span className="font-medium text-slate-800">{a.mapel}</span> - </> : null}
                        {a.keterangan}
                      </div>
                    </div>
                  ))}
                  
                  {!liburDates.includes(selectedDate!) && agenda.filter(a => a.tanggal === selectedDate).length === 0 && (
                    <div className="text-xs text-slate-400 p-2 text-center bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                      Tidak ada agenda tercatat
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pintasan */}
          <div>
            <h3 className="font-judul font-semibold text-slate-800 mb-4 px-1">Pintasan</h3>
            <div className="grid grid-cols-4 gap-3">
              <Link to="/absensi" className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-biru-50 text-biru-600 rounded-2xl flex items-center justify-center active:scale-95 transition-transform">
                  <Users size={24} />
                </div>
                <span className="text-xs font-medium text-slate-600">Absensi</span>
              </Link>
              
              <Link to="/kas" className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center active:scale-95 transition-transform">
                  <Wallet size={24} />
                </div>
                <span className="text-xs font-medium text-slate-600">Kas</span>
              </Link>

              <Link to="/kas/pengeluaran" className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center active:scale-95 transition-transform">
                  <Receipt size={24} />
                </div>
                <span className="text-xs font-medium text-slate-600 text-center leading-tight">Pengeluaran</span>
              </Link>

              <Link to="/nilai" className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center active:scale-95 transition-transform">
                  <FileText size={24} />
                </div>
                <span className="text-xs font-medium text-slate-600">Nilai</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
