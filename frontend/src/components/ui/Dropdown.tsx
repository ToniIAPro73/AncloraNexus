import React, { useEffect, useRef, useState } from 'react';

export interface DropdownItem { id: string|number; label: React.ReactNode; icon?: React.ReactNode; disabled?: boolean; onClick?: () => void }
export const Dropdown: React.FC<{ trigger: React.ReactNode; items: DropdownItem[]; align?: 'left'|'right'; className?: string; menuClassName?: string; withDividers?: boolean }>
  = ({ trigger, items, align='left', className='', menuClassName='', withDividers=false }) => {
    const [open,setOpen]=useState(false); const ref=useRef<HTMLDivElement>(null);
    useEffect(()=>{ const onDoc=(e:MouseEvent)=>{ if(ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown',onDoc); return ()=>document.removeEventListener('mousedown',onDoc);},[]);
    return (
      <div className={`relative inline-block text-left ${className}`} ref={ref}>
        <div onClick={()=>setOpen(!open)} className="cursor-pointer">{trigger}</div>
        {open && (
          <div className={`absolute z-10 mt-2 origin-top-right rounded-md bg-slate-800 border border-slate-700 shadow-lg min-w-[12rem] ${align==='left'?'left-0':'right-0'} ${menuClassName}`}>
            <div className="py-1">
              {items.map((item, idx) => (
                <React.Fragment key={item.id}>
                  <div onClick={()=>{ if(!item.disabled){ item.onClick?.(); setOpen(false);} }} className={`flex items-center px-4 py-2 text-sm ${item.disabled?'text-slate-500 cursor-not-allowed':'text-slate-200 hover:bg-slate-700 cursor-pointer'}`}>
                    {item.icon && <span className="mr-2">{item.icon}</span>}<span className="flex-grow">{item.label}</span>
                  </div>
                  {withDividers && idx < items.length-1 && <div className="border-t border-slate-700 my-1" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

