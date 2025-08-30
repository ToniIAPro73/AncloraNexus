import React, { useEffect, useRef, useState } from 'react';

export const Tooltip: React.FC<{ content: React.ReactNode; children: React.ReactNode; position?: 'top'|'right'|'bottom'|'left'; maxWidth?: string }>=({ content, children, position='top', maxWidth })=>{
  const [open,setOpen]=useState(false); const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{ const onDoc=(e:MouseEvent)=>{ if(ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown',onDoc); return ()=>document.removeEventListener('mousedown',onDoc);},[]);
  return (
    <div className="relative inline-block" ref={ref} onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}>
      {children}
      {open && (
        <div className={`absolute z-50 bg-slate-800 border border-slate-700 text-slate-200 text-xs px-2 py-1 rounded shadow whitespace-nowrap ${position==='top'? '-top-8 left-1/2 -translate-x-1/2': position==='bottom'? 'top-full mt-1 left-1/2 -translate-x-1/2': position==='right'? 'left-full ml-2 top-1/2 -translate-y-1/2': 'right-full mr-2 top-1/2 -translate-y-1/2'}`}
             style={{ maxWidth }}>{content}</div>
      )}
    </div>
  );
};

