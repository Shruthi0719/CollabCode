import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

const toastVariants = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-blue-600 text-white',
  warning: 'bg-yellow-600 text-white',
};

export default function Toast() {
  const { toasts, removeToast } = useContext(ToastContext);

  return (
    <div className="fixed bottom-6 right-6 space-y-3 z-50 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto px-4 py-3 rounded-lg shadow-lg
            animate-in slide-in-from-right-5 fade-in
            ${toastVariants[toast.type]}
          `}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-lg leading-none opacity-70 hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
