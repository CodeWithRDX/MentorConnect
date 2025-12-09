import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

let toastId = 0;
const toasts = [];
const listeners = [];

export const toast = (message, type = 'default') => {
  const id = toastId++;
  const newToast = { id, message, type };
  toasts.push(newToast);
  listeners.forEach(listener => listener([...toasts]));
  
  setTimeout(() => {
    removeToast(id);
  }, 5000);
};

const removeToast = (id) => {
  const index = toasts.findIndex(t => t.id === id);
  if (index > -1) {
    toasts.splice(index, 1);
    listeners.forEach(listener => listener([...toasts]));
  }
};

export const Toaster = () => {
  const [toastList, setToastList] = useState([]);

  useEffect(() => {
    listeners.push(setToastList);
    return () => {
      const index = listeners.indexOf(setToastList);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toastList.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 rounded-lg border p-4 shadow-lg bg-white min-w-[300px]",
            toast.type === 'error' && "border-error-200 bg-error-50",
            toast.type === 'success' && "border-success-200 bg-success-50",
            toast.type === 'warning' && "border-warning-200 bg-warning-50"
          )}
        >
          <p className={cn(
            "flex-1 text-sm",
            toast.type === 'error' && "text-error-800",
            toast.type === 'success' && "text-success-800",
            toast.type === 'warning' && "text-warning-800"
          )}>
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

