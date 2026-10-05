import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { apiCall } from '../api/client'
import { toast } from 'sonner'
import { ChevronLeft, Plus, Trash2, Edit3, Loader2 } from 'lucide-react'
import type { Pengeluaran } from '../types/api-contract'

export default function PengeluaranPage() {
  const navigate = useNavigate()
  const [expenses, setExpenses] = useState<Pengeluaran[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Pengeluaran | null>(null)

  const [jumlah, setJumlah] = useState('')
  const [keterangan, setKeterangan] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const loadData = () => {
    setIsLoading(true)
    apiCall('kas.expenses.list', {}, 'GET')
      .then(setExpenses)
      .catch(() => toast.error('Gagal memuat pengeluaran'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [])

  const handleSave = async () => {
    if (!jumlah || !keterangan) return toast.error('Isi semua field')

    setIsSaving(true)
    try {
      const numJumlah = Number(jumlah)
      if (editItem) {
        await apiCall('kas.expenses.update', { ...editItem, jumlah: numJumlah, keterangan }, 'POST')
        toast.success('Pengeluaran diubah')
      } else {
        await apiCall(
          'kas.expenses.add',
          {
            tanggal: new Date().toISOString().split('T')[0],
            jumlah: numJumlah,
            keterangan,
          },
          'POST',
        )
        toast.success('Pengeluaran ditambahkan')
      }
      setShowModal(false)
      loadData()
    } catch (err: unknown) {
      toast.error((err as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus pengeluaran ini?')) return

    try {
      await apiCall('kas.expenses.delete', { id }, 'POST')
      toast.success('Berhasil dihapus')
      loadData()
    } catch (err: unknown) {
      toast.error((err as Error).message)
    }
  }

  const openAdd = () => {
    setEditItem(null)
    setJumlah('')
    setKeterangan('')
    setShowModal(true)
  }

  const openEdit = (item: Pengeluaran) => {
    setEditItem(item)
    setJumlah(item.jumlah.toString())
    setKeterangan(item.keterangan)
    setShowModal(true)
  }

  const formatRp = (n: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(n)

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div className="flex items-center gap-3 rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="-ml-2 rounded-lg p-2 text-slate-500 hover:text-slate-800"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-heading text-lg font-semibold text-slate-800">Catatan Pengeluaran</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 text-slate-500">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center rounded-[10px] border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
            <span className="text-2xl">💸</span>
          </div>
          <h3 className="mb-1 font-semibold text-slate-700">Belum ada pengeluaran</h3>
          <p className="mb-4 text-sm">Catat pengeluaran kas kelas di sini</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-300 overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm">
          {expenses.map((e) => (
            <div key={e.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
              <div>
                <div className="font-medium text-slate-800">{e.keterangan}</div>
                <div className="text-xs text-slate-500">{e.tanggal}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-semibold text-red-600">{formatRp(e.jumlah)}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(e)}
                    className="hover:text-primary-600 rounded-lg p-2 text-slate-400 active:bg-slate-100"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="rounded-lg p-2 text-slate-400 hover:text-red-600 active:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={openAdd}
        className="bg-primary-600 active:bg-primary-700 fixed right-4 bottom-20 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105"
      >
        <Plus size={24} />
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="animate-in fade-in zoom-in-95 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-heading mb-4 text-lg font-semibold text-slate-800">
              {editItem ? 'Ubah Pengeluaran' : 'Tambah Pengeluaran'}
            </h3>

            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Jumlah (Rp)</label>
                <input
                  type="number"
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  placeholder="Misal: 50000"
                  className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:ring-1"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Keterangan</label>
                <input
                  type="text"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Misal: Beli sapu"
                  className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:ring-1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg px-4 py-2 font-medium text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-primary-600 active:bg-primary-700 flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white disabled:opacity-50"
              >
                {isSaving && <Loader2 className="animate-spin" size={16} />}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
