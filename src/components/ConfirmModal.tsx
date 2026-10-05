import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Ya, simpan',
  cancelText = 'Batal',
  confirmBtnClass = 'bg-danger-600 active:bg-danger-700 text-white',
}: {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  confirmBtnClass?: string
}) {
  const [isConfirming, setIsConfirming] = useState(false)

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onConfirm()
    } finally {
      setIsConfirming(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4 duration-200">
      <div className="animate-in zoom-in-95 w-full max-w-sm rounded-[20px] bg-white p-6 shadow-xl duration-200">
        <h3 className="font-heading mb-2 text-lg font-bold text-slate-900">{title}</h3>
        <p className="mb-6 leading-relaxed text-slate-600">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isConfirming}
            className="cursor-pointer rounded-[10px] px-4 py-2 font-medium text-slate-600 transition-colors active:bg-slate-100 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-[10px] px-4 py-2 font-medium transition-colors disabled:opacity-50 ${confirmBtnClass}`}
          >
            {isConfirming && <Loader2 size={16} className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
