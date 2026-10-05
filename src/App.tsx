import { Routes, Route } from 'react-router'
import { Toaster } from 'sonner'
import { Layout } from './components/Layout'
import AbsensiPage from './pages/Absensi'
import KasPage from './pages/Kas'
import PengeluaranPage from './pages/Pengeluaran'
import NilaiPage from './pages/Nilai'

function BerandaPage() {
  return (
    <div>
      <h1 className="font-judul font-semibold text-2xl mb-4">Beranda</h1>
      <p className="text-slate-600">Halaman kosong.</p>
    </div>
  )
}

// Removed empty NilaiPage since it's imported now


export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<BerandaPage />} />
          <Route path="/absensi" element={<AbsensiPage />} />
          <Route path="/nilai" element={<NilaiPage />} />
          <Route path="/kas" element={<KasPage />} />
          <Route path="/kas/pengeluaran" element={<PengeluaranPage />} />
        </Route>
      </Routes>
      <Toaster 
        position="bottom-center" 
        toastOptions={{ 
          className: 'font-sans shadow-[0_4px_16px_rgba(12,27,75,0.14)] rounded-[10px]' 
        }} 
      />
    </>
  )
}
