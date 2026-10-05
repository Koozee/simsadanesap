import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { apiCall } from '../api/client'
import { toISODate, formatDateID, getCalendarGrid, formatMonthID } from '../utils/date'
import { Users, Wallet, Receipt, FileText, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import { CircularProgress } from '../components/CircularProgress'
import type { BerandaOverview } from '../types/api-contract'

export default function BerandaPage() {
  const [overview, setOverview] = useState<BerandaOverview | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [activeYear, setActiveYear] = useState(new Date().getFullYear())
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth() + 1)
  const [isNavigating, setIsNavigating] = useState(false)

  const today = toISODate(new Date())
  const todayString = formatDateID(today)
  const formatRp = (n: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(n)

  useEffect(() => {
    if (overview) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsNavigating(true)
    }

    apiCall('beranda.overview', { date: today, year: activeYear, month: activeMonth }, 'GET')
      .then((data) => {
        setOverview(data)
        if (!selectedDate) setSelectedDate(today)
      })
      .catch(() => {})
      .finally(() => {
        setIsNavigating(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today, activeYear, activeMonth])

  const handlePrevMonth = () => {
    if (activeMonth === 1) {
      setActiveMonth(12)
      setActiveYear((y) => y - 1)
    } else {
      setActiveMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (activeMonth === 12) {
      setActiveMonth(1)
      setActiveYear((y) => y + 1)
    } else {
      setActiveMonth((m) => m + 1)
    }
  }

  const absen = overview?.absenDay
  const kas = overview?.kasSummary
  const liburDates = overview?.absenMonthOverview?.liburDates || []
  const agenda = overview?.agendaMonth || []

  // Hitung status absen
  let hadir = 0,
    sakit = 0,
    izin = 0,
    alpha = 0
  if (absen && absen.recorded && absen.entries) {
    absen.entries.forEach((e) => {
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
        <h1 className="font-judul text-2xl font-semibold text-slate-800">SIM SADANEPA</h1>
        <p className="mt-1 font-medium text-slate-500">{todayString}</p>
      </div>

      {!overview ? (
        <div className="flex justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin" size={36} />
        </div>
      ) : (
        <>
          {/* Absensi Card */}
          <Link
            to="/absensi"
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-transform active:scale-[0.98]"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-judul flex items-center gap-2 text-lg font-semibold text-slate-800">
                <Users className="text-biru-600" size={20} /> Kehadiran
              </h2>
              <ChevronRight className="text-slate-400" size={20} />
            </div>

            {absen?.sunday || absen?.libur ? (
              <div className="rounded-xl bg-red-50 p-4 text-center font-medium text-red-600">
                Hari ini Libur
              </div>
            ) : !absen?.recorded ? (
              <div className="rounded-xl bg-yellow-50 p-4 text-center font-medium text-yellow-700">
                Belum diisi hari ini
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 shrink-0">
                  <CircularProgress percent={persen} />
                </div>
                <div className="grid flex-1 grid-cols-2 gap-y-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-500 uppercase">Hadir</span>
                    <span className="text-hadir-solid text-lg font-semibold">{hadir}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-500 uppercase">Sakit</span>
                    <span className="text-sakit-solid text-lg font-semibold">{sakit}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-500 uppercase">Izin</span>
                    <span className="text-izin-solid text-lg font-semibold">{izin}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-500 uppercase">Alpha</span>
                    <span className="text-alpha-solid text-lg font-semibold">{alpha}</span>
                  </div>
                </div>
              </div>
            )}
          </Link>

          {/* Kas Card */}
          <Link
            to="/kas"
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-transform active:scale-[0.98]"
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-judul flex items-center gap-2 text-lg font-semibold text-slate-800">
                <Wallet className="text-emerald-600" size={20} /> Saldo Kas {activeYear}
              </h2>
              <ChevronRight className="text-slate-400" size={20} />
            </div>
            {kas ? (
              <div className="mt-2">
                <div className="font-judul mb-3 text-3xl font-semibold text-emerald-600">
                  {formatRp(kas.saldo)}
                </div>
                <div className="flex gap-4 text-sm font-medium">
                  <div className="text-slate-500">
                    Masuk: <span className="text-slate-700">{formatRp(kas.pemasukan)}</span>
                  </div>
                  <div className="text-slate-500">
                    Keluar: <span className="text-slate-700">{formatRp(kas.pengeluaran)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-2 text-slate-400">Data kas belum tersedia</div>
            )}
          </Link>

          {/* Kalender */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {isNavigating && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                <Loader2 className="text-biru-500 animate-spin" size={32} />
              </div>
            )}

            <div className="relative z-0 mb-4 flex items-center justify-between">
              <h2 className="font-judul text-base font-semibold text-slate-800 sm:text-lg">
                Kalender {formatMonthID(activeYear + '-' + String(activeMonth).padStart(2, '0'))}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            <div className="mb-2 grid grid-cols-7 gap-1 text-center">
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((d) => (
                <div
                  key={d}
                  className="truncate text-xs font-semibold tracking-tight text-slate-400 uppercase"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {getCalendarGrid(activeYear, activeMonth).map((d, i) => {
                const iso = toISODate(d)
                const isCurrentMonth = d.getMonth() + 1 === activeMonth
                const isToday = iso === today
                const isSelected = iso === selectedDate

                const isLibur = liburDates.includes(iso) || d.getDay() === 0
                const agendaHari = agenda.filter((a) => a.tanggal === iso)
                const isUjian = isCurrentMonth && agendaHari.length > 0

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(iso)}
                    className={`relative flex h-10 flex-col items-center justify-center rounded-lg transition-colors sm:h-12 ${!isCurrentMonth ? 'opacity-30' : ''} ${isSelected ? 'bg-biru-600 text-white shadow-md' : isToday ? 'bg-biru-50 border-biru-200 border' : 'hover:bg-slate-50'}`}
                  >
                    <span
                      className={`text-xs font-medium sm:text-sm ${isSelected ? 'text-white' : isLibur ? 'text-red-600' : isToday ? 'text-biru-700' : 'text-slate-700'}`}
                    >
                      {d.getDate()}
                    </span>

                    {/* Penanda bawah */}
                    <div className="mt-1 flex h-1.5 gap-1">
                      {isLibur && liburDates.includes(iso) && (
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-sm"></div>
                      )}
                      {isUjian && (
                        <div className="bg-emas-400 h-1.5 w-1.5 rounded-full shadow-sm"></div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-3 flex justify-center gap-4 border-b border-slate-100 pb-2 text-[10px] text-slate-500">
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div> Libur
              </div>
              <div className="flex items-center gap-1">
                <div className="bg-emas-400 h-1.5 w-1.5 rounded-full"></div> Ujian/Tugas
              </div>
            </div>

            {/* Detail Tanggal */}
            {selectedDate && (
              <div className="mt-3">
                <h3 className="mb-2 text-sm font-semibold text-slate-700">
                  Agenda {formatDateID(selectedDate!)}
                </h3>
                <div className="flex flex-col gap-2">
                  {liburDates.includes(selectedDate!) && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-2 text-xs text-red-700 sm:text-sm">
                      <div className="h-2 w-2 shrink-0 rounded-full bg-red-500"></div>
                      Hari Libur
                    </div>
                  )}
                  {/* Render agenda dari database */}
                  {agenda
                    .filter((a) => a.tanggal === selectedDate)
                    .map((a, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2 text-xs text-slate-700 sm:text-sm"
                      >
                        <div className="bg-emas-400 h-2 w-2 shrink-0 rounded-full"></div>
                        <div>
                          {a.mapel ? (
                            <>
                              <span className="font-medium text-slate-800">{a.mapel}</span> -{' '}
                            </>
                          ) : null}
                          {a.keterangan}
                        </div>
                      </div>
                    ))}

                  {!liburDates.includes(selectedDate!) &&
                    agenda.filter((a) => a.tanggal === selectedDate).length === 0 && (
                      <div className="rounded-lg border border-dashed border-slate-100 bg-slate-50 p-2 text-center text-xs text-slate-400">
                        Tidak ada agenda tercatat
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* Pintasan */}
          <div>
            <h3 className="font-judul mb-4 px-1 font-semibold text-slate-800">Pintasan</h3>
            <div className="grid grid-cols-4 gap-3">
              <Link to="/absensi" className="flex flex-col items-center gap-2">
                <div className="bg-biru-50 text-biru-600 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform active:scale-95">
                  <Users size={24} />
                </div>
                <span className="text-xs font-medium text-slate-600">Absensi</span>
              </Link>

              <Link to="/kas" className="flex flex-col items-center gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform active:scale-95">
                  <Wallet size={24} />
                </div>
                <span className="text-xs font-medium text-slate-600">Kas</span>
              </Link>

              <Link to="/kas/pengeluaran" className="flex flex-col items-center gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 transition-transform active:scale-95">
                  <Receipt size={24} />
                </div>
                <span className="text-center text-xs leading-tight font-medium text-slate-600">
                  Pengeluaran
                </span>
              </Link>

              <Link to="/nilai" className="flex flex-col items-center gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-transform active:scale-95">
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
