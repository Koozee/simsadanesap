import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'

type ToastContextType = {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; id: number } | null>(null)

  const showToast = useCallback((message: string) => {
    const id = Date.now()
    setToast({ message, id })
    setTimeout(() => {
      setToast(current => current?.id === id ? null : current)
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-24 left-4 right-4 bg-slate-800 text-white px-4 py-3 rounded-[10px] shadow-[0_4px_16px_rgba(12,27,75,0.14)] z-[60] flex justify-center items-center animate-in fade-in slide-in-from-bottom-5 duration-200">
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
