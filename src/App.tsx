import { Routes, Route } from 'react-router'
import { Layout } from './components/Layout'
import AbsensiPage from './pages/Absensi'

function BerandaPage() {
  return (
    <div>
      <h1 className="font-judul font-semibold text-2xl mb-4">Beranda</h1>
      <p className="text-slate-600">Halaman kosong.</p>
    </div>
  )
}

function NilaiPage() {
  return (
    <div>
      <h1 className="font-judul font-semibold text-2xl mb-4">Nilai</h1>
      <p className="text-slate-600">Halaman kosong.</p>
    </div>
  )
}

function KasPage() {
  return (
    <div>
      <h1 className="font-judul font-semibold text-2xl mb-4">Kas</h1>
      <p className="text-slate-600">Halaman kosong.</p>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<BerandaPage />} />
        <Route path="/absensi" element={<AbsensiPage />} />
        <Route path="/nilai" element={<NilaiPage />} />
        <Route path="/kas" element={<KasPage />} />
      </Route>
    </Routes>
  )
}
