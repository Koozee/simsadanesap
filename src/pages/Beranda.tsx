import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { apiCall } from '../api/client'
import { formatRp, getTodayDate, getTodayString } from '../utils/date'
import { Users, Wallet, Receipt, FileText, ChevronRight, Loader2 } from 'lucide-react'
import CircularProgress from '../components/CircularProgress'
import type { AbsenDay, KasSummary } from '../types/api-contract'

export default function BerandaPage() {
  const [absen, setAbsen] = useState<AbsenDay | null>(null)
  const [kas, setKas] = useState<KasSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const today = getTodayDate()
  const thisYear = new Date().getFullYear()

  useEffect(() => {
    Promise.all([
      apiCall('absensi.getDay', { date: today }, 'GET').catch(() => null),
      apiCall('kas.summary', { year: thisYear }, 'GET').catch(() => null)
    ]).then(([absenData, kasData]) => {
      setAbsen(absenData as AbsenDay | null)
      setKas(kasData as KasSummary | null)
    }).finally(() => setIsLoading(false))
  }, [today, thisYear])

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
        <p className="text-slate-500 font-medium mt-1">{getTodayString()}</p>
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
                  <CircularProgress value={persen} color="#1f7a3a" trackColor="#ddf1e2" />
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
                <Wallet className="text-emerald-600" size={20} /> Saldo Kas {thisYear}
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
