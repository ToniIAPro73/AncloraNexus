import React, { createContext, useContext, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export interface Toast { id: string; type?: ToastType; title: string; message?: string; action?: { label: string; onClick: () => void }; duration?: number }

const ToastCtx = createContext({
  showToast: (_t: Omit<Toast,'id'>) => {},
  hideToast: (_id: string) => {},
});

export const useToast = () => useContext(ToastCtx);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = (t: Omit<Toast,'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, ...t }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 3000);
  };
  const hideToast = (id: string) => setToasts(prev => prev.filter(x => x.id !== id));
  return (
    <ToastCtx.Provider value={{ showToast, hideToast }}>
      {children}
      <div className="fixed right-4 bottom-4 space-y-2 z-50">
        {toasts.map(t => (
          <div key={t.id} className={`px-3 py-2 rounded border text-sm ${t.type==='success'?'bg-green-600/20 border-green-600 text-green-200':t.type==='error'?'bg-red-600/20 border-red-600 text-red-200':t.type==='warning'?'bg-amber-600/20 border-amber-600 text-amber-200':'bg-slate-700/50 border-slate-600 text-slate-200'}`}>
            <div className="font-medium">{t.title}</div>
            {t.message && <div className="text-xs opacity-80">{t.message}</div>}
            {t.action && (
              <button className="mt-1 text-xs underline" onClick={t.action.onClick}>{t.action.label}</button>
            )}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};

