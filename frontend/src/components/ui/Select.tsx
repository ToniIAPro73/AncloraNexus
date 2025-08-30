import React from 'react';

export interface SelectItem { id: string|number; label: React.ReactNode; icon?: React.ReactNode }
export const Select: React.FC<{ items: SelectItem[]; value: string|number|null; onChange: (v: string|number|null)=>void; label?: string; placeholder?: string; fullWidth?: boolean; className?: string }>
  = ({ items, value, onChange, label, placeholder='Seleccione.', fullWidth=false, className='' }) => (
    <div className={fullWidth?'w-full':''}>
      {label && <label className="block text-sm text-slate-300 mb-1">{label}</label>}
      <div className={`relative ${fullWidth?'w-full':''}`}>
        <select className={`w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-primary ${className}`}
          value={value===null?'':String(value)} onChange={(e)=>{ const v=e.target.value; onChange(v===''?null:v); }}>
          <option value="" disabled>{placeholder}</option>
          {items.map(it => <option key={it.id} value={String(it.id)}>{typeof it.label==='string'? it.label : ''}</option>)}
        </select>
      </div>
    </div>
  );

