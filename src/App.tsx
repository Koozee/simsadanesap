import { Routes, Route } from 'react-router'
import { Toaster } from 'sonner'
import { Layout } from './components/Layout'
import AbsensiPage from './pages/Absensi'
import KasPage from './pages/Kas'
import PengeluaranPage from './pages/Pengeluaran'
import NilaiPage from './pages/Nilai'
import BerandaPage from './pages/Beranda'

// Removed inline BerandaPage component

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
        position="top-center"
        richColors
        toastOptions={{
          className: 'font-sans shadow-floating rounded-btn',
        }}
      />
    </>
  )
}
