import { useState, useEffect } from 'react'
import { apiCall } from '../api/client'
import { CircularProgress } from './CircularProgress'
import type { Siswa, AbsenSummary } from '../types/api-contract'
import { toast } from 'sonner'

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

function formatMonth(iso: string) {
  const [y, m] = iso.split('-').map(Number)
  return `${MONTH_NAMES[m - 1]} ${y}`
}

export function AbsensiRekap() {
  const today = new Date()
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  
  const [fromMonth, setFromMonth] = useState(currentMonthStr)
  const [toMonth, setToMonth] = useState(currentMonthStr)
  const [selectedNo, setSelectedNo] = useState<string>('semua')
  
  const [students, setStudents] = useState<Siswa[]>([])
  const [summary, setSummary] = useState<AbsenSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    apiCall('students.list', {}, 'GET')
      .then(data => setStudents(data))
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true)
    const params: { from: string; to: string; no?: number } = { from: fromMonth, to: toMonth }
    if (selectedNo !== 'semua') {
      params.no = parseInt(selectedNo, 10)
    }
    
    apiCall('absensi.summary', params, 'GET')
      .then(data => setSummary(data))
      .catch(err => {
        console.error(err)
        toast.error('Gagal memuat rekap absensi')
      })
      .finally(() => setIsLoading(false))
  }, [fromMonth, toMonth, selectedNo])

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-[10px] p-4 shadow-sm flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Dari Bulan</label>
            <input 
              type="month" 
              value={fromMonth}
              onChange={e => setFromMonth(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 w-full focus:outline-none focus:ring-1 focus:ring-biru-600"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Sampai Bulan</label>
            <input 
              type="month" 
              value={toMonth}
              onChange={e => setToMonth(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 w-full focus:outline-none focus:ring-1 focus:ring-biru-600"
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Pilih Siswa</label>
          <select 
            value={selectedNo}
            onChange={e => setSelectedNo(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 w-full focus:outline-none focus:ring-1 focus:ring-biru-600"
          >
            <option value="semua">Semua Siswa</option>
            {students.map(s => (
              <option key={s.no} value={s.no}>{s.no} - {s.nama}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-slate-500">Memuat rekap...</div>
      ) : summary ? (
        <>
          {summary.skippedMonths.length > 0 && (
            <div className="bg-kuning-50 border border-kuning-200 rounded-[10px] p-3 text-kuning-800 text-sm">
              <span className="font-semibold block mb-1">Catatan:</span>
              Bulan berikut dilewati karena belum ada datanya: {summary.skippedMonths.map(formatMonth).join(', ')}
            </div>
          )}

          {selectedNo === 'semua' ? (
            <div className="bg-white rounded-[10px] border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
              {summary.perSiswa.map(rekap => {
                const s = students.find(x => x.no === rekap.no)
                return (
                  <div key={rekap.no} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-slate-400 font-tabular-nums text-sm">{rekap.no}</span>
                        <span className="font-medium text-slate-800 truncate">{s?.nama}</span>
                      </div>
                      <div className="flex gap-3 text-xs">
                        <span className="text-biru-600 font-medium">S: {rekap.sakit}</span>
                        <span className="text-kuning-600 font-medium">I: {rekap.izin}</span>
                        <span className="text-merah-600 font-medium">A: {rekap.alpha}</span>
                        <span className="text-slate-500">H: {rekap.hadir}</span>
                      </div>
                    </div>
                    <CircularProgress percent={rekap.persen} size={56} strokeWidth={6} />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="bg-white border border-slate-200 rounded-[10px] p-6 shadow-sm flex flex-col items-center text-center">
                <CircularProgress percent={summary.perSiswa[0]?.persen || 0} size={96} strokeWidth={10} />
                <h3 className="font-judul font-semibold text-lg text-slate-800 mt-4">
                  {students.find(x => x.no.toString() === selectedNo)?.nama}
                </h3>
                <div className="flex gap-4 mt-4 bg-slate-50 px-4 py-2 rounded-lg text-sm">
                  <div className="flex flex-col items-center"><span className="font-bold text-biru-600">{summary.perSiswa[0]?.sakit || 0}</span><span className="text-slate-500 text-xs">Sakit</span></div>
                  <div className="flex flex-col items-center"><span className="font-bold text-kuning-600">{summary.perSiswa[0]?.izin || 0}</span><span className="text-slate-500 text-xs">Izin</span></div>
                  <div className="flex flex-col items-center"><span className="font-bold text-merah-600">{summary.perSiswa[0]?.alpha || 0}</span><span className="text-slate-500 text-xs">Alpha</span></div>
                  <div className="flex flex-col items-center"><span className="font-bold text-slate-700">{summary.perSiswa[0]?.hadir || 0}</span><span className="text-slate-500 text-xs">Hadir</span></div>
                </div>
              </div>

              <div className="bg-white rounded-[10px] border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                <div className="p-3 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Rincian per Bulan
                </div>
                {summary.perBulan?.map(pb => (
                  <div key={pb.month} className="p-4 flex items-center justify-between">
                    <span className="font-medium text-slate-700">{formatMonth(pb.month)}</span>
                    <div className="flex gap-3 text-sm">
                      {pb.rekap.sakit > 0 && <span className="text-biru-600">S:{pb.rekap.sakit}</span>}
                      {pb.rekap.izin > 0 && <span className="text-kuning-600">I:{pb.rekap.izin}</span>}
                      {pb.rekap.alpha > 0 && <span className="text-merah-600">A:{pb.rekap.alpha}</span>}
                      <span className="text-slate-500">H:{pb.rekap.hadir}</span>
                    </div>
                  </div>
                ))}
                {(!summary.perBulan || summary.perBulan.length === 0) && (
                  <div className="p-4 text-center text-slate-500 text-sm">Belum ada data di rentang ini.</div>
                )}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
