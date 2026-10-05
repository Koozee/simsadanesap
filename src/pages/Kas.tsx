import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router'
import { apiCall } from '../api/client'
import { toast } from 'sonner'
import { Search, Plus, Minus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import type { Siswa, KasData, KasSummary } from '../types/api-contract'
import { KAS_PER_MINGGU, JUMLAH_MINGGU_KAS } from '../types/api-contract'
import { ConfirmModal } from '../components/ConfirmModal'

export default function KasPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const yearParam = searchParams.get('tahun')
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear()

  const setYear = (action: React.SetStateAction<number>) => {
    const nextYear = typeof action === 'function' ? action(year) : action
    setSearchParams({ tahun: nextYear.toString() })
  }

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
    apiCall('students.list', {}, 'GET').then(setStudents).catch(console.error)
  }, [])

  const loadData = useCallback(() => {
    setIsLoading(true)
    Promise.all([apiCall('kas.getData', { year }, 'GET'), apiCall('kas.summary', { year }, 'GET')])
      .then(([sData, sSummary]) => {
        setKasData(sData)
        setSummary(sSummary)
      })
      .catch((err) => {
        console.error(err)
        toast.error('Gagal memuat data kas')
      })
      .finally(() => setIsLoading(false))
  }, [year])

  useEffect(() => {
    // Clear existing data when year changes to show loading UI
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setKasData(null)
    setSummary(null)
    loadData()
  }, [loadData])

  const filteredStudents = useMemo(() => {
    if (!search) return students
    return students.filter((s) => s.nama.toLowerCase().includes(search.toLowerCase()))
  }, [students, search])

  const handleQuickPay = async (no: number) => {
    const row = kasData?.rows.find((x) => x.no === no)
    if (!row) return
    const nextUnpaid = row.weeks.findIndex((w) => !w)
    if (nextUnpaid === -1) {
      toast.info('Siswa sudah lunas')
      return
    }

    // Optimistic update
    setKasData((prev) => {
      if (!prev) return prev
      const newRows = [...prev.rows]
      const idx = newRows.findIndex((x) => x.no === no)
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
    const row = kasData?.rows.find((x) => x.no === no)
    if (!row) return
    const lastPaid = row.weeks.lastIndexOf(true)
    if (lastPaid === -1) return

    setKasData((prev) => {
      if (!prev) return prev
      const newRows = [...prev.rows]
      const idx = newRows.findIndex((x) => x.no === no)
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
    setKasData((prev) => {
      if (!prev) return prev
      const newRows = [...prev.rows]
      const idx = newRows.findIndex((x) => x.no === no)
      if (idx !== -1) {
        const newRow = { ...newRows[idx], weeks: [...newRows[idx].weeks] }
        newRow.weeks[week - 1] = paid
        newRow.total += paid ? KAS_PER_MINGGU : -KAS_PER_MINGGU
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

  const selectedRow = kasData?.rows.find((x) => x.no === selectedNo)
  const selectedStudent = students.find((x) => x.no === selectedNo)

  return (
    <div className="relative flex flex-col gap-6 pb-24">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-slate-800">Uang Kas</h1>
        <p className="mt-1 font-medium text-slate-500">Kelola iuran dan saldo kelas</p>
      </div>

      <div className="flex items-center justify-between rounded-[10px] border border-slate-200 bg-white p-2 shadow-sm">
        <button
          onClick={() => setYear((y) => y - 1)}
          disabled={isLoading}
          className="rounded-lg p-2 text-slate-500 hover:text-slate-800 active:bg-slate-100 disabled:opacity-50"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="font-heading flex items-center gap-2 font-semibold text-slate-800">
          Tahun {year}
        </div>
        <button
          onClick={() => setYear((y) => y + 1)}
          disabled={isLoading}
          className="rounded-lg p-2 text-slate-500 hover:text-slate-800 active:bg-slate-100 disabled:opacity-50"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {!kasData ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="text-primary-500 mb-4 animate-spin" size={36} />
          <p className="font-medium">Memuat data Tahun {year}...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {summary && kasData.sheetExists && (
            <div className="rounded-[10px] border border-slate-200 bg-white p-4 text-center shadow-sm">
              <div className="mb-1 text-sm font-medium text-slate-500">Saldo Kas</div>
              <div className="font-heading text-primary-600 mb-3 text-2xl font-semibold">
                {formatRp(summary.saldo)}
              </div>
              <div className="flex justify-center gap-4 text-sm">
                <div className="text-present-solid flex gap-1">
                  <span className="text-slate-400">Masuk</span> {formatRp(summary.pemasukan)}
                </div>
                <div className="flex gap-1 text-red-600">
                  <span className="text-slate-400">Keluar</span> {formatRp(summary.pengeluaran)}
                </div>
              </div>
              <Link
                to="/kas/pengeluaran"
                className="text-primary-600 mt-3 block text-sm font-medium hover:underline"
              >
                Kelola Pengeluaran &rarr;
              </Link>
            </div>
          )}

          {!kasData.sheetExists && (
            <div className="flex flex-col items-center rounded-[10px] border border-yellow-200 bg-yellow-50 p-6 text-center text-yellow-800">
              <h3 className="mb-2 font-semibold">Tahun {year} Belum Ada</h3>
              <p className="mb-4 text-sm">
                Buat lembar kas untuk Tahun {year} dari salinan Tahun {year - 1}? Semua centang akan
                dikosongkan.
              </p>
              <button
                onClick={() => setShowConfirmCreate(true)}
                className="rounded-lg bg-yellow-600 px-4 py-2 font-medium text-white shadow-sm active:bg-yellow-700"
              >
                Buat Tahun {year}
              </button>
            </div>
          )}

          {kasData.sheetExists && (
            <>
              <div className="relative">
                <Search
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Cari nama siswa"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="focus:border-primary-600 focus:ring-primary-600 w-full rounded-[10px] border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-slate-800 shadow-sm placeholder:text-slate-400 focus:ring-1 focus:outline-none"
                />
              </div>

              <div className="divide-y divide-slate-100 overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm">
                {filteredStudents.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">Siswa tidak ditemukan</div>
                ) : (
                  filteredStudents.map((s) => {
                    const row = kasData.rows.find((x) => x.no === s.no)
                    const paidCount = row ? row.weeks.filter(Boolean).length : 0
                    return (
                      <div
                        key={s.no}
                        className="flex min-h-[64px] w-full cursor-pointer items-center justify-between p-4 text-left transition-colors active:bg-slate-50"
                        onClick={() => setSelectedNo(s.no)}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="mb-1 truncate font-medium text-slate-800">{s.nama}</div>
                          <div className="text-xs text-slate-500">
                            <span className="font-tabular-nums">{paidCount}</span> dari{' '}
                            {JUMLAH_MINGGU_KAS} minggu
                          </div>
                        </div>
                        {row && (
                          <div className="flex items-center gap-2">
                            <div className="font-tabular-nums mr-1 font-medium text-slate-700">
                              {formatRp(row.total)}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleQuickMinus(s.no)
                              }}
                              disabled={paidCount === 0}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600 transition-colors active:bg-red-100 disabled:opacity-30 disabled:active:bg-red-50"
                            >
                              <Minus size={18} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleQuickPay(s.no)
                              }}
                              disabled={paidCount === JUMLAH_MINGGU_KAS}
                              className="bg-primary-50 text-primary-600 active:bg-primary-100 disabled:active:bg-primary-50 border-primary-100 flex h-8 w-8 items-center justify-center rounded-full border transition-colors disabled:opacity-30"
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
        </div>
      )}

      {/* Bottom Sheet for Student Details */}
      {selectedNo !== null && selectedRow && selectedStudent && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setSelectedNo(null)} />
          <div className="animate-in slide-in-from-bottom relative flex max-h-[90vh] flex-col gap-5 rounded-t-[20px] bg-white p-6 pt-5 shadow-[0_-8px_24px_rgba(0,0,0,0.12)]">
            <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-slate-200" />

            <div>
              <h2 className="font-heading truncate text-lg font-semibold text-slate-800">
                {selectedStudent.nama}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Sudah bayar {selectedRow.weeks.filter(Boolean).length} dari {JUMLAH_MINGGU_KAS}{' '}
                minggu
              </p>
            </div>

            <div className="grid grid-cols-6 gap-3 overflow-y-auto pb-4">
              {selectedRow.weeks.map((paid, i) => {
                const weekNum = i + 1
                const isNext = !paid && selectedRow.weeks.slice(0, i).every((x) => x)

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
                    className={`font-tabular-nums flex aspect-square items-center justify-center rounded-full text-sm font-semibold transition-all ${
                      paid
                        ? 'bg-[#1F7A3A] text-white shadow-sm'
                        : isNext
                          ? 'border-gold-400 border-2 bg-white text-slate-800 shadow-sm'
                          : 'border border-slate-200 bg-white text-slate-500'
                    }`}
                  >
                    {weekNum}
                  </button>
                )
              })}
            </div>

            {(() => {
              const nextUnpaid = selectedRow.weeks.findIndex((w) => !w)
              if (nextUnpaid === -1) {
                return (
                  <button
                    disabled
                    className="w-full rounded-xl bg-slate-100 py-3.5 font-semibold text-slate-400"
                  >
                    Sudah Lunas
                  </button>
                )
              }
              return (
                <button
                  onClick={() => handleQuickPay(selectedNo)}
                  className="bg-primary-600 active:bg-primary-700 w-full rounded-[10px] py-3.5 font-semibold text-white shadow-sm transition-colors"
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
