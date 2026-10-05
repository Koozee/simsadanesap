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
        toastOptions={{
          classNames: {
            toast: 'font-sans shadow-floating rounded-btn border',
            success: 'bg-green-50 text-green-700 border-green-200',
            error: 'bg-danger-50 text-danger-700 border-danger-200',
            warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            info: 'bg-primary-50 text-primary-700 border-primary-200'
          }
        }}
      />
    </>
  )
}
