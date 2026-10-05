import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@fontsource-variable/lexend'
import '@fontsource-variable/source-sans-3'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient()

const root = document.getElementById('root')
if (!root) throw new Error('Elemen #root tidak ditemukan')

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
