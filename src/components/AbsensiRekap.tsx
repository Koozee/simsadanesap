import { useState, useEffect } from 'react'
import { apiCall } from '../api/client'
import { CircularProgress } from './CircularProgress'
import type { Siswa, AbsenSummary } from '../types/api-contract'
import { toast } from 'sonner'

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
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
      .then((data) => setStudents(data))
      .catch((err) => console.error(err))
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true)
    const params: { from: string; to: string; no?: number } = { from: fromMonth, to: toMonth }
    if (selectedNo !== 'semua') {
      params.no = parseInt(selectedNo, 10)
    }

    apiCall('absensi.summary', params, 'GET')
      .then((data) => setSummary(data))
      .catch((err) => {
        console.error(err)
        toast.error('Gagal memuat rekap absensi')
      })
      .finally(() => setIsLoading(false))
  }, [fromMonth, toMonth, selectedNo])

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Dari Bulan</label>
            <input
              type="month"
              value={fromMonth}
              onChange={(e) => setFromMonth(e.target.value)}
              className="focus:ring-primary-600 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:ring-1 focus:outline-none"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Sampai Bulan</label>
            <input
              type="month"
              value={toMonth}
              onChange={(e) => setToMonth(e.target.value)}
              className="focus:ring-primary-600 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:ring-1 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Pilih Siswa</label>
          <select
            value={selectedNo}
            onChange={(e) => setSelectedNo(e.target.value)}
            className="focus:ring-primary-600 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:ring-1 focus:outline-none"
          >
            <option value="semua">Semua Siswa</option>
            {students.map((s) => (
              <option key={s.no} value={s.no}>
                {s.no} - {s.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-slate-500">Memuat rekap...</div>
      ) : summary ? (
        <>
          {summary.skippedMonths.length > 0 && (
            <div className="bg-kuning-50 border-kuning-200 text-kuning-800 rounded-[10px] border p-3 text-sm">
              <span className="mb-1 block font-semibold">Catatan:</span>
              Bulan berikut dilewati karena belum ada datanya:{' '}
              {summary.skippedMonths.map(formatMonth).join(', ')}
            </div>
          )}

          {selectedNo === 'semua' ? (
            <div className="divide-y divide-slate-300 overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm">
              {summary.perSiswa.map((rekap) => {
                const s = students.find((x) => x.no === rekap.no)
                return (
                  <div key={rekap.no} className="flex items-center justify-between gap-4 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-start gap-3">
                        <span className="font-tabular-nums text-sm text-slate-400 mt-0.5">{rekap.no}</span>
                        <span className="font-medium text-slate-800">{s?.nama}</span>
                      </div>
                      <div className="flex gap-3 text-xs">
                        <span className="text-primary-600 font-medium">S: {rekap.sakit}</span>
                        <span className="text-kuning-600 font-medium">I: {rekap.izin}</span>
                        <span className="text-danger-600 font-medium">A: {rekap.alpha}</span>
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
              <div className="flex flex-col items-center rounded-[10px] border border-slate-200 bg-white p-6 text-center shadow-sm">
                <CircularProgress
                  percent={summary.perSiswa[0]?.persen || 0}
                  size={96}
                  strokeWidth={10}
                />
                <h3 className="font-heading mt-4 text-lg font-semibold text-slate-800">
                  {students.find((x) => x.no.toString() === selectedNo)?.nama}
                </h3>
                <div className="mt-4 flex gap-4 rounded-lg bg-slate-50 px-4 py-2 text-sm">
                  <div className="flex flex-col items-center">
                    <span className="text-primary-600 font-bold">
                      {summary.perSiswa[0]?.sakit || 0}
                    </span>
                    <span className="text-xs text-slate-500">Sakit</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-kuning-600 font-bold">
                      {summary.perSiswa[0]?.izin || 0}
                    </span>
                    <span className="text-xs text-slate-500">Izin</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-danger-600 font-bold">
                      {summary.perSiswa[0]?.alpha || 0}
                    </span>
                    <span className="text-xs text-slate-500">Alpha</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-slate-700">
                      {summary.perSiswa[0]?.hadir || 0}
                    </span>
                    <span className="text-xs text-slate-500">Hadir</span>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-300 overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm">
                <div className="bg-slate-50 p-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Rincian per Bulan
                </div>
                {summary.perBulan?.map((pb) => (
                  <div key={pb.month} className="flex items-center justify-between p-4">
                    <span className="font-medium text-slate-700">{formatMonth(pb.month)}</span>
                    <div className="flex gap-3 text-sm">
                      {pb.rekap.sakit > 0 && (
                        <span className="text-primary-600">S:{pb.rekap.sakit}</span>
                      )}
                      {pb.rekap.izin > 0 && (
                        <span className="text-kuning-600">I:{pb.rekap.izin}</span>
                      )}
                      {pb.rekap.alpha > 0 && (
                        <span className="text-danger-600">A:{pb.rekap.alpha}</span>
                      )}
                      <span className="text-slate-500">H:{pb.rekap.hadir}</span>
                    </div>
                  </div>
                ))}
                {(!summary.perBulan || summary.perBulan.length === 0) && (
                  <div className="p-4 text-center text-sm text-slate-500">
                    Belum ada data di rentang ini.
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
