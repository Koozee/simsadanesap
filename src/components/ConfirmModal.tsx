export function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Ya, hapus',
  cancelText = 'Batal'
}: { 
  isOpen: boolean; 
  title: string; 
  message: string; 
  onConfirm: () => void; 
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[20px] w-full max-w-sm p-6 shadow-xl animate-in zoom-in-95 duration-200">
        <h3 className="font-judul text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 font-medium text-slate-600 active:bg-slate-100 rounded-[10px] transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 font-medium text-white bg-red-600 active:bg-red-700 rounded-[10px] transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
