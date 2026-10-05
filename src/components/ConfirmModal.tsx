export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Ya, hapus',
  cancelText = 'Batal',
}: {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
}) {
  if (!isOpen) return null

  return (
    <div className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4 duration-200">
      <div className="animate-in zoom-in-95 w-full max-w-sm rounded-[20px] bg-white p-6 shadow-xl duration-200">
        <h3 className="font-heading mb-2 text-lg font-bold text-slate-900">{title}</h3>
        <p className="mb-6 leading-relaxed text-slate-600">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-[10px] px-4 py-2 font-medium text-slate-600 transition-colors active:bg-slate-100"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-[10px] bg-red-600 px-4 py-2 font-medium text-white transition-colors active:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
