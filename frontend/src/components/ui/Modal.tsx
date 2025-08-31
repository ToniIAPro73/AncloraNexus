import React, { useEffect, useRef, useState } from 'react';
import { Button } from './button';

interface ModalProps {
  isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode; size?: 'sm'|'md'|'lg'|'xl'|'full'
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size='md' }) => {
  const [closing, setClosing] = useState(false); const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{ if(!isOpen) return; const onKey=(e:KeyboardEvent)=>{ if(e.key==='Escape') handleClose();}; document.addEventListener('keydown',onKey); return ()=>document.removeEventListener('keydown',onKey);},[isOpen]);
  const handleClose=()=>{ setClosing(true); setTimeout(()=>{ setClosing(false); onClose(); },200); };
  if(!isOpen && !closing) return null;
  const sizes={sm:'max-w-md',md:'max-w-lg',lg:'max-w-2xl',xl:'max-w-4xl',full:'max-w-full m-5'};
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm ${closing?'opacity-0':'opacity-100'}`} onClick={(e)=>{ if(ref.current && !ref.current.contains(e.target as Node)) handleClose(); }}>
      <div ref={ref} className={`${sizes[size]} w-full bg-slate-800 border border-slate-700 shadow-xl rounded-lg transition-all ${closing?'scale-95 opacity-0':'scale-100 opacity-100'}`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700"><h3 className="text-lg font-medium text-white">{title}</h3><button className="text-slate-400 hover:text-white" onClick={handleClose}>Ã—</button></div>
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-10rem)]">{children}</div>
        {footer && <div className="p-4 border-t border-slate-700 flex justify-end space-x-2">{footer}</div>}
      </div>
    </div>
  );
};

export const ConfirmModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: React.ReactNode; confirmText?: string; cancelText?: string; confirmVariant?: 'primary'|'danger'; isLoading?: boolean }>
  = ({ isOpen, onClose, onConfirm, title, message, confirmText='Confirmar', cancelText='Cancelar', confirmVariant='primary', isLoading=false }) => (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={
      <>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>{cancelText}</Button>
        <Button variant={confirmVariant} onClick={onConfirm} isLoading={isLoading}>{confirmText}</Button>
      </>
    }>
      <div className="py-2">{message}</div>
    </Modal>
  );


