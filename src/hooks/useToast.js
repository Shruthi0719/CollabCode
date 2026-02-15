import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return {
    success: (msg) => context.addToast(msg, 'success'),
    error: (msg) => context.addToast(msg, 'error', 5000),
    info: (msg) => context.addToast(msg, 'info'),
    warning: (msg) => context.addToast(msg, 'warning'),
  };
}
