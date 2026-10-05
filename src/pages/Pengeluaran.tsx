import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
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
        await apiCall('kas.expenses.add', { 
          tanggal: new Date().toISOString().split('T')[0], 
          jumlah: numJumlah, 
          keterangan 
        }, 'POST')
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

  const formatRp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div className="flex items-center gap-3 bg-white p-4 rounded-[10px] shadow-sm border border-slate-200">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 hover:text-slate-800 rounded-lg">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-judul font-semibold text-lg text-slate-800">Catatan Pengeluaran</h1>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-20 text-slate-500">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : expenses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[10px] p-8 text-center text-slate-500 shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">💸</span>
          </div>
          <h3 className="font-semibold text-slate-700 mb-1">Belum ada pengeluaran</h3>
          <p className="text-sm mb-4">Catat pengeluaran kas kelas di sini</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[10px] shadow-sm overflow-hidden divide-y divide-slate-100">
          {expenses.map(e => (
            <div key={e.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
              <div>
                <div className="font-medium text-slate-800">{e.keterangan}</div>
                <div className="text-xs text-slate-500">{e.tanggal}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-semibold text-red-600">{formatRp(e.jumlah)}</div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(e)} className="p-2 text-slate-400 hover:text-biru-600 active:bg-slate-100 rounded-lg"><Edit3 size={16} /></button>
                  <button onClick={() => handleDelete(e.id)} className="p-2 text-slate-400 hover:text-red-600 active:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button onClick={openAdd} className="fixed bottom-20 right-4 w-14 h-14 bg-biru-600 text-white rounded-full flex items-center justify-center shadow-lg active:bg-biru-700 hover:scale-105 transition-transform">
        <Plus size={24} />
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="font-judul font-semibold text-lg text-slate-800 mb-4">
              {editItem ? 'Ubah Pengeluaran' : 'Tambah Pengeluaran'}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah (Rp)</label>
                <input 
                  type="number" 
                  value={jumlah}
                  onChange={e => setJumlah(e.target.value)}
                  placeholder="Misal: 50000"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-1 focus:ring-biru-500 focus:border-biru-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan</label>
                <input 
                  type="text" 
                  value={keterangan}
                  onChange={e => setKeterangan(e.target.value)}
                  placeholder="Misal: Beli sapu"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-1 focus:ring-biru-500 focus:border-biru-500 outline-none"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg"
              >
                Batal
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-biru-600 text-white font-medium rounded-lg active:bg-biru-700 flex items-center gap-2 disabled:opacity-50"
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
