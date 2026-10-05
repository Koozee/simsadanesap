import { useState, useEffect, useMemo, useCallback } from 'react'
import { apiCall } from '../api/client'
import { toast } from 'sonner'
import { Search, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Siswa, KasData, KasSummary } from '../types/api-contract'
import { KAS_PER_MINGGU, JUMLAH_MINGGU_KAS } from '../types/api-contract'
import { ConfirmModal } from '../components/ConfirmModal'

export default function KasPage() {
  const [year, setYear] = useState(2026)
  const [students, setStudents] = useState<Siswa[]>([])
  const [search, setSearch] = useState('')
  
  const [kasData, setKasData] = useState<KasData | null>(null)
  const [summary, setSummary] = useState<KasSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const [selectedNo, setSelectedNo] = useState<number | null>(null)
  const [showConfirmCancel, setShowConfirmCancel] = useState<{ week: number } | null>(null)
  const [showConfirmCreate, setShowConfirmCreate] = useState(false)

  // Fetch students
  useEffect(() => {
    apiCall('students.list', {}, 'GET')
      .then(setStudents)
      .catch(console.error)
  }, [])

  // Fetch kas data
  const loadData = useCallback(() => {
    setIsLoading(true)
    Promise.all([
      apiCall('kas.getData', { year }, 'GET'),
      apiCall('kas.summary', { year }, 'GET')
    ]).then(([sData, sSummary]) => {
      setKasData(sData)
      setSummary(sSummary)
    }).catch(err => {
      console.error(err)
      toast.error('Gagal memuat data kas')
    }).finally(() => setIsLoading(false))
  }, [year])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  const filteredStudents = useMemo(() => {
    if (!search) return students
    return students.filter(s => s.nama.toLowerCase().includes(search.toLowerCase()))
  }, [students, search])

  const handleQuickPay = async (no: number) => {
    const row = kasData?.rows.find(x => x.no === no)
    if (!row) return
    const nextUnpaid = row.weeks.findIndex(w => !w)
    if (nextUnpaid === -1) {
      toast.info('Siswa sudah lunas')
      return
    }

    // Optimistic update
    setKasData(prev => {
      if (!prev) return prev
      const newRows = [...prev.rows]
      const idx = newRows.findIndex(x => x.no === no)
      if (idx !== -1) {
        const newRow = { ...newRows[idx], weeks: [...newRows[idx].weeks] }
        newRow.weeks[nextUnpaid] = true
        newRow.total += KAS_PER_MINGGU
        newRows[idx] = newRow
      }
      return { ...prev, rows: newRows }
    })

    try {
      await apiCall('kas.pay', { year, no, count: 1 }, 'POST')
      loadData()
      toast.success(`Bayar minggu ${nextUnpaid + 1} tersimpan`)
    } catch (err) {
      console.error(err)
      toast.error('Gagal menyimpan kas')
      loadData() // revert
    }
  }

  const handleQuickMinus = async (no: number) => {
    const row = kasData?.rows.find(x => x.no === no)
    if (!row) return
    const lastPaid = row.weeks.lastIndexOf(true)
    if (lastPaid === -1) return

    setKasData(prev => {
      if (!prev) return prev
      const newRows = [...prev.rows]
      const idx = newRows.findIndex(x => x.no === no)
      if (idx !== -1) {
        const newRow = { ...newRows[idx], weeks: [...newRows[idx].weeks] }
        newRow.weeks[lastPaid] = false
        newRow.total -= KAS_PER_MINGGU
        newRows[idx] = newRow
      }
      return { ...prev, rows: newRows }
    })

    try {
      await apiCall('kas.setWeek', { year, no, week: lastPaid + 1, paid: false }, 'POST')
      loadData()
      toast.success(`Pembayaran minggu ${lastPaid + 1} dibatalkan`)
    } catch (err) {
      console.error(err)
      toast.error('Gagal membatalkan kas')
      loadData()
    }
  }

  const handleSetWeek = async (no: number, week: number, paid: boolean) => {
    // Optimistic update
    setKasData(prev => {
      if (!prev) return prev
      const newRows = [...prev.rows]
      const idx = newRows.findIndex(x => x.no === no)
      if (idx !== -1) {
        const newRow = { ...newRows[idx], weeks: [...newRows[idx].weeks] }
        newRow.weeks[week - 1] = paid
        newRow.total += (paid ? KAS_PER_MINGGU : -KAS_PER_MINGGU)
        newRows[idx] = newRow
      }
      return { ...prev, rows: newRows }
    })
    
    if (showConfirmCancel) setShowConfirmCancel(null)

    try {
      await apiCall('kas.setWeek', { year, no, week, paid }, 'POST')
      loadData()
      if (paid) toast.success(`Minggu ${week} dicentang`)
      else toast.success(`Minggu ${week} dibatalkan`)
    } catch (err) {
      console.error(err)
      toast.error('Gagal menyimpan perubahan minggu')
      loadData()
    }
  }

  const handleCreateYear = async () => {
    setShowConfirmCreate(false)
    try {
      await apiCall('kas.createYear', { year }, 'POST')
      toast.success(`Sheet Tahun ${year} berhasil dibuat`)
      loadData()
    } catch (err: unknown) {
      console.error(err)
      toast.error((err as Error).message || 'Gagal membuat sheet tahun baru')
    }
  }

  const formatRp = (num: number) => `Rp ${num.toLocaleString('id-ID')}`

  const selectedRow = kasData?.rows.find(x => x.no === selectedNo)
  const selectedStudent = students.find(x => x.no === selectedNo)

  return (
    <div className="flex flex-col gap-4 pb-24 relative">
      <div className="flex justify-between items-center bg-white p-2 rounded-[10px] shadow-sm border border-slate-200">
        <button onClick={() => setYear(y => y - 1)} className="p-2 text-slate-500 hover:text-slate-800 active:bg-slate-100 rounded-lg">
          <ChevronLeft size={20} />
        </button>
        <div className="font-judul font-semibold text-slate-800">
          Tahun {year}
        </div>
        <button onClick={() => setYear(y => y + 1)} className="p-2 text-slate-500 hover:text-slate-800 active:bg-slate-100 rounded-lg">
          <ChevronRight size={20} />
        </button>
      </div>

      {summary && kasData && kasData.sheetExists && (
        <div className="bg-white rounded-[10px] border border-slate-200 p-4 shadow-sm text-center">
          <div className="text-sm font-medium text-slate-500 mb-1">Saldo Kas</div>
          <div className="text-2xl font-judul font-semibold text-biru-600 mb-3">{formatRp(summary.saldo)}</div>
          <div className="flex gap-4 justify-center text-sm">
            <div className="flex gap-1 text-hadir-solid"><span className="text-slate-400">Masuk</span> {formatRp(summary.pemasukan)}</div>
            <div className="flex gap-1 text-merah-600"><span className="text-slate-400">Keluar</span> {formatRp(summary.pengeluaran)}</div>
          </div>
        </div>
      )}

      {kasData && !kasData.sheetExists && (
        <div className="bg-kuning-50 border border-kuning-200 p-6 rounded-[10px] text-center text-kuning-800 flex flex-col items-center">
          <h3 className="font-semibold mb-2">Tahun {year} Belum Ada</h3>
          <p className="text-sm mb-4">Buat lembar kas untuk Tahun {year} dari salinan Tahun {year - 1}? Semua centang akan dikosongkan.</p>
          <button onClick={() => setShowConfirmCreate(true)} className="bg-kuning-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm active:bg-kuning-700">
            Buat Tahun {year}
          </button>
        </div>
      )}

      {kasData && kasData.sheetExists && (
        <>
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

          <div className="bg-white rounded-[10px] border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
            {isLoading && !kasData.rows.length ? (
              <div className="p-8 text-center text-slate-400">Memuat data...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-4 text-center text-slate-500">Siswa tidak ditemukan</div>
            ) : (
              filteredStudents.map(s => {
                const row = kasData.rows.find(x => x.no === s.no)
                const paidCount = row ? row.weeks.filter(Boolean).length : 0
                return (
                  <div key={s.no} className="w-full text-left p-4 flex justify-between items-center active:bg-slate-50 transition-colors cursor-pointer min-h-[64px]" onClick={() => setSelectedNo(s.no)}>
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="text-slate-800 font-medium truncate mb-1">{s.nama}</div>
                      <div className="text-slate-500 text-xs">
                        <span className="font-tabular-nums">{paidCount}</span> dari {JUMLAH_MINGGU_KAS} minggu
                      </div>
                    </div>
                    {row && (
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-slate-700 font-tabular-nums mr-1">{formatRp(row.total)}</div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleQuickMinus(s.no) }}
                          disabled={paidCount === 0}
                          className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center active:bg-red-100 disabled:opacity-30 disabled:active:bg-red-50 transition-colors border border-red-100"
                        >
                          <Minus size={18} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleQuickPay(s.no) }}
                          disabled={paidCount === JUMLAH_MINGGU_KAS}
                          className="w-8 h-8 rounded-full bg-biru-50 text-biru-600 flex items-center justify-center active:bg-biru-100 disabled:opacity-30 disabled:active:bg-biru-50 transition-colors border border-biru-100"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </>
      )}

      {/* Bottom Sheet for Student Details */}
      {selectedNo !== null && selectedRow && selectedStudent && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setSelectedNo(null)} />
          <div className="relative bg-white rounded-t-[20px] shadow-[0_-8px_24px_rgba(0,0,0,0.12)] p-6 pt-5 animate-in slide-in-from-bottom flex flex-col gap-5 max-h-[90vh]">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-2" />
            
            <div>
              <h2 className="text-lg font-judul font-semibold text-slate-800 truncate">{selectedStudent.nama}</h2>
              <p className="text-slate-500 text-sm mt-1">Sudah bayar {selectedRow.weeks.filter(Boolean).length} dari {JUMLAH_MINGGU_KAS} minggu</p>
            </div>

            <div className="grid grid-cols-6 gap-3 overflow-y-auto pb-4">
              {selectedRow.weeks.map((paid, i) => {
                const weekNum = i + 1
                const isNext = !paid && selectedRow.weeks.slice(0, i).every(x => x)
                
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (paid) {
                        setShowConfirmCancel({ week: weekNum })
                      } else {
                        handleSetWeek(selectedNo, weekNum, true)
                      }
                    }}
                    className={`aspect-square rounded-full flex items-center justify-center text-sm font-semibold font-tabular-nums transition-all ${
                      paid ? 'bg-[#1F7A3A] text-white shadow-sm' : 
                      isNext ? 'bg-white border-2 border-emas-400 text-slate-800 shadow-sm' :
                      'bg-white border border-slate-200 text-slate-500'
                    }`}
                  >
                    {weekNum}
                  </button>
                )
              })}
            </div>

            {(() => {
              const nextUnpaid = selectedRow.weeks.findIndex(w => !w)
              if (nextUnpaid === -1) {
                return <button disabled className="w-full py-3.5 bg-slate-100 text-slate-400 font-semibold rounded-xl">Sudah Lunas</button>
              }
              return (
                <button 
                  onClick={() => handleQuickPay(selectedNo)}
                  className="w-full py-3.5 bg-biru-600 text-white font-semibold rounded-[10px] shadow-sm active:bg-biru-700 transition-colors"
                >
                  Catat bayar minggu {nextUnpaid + 1}
                </button>
              )
            })()}
          </div>
        </div>
      )}

      {/* Confirm Cancel Week Modal */}
      <ConfirmModal
        isOpen={showConfirmCancel !== null}
        title={`Batalkan Minggu ${showConfirmCancel?.week}?`}
        message="Ini akan menghapus tanda lunas dan mengurangi total saldo."
        onConfirm={() => {
          if (showConfirmCancel && selectedNo !== null) {
            handleSetWeek(selectedNo, showConfirmCancel.week, false)
          }
        }}
        onCancel={() => setShowConfirmCancel(null)}
      />

      <ConfirmModal
        isOpen={showConfirmCreate}
        title={`Buat Tahun ${year}?`}
        message={`Akan menyalin sheet Tahun ${year - 1} dan mengosongkan semua centangnya. Lanjutkan?`}
        onConfirm={handleCreateYear}
        onCancel={() => setShowConfirmCreate(false)}
      />
    </div>
  )
}
