import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Search, Loader2 } from 'lucide-react'
import { toISODate, addDays, formatDateID, isSunday } from '../utils/date'
import { CalendarBottomSheet } from '../components/CalendarBottomSheet'
import { apiCall } from '../api/client'
import { useAbsenState } from '../hooks/useAbsenState'
import { toast } from 'sonner'
import { ConfirmModal } from '../components/ConfirmModal'
import { AbsensiRekap } from '../components/AbsensiRekap'
import type { Siswa, AbsenEntry, AbsenDay } from '../types/api-contract'

export default function AbsensiPage() {
  const [date, setDate] = useState(toISODate(new Date()))
  const [showCalendar, setShowCalendar] = useState(false)
  const [students, setStudents] = useState<Siswa[]>([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'S' | 'I' | 'A'>('S')
  const [viewTab, setViewTab] = useState<'harian' | 'rekap'>('harian')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [dayData, setDayData] = useState<AbsenDay | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showLiburConfirm, setShowLiburConfirm] = useState(false)

  const { entries, toggleStatus, getEntriesArray, setEntries } = useAbsenState()

  useEffect(() => {
    apiCall('students.list', {}, 'GET')
      .then((data) => {
        setStudents(data)
      })
      .catch((err) => console.error(err))
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true)
    apiCall('absensi.getDay', { date }, 'GET')
      .then((data) => {
        setDayData(data)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const map: Record<number, any> = {}
        if (data.entries) {
          data.entries.forEach((e: AbsenEntry) => {
            map[e.no] = e.status
          })
        }
        setEntries(map)
        setIsDirty(false)
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false))
  }, [date, setEntries])

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

  const handleToggle = (no: number) => {
    if (dayData?.libur || dayData?.sunday) return // Cannot edit if libur
    toggleStatus(no, activeTab)
    setIsDirty(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await apiCall('absensi.saveDay', { date, entries: getEntriesArray() }, 'POST')
      setIsDirty(false)

      // Update dayData (set recorded to true)
      setDayData((prev) => (prev ? { ...prev, recorded: true } : prev))

      const d = parseISODateLocal(date)
      toast.success(`Absensi ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} tersimpan`)
    } catch (err) {
      console.error(err)
      toast.error('Absensi belum tersimpan. Periksa koneksi, lalu coba lagi.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSetLibur = async (libur: boolean) => {
    try {
      await apiCall('absensi.setLibur', { date, libur }, 'POST')
      setDayData((prev) => (prev ? { ...prev, libur, recorded: libur, entries: [] } : prev))
      setEntries({}) // clear UI

      const d = parseISODateLocal(date)
      const dateStr = `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`
      if (libur) {
        toast.success(`${dateStr} ditandai libur`)
      } else {
        toast.success(`Libur dibatalkan untuk ${dateStr}`)
      }
    } catch (err) {
      console.error(err)
      toast.error('Gagal menyimpan pengaturan libur. Periksa koneksi.')
    }
  }

  const handleHapusClick = () => {
    setShowConfirm(true)
  }

  const handleHapusConfirm = async () => {
    setShowConfirm(false)
    try {
      await apiCall('absensi.clearDay', { date }, 'POST')
      setDayData((prev) => (prev ? { ...prev, recorded: false, libur: false, entries: [] } : prev))
      setEntries({})
      toast.success(`Data absensi dihapus`)
    } catch (err) {
      console.error(err)
      toast.error('Gagal menghapus absensi. Periksa koneksi.')
    }
  }

  const filteredStudents = useMemo(() => {
    if (!search) return students
    return students.filter((s) => s.nama.toLowerCase().includes(search.toLowerCase()))
  }, [students, search])

  let countH = students.length,
    countS = 0,
    countI = 0,
    countA = 0
  for (const s of students) {
    const status = entries[s.no] || 'H'
    if (status === 'S') {
      countS++
      countH--
    } else if (status === 'I') {
      countI++
      countH--
    } else if (status === 'A') {
      countA++
      countH--
    }
  }

  const isLiburMode = dayData?.libur || dayData?.sunday

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-slate-800">Absensi Kelas</h1>
        <p className="mt-1 font-medium text-slate-500">Kelola kehadiran siswa harian</p>
      </div>

      {/* Tab View */}
      <div className="flex rounded-xl bg-slate-100 p-1">
        <button
          onClick={() => setViewTab('harian')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${viewTab === 'harian' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
        >
          Harian
        </button>
        <button
          onClick={() => setViewTab('rekap')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${viewTab === 'rekap' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
        >
          Rekap
        </button>
      </div>

      {viewTab === 'rekap' ? (
        <AbsensiRekap />
      ) : (
        <>
          <div className="flex items-center justify-between rounded-[10px] border border-slate-200 bg-white p-2 shadow-sm">
            <button
              onClick={handlePrev}
              className="rounded-[10px] p-2 text-slate-600 active:bg-slate-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setShowCalendar(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-[10px] py-2 font-medium text-slate-800 active:bg-slate-50"
            >
              <CalendarIcon size={18} className="text-primary-600" />
              {formatDateID(date)}
            </button>
            <button
              onClick={handleNext}
              className="rounded-[10px] p-2 text-slate-600 active:bg-slate-100"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {!isLoading && dayData && (
            <>
              {dayData.sunday ? (
                <div className="bg-danger-50 border-danger-200 text-danger-700 rounded-[10px] border p-4">
                  <span className="mb-1 block font-semibold">Hari ini libur</span>
                  <span className="text-sm">Hari Minggu libur dan tidak bisa diabsen.</span>
                </div>
              ) : dayData.libur ? (
                <div className="bg-danger-50 border-danger-200 text-danger-700 flex items-center justify-between rounded-[10px] border p-4">
                  <div className="flex flex-col">
                    <span className="font-semibold">Hari ini libur</span>
                    <span className="text-sm">Tidak ada absensi.</span>
                  </div>
                  <button
                    onClick={() => handleSetLibur(false)}
                    className="text-danger-700 border-danger-200 active:bg-danger-50 rounded-lg border bg-white px-3 py-1.5 text-sm font-medium shadow-sm transition-colors"
                  >
                    Batalkan libur
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowLiburConfirm(true)}
                    className="flex-1 rounded-btn border border-orange-200 bg-orange-50 py-2 text-sm font-medium text-orange-700 shadow-sm transition-colors active:bg-orange-100"
                  >
                    Tandai Libur
                  </button>
                  {dayData.recorded && !isDirty && (
                    <button
                      onClick={handleHapusClick}
                      className="flex-1 rounded-btn border border-danger-600 bg-danger-600 py-2 text-sm font-medium text-white shadow-sm transition-colors active:bg-danger-700"
                    >
                      Hapus Absensi
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          <div
            className={`flex gap-2 transition-opacity ${isLiburMode ? 'pointer-events-none opacity-50' : ''}`}
          >
            <button
              onClick={() => setActiveTab('S')}
              className={`flex-1 rounded-[10px] py-2.5 font-medium transition-colors ${activeTab === 'S' ? 'bg-sick-solid text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600'}`}
            >
              Sakit{' '}
              {countS > 0 && (
                <span className="ml-1 rounded-md bg-white/20 px-1.5 py-0.5 text-xs">{countS}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('I')}
              className={`flex-1 rounded-[10px] py-2.5 font-medium transition-colors ${activeTab === 'I' ? 'bg-excused-solid text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600'}`}
            >
              Izin{' '}
              {countI > 0 && (
                <span className="ml-1 rounded-md bg-white/20 px-1.5 py-0.5 text-xs">{countI}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('A')}
              className={`flex-1 rounded-[10px] py-2.5 font-medium transition-colors ${activeTab === 'A' ? 'bg-absent-solid text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600'}`}
            >
              Alpha{' '}
              {countA > 0 && (
                <span className="ml-1 rounded-md bg-white/20 px-1.5 py-0.5 text-xs">{countA}</span>
              )}
            </button>
          </div>

          <div
            className={`relative transition-opacity ${isLiburMode ? 'pointer-events-none opacity-50' : ''}`}
          >
            <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama siswa"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus:border-primary-600 focus:ring-primary-600 w-full rounded-[10px] border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-slate-800 shadow-sm placeholder:text-slate-400 focus:ring-1 focus:outline-none"
            />
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-slate-500">Memuat data...</div>
          ) : (
            <div
              className={`divide-y divide-slate-300 overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm transition-opacity ${isLiburMode ? 'pointer-events-none opacity-50' : ''}`}
            >
              {filteredStudents.length === 0 ? (
                <div className="p-4 text-center text-slate-500">Tidak ada siswa ditemukan</div>
              ) : (
                filteredStudents.map((s) => {
                  const status = entries[s.no]

                  let badgeClass = ''
                  if (status === 'S') badgeClass = 'bg-sick-bg text-sick-fg'
                  else if (status === 'I') badgeClass = 'bg-excused-bg text-excused-fg'
                  else if (status === 'A') badgeClass = 'bg-absent-bg text-absent-fg'

                  return (
                    <button
                      key={s.no}
                      onClick={() => handleToggle(s.no)}
                      className="flex min-h-[56px] w-full items-center justify-between p-4 text-left transition-colors active:bg-slate-50"
                    >
                      <div className="flex items-center gap-3 pr-3">
                        <span className="font-tabular-nums shrink-0 text-slate-400">
                          {s.no}
                        </span>
                        <span className="font-medium text-slate-800">
                          {s.nama}
                        </span>
                      </div>
                      {status && status !== 'H' && (
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold ${badgeClass}`}
                        >
                          {status}
                        </div>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          )}

          {isDirty && (
            <div className="animate-in slide-in-from-bottom fixed right-0 bottom-[56px] left-0 z-[60] border-t border-slate-200 bg-white p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.1)]">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-medium text-slate-600">Ringkasan</span>
                <span className="font-heading text-primary-600 font-semibold">
                  Hadir {countH} dari {students.length}
                </span>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-primary-600 active:bg-primary-700 flex w-full items-center justify-center gap-2 rounded-[10px] py-3 font-semibold text-white transition-colors disabled:opacity-50"
              >
                {isSaving && <Loader2 size={18} className="animate-spin" />}
                Simpan absensi
              </button>
            </div>
          )}

          <CalendarBottomSheet
            isOpen={showCalendar}
            onClose={() => setShowCalendar(false)}
            selectedDate={date}
            onSelect={(d) => {
              setDate(d)
              setShowCalendar(false)
            }}
          />

          <ConfirmModal
            isOpen={showConfirm}
            title="Hapus Absensi"
            message={`Hapus absensi ${parseISODateLocal(date).getDate()} ${MONTH_NAMES[parseISODateLocal(date).getMonth()]}? Data di spreadsheet ikut terhapus.`}
            onConfirm={handleHapusConfirm}
            onCancel={() => setShowConfirm(false)}
          />

          <ConfirmModal
            isOpen={showLiburConfirm}
            title="Tandai Hari Libur"
            message={`Tandai ${parseISODateLocal(date).getDate()} ${MONTH_NAMES[parseISODateLocal(date).getMonth()]} sebagai libur? Seluruh data kehadiran pada hari ini akan dihapus.`}
            onConfirm={() => {
              setShowLiburConfirm(false)
              handleSetLibur(true)
            }}
            onCancel={() => setShowLiburConfirm(false)}
          />
        </>
      )}
    </div>
  )
}

// Helpers local to AbsensiPage
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
function parseISODateLocal(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}
