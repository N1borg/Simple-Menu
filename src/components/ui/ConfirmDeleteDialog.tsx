import { AlertCircle } from 'lucide-react'
import React from 'react'

interface ConfirmDeleteDialogProps {
  open: boolean
  title?: string
  message?: string
  onCancel: () => void
  onConfirm: () => void
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  title = 'Confirmer la suppression',
  message = 'Supprimer cet élément ? Cette action est irréversible.',
  onCancel,
  onConfirm,
  confirmLabel = 'Supprimer',
  cancelLabel = 'Annuler',
  loading = false,
}) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50" onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs mx-auto relative flex flex-col items-center">
        <AlertCircle className="h-10 w-10 text-yellow-500 mb-2" />
        <p className="text-base font-semibold text-gray-800 mb-1">{title}</p>
        <p className="text-sm text-gray-600 mb-4 text-center">{message}</p>
        <div className="flex gap-3 w-full">
          <button
            type="button"
            className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
            onClick={onCancel}
            disabled={loading}
          >{cancelLabel}</button>
          <button
            type="button"
            className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            onClick={onConfirm}
            disabled={loading}
          >{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteDialog
