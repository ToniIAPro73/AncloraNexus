import React, { useEffect, useState } from 'react';

interface TabItem { id: string; label: React.ReactNode; content: React.ReactNode; disabled?: boolean; icon?: React.ReactNode; badge?: React.ReactNode }
interface TabsProps { items: TabItem[]; defaultTab?: string; onChange?: (id: string) => void; className?: string; variant?: string }

export const Tabs: React.FC<TabsProps> = ({ items, defaultTab, onChange, className = '' }) => {
  const [active, setActive] = useState('');
  useEffect(() => {
    setActive(defaultTab || items.find(i => !i.disabled)?.id || '');
  }, [defaultTab, items]);
  const change = (id: string) => { setActive(id); onChange?.(id); };
  return (
    <div className={className}>
      <div className="flex border-b border-slate-700">
        {items.map(i => (
          <button key={i.id} disabled={i.disabled} onClick={() => !i.disabled && change(i.id)} className={`px-4 py-2 -mb-px border-b-2 ${active===i.id?'border-primary text-white':'border-transparent text-slate-400 hover:text-slate-300'}`}>
            {i.icon && <span className="mr-2">{i.icon}</span>}{i.label}{i.badge && <span className="ml-2">{i.badge}</span>}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {items.map(i => (
          <div key={i.id} className={active===i.id? 'block':'hidden'}>{i.content}</div>
        ))}
      </div>
    </div>
  );
};

export interface TabsCompositionProps { children: React.ReactNode; value: string; onChange: (v: string) => void; className?: string; variant?: string }
export interface TabProps { children: React.ReactNode; value: string; label: React.ReactNode; icon?: React.ReactNode; disabled?: boolean; badge?: React.ReactNode }

export const TabsComposition: React.FC<TabsCompositionProps> & { Tab: React.FC<TabProps> } = ({ children, value, onChange, className='' }) => {
  const tabs = React.Children.toArray(children) as React.ReactElement<TabProps>[];
  return (
    <div className={className}>
      <div className="flex border-b border-slate-700">
        {tabs.map(t => (
          <button key={t.props.value} disabled={t.props.disabled} onClick={() => !t.props.disabled && onChange(t.props.value)} className={`px-4 py-2 -mb-px border-b-2 ${value===t.props.value?'border-primary text-white':'border-transparent text-slate-400 hover:text-slate-300'}`}>
            {t.props.icon && <span className="mr-2">{t.props.icon}</span>}{t.props.label}{t.props.badge && <span className="ml-2">{t.props.badge}</span>}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs.map(t => (
          <div key={t.props.value} className={value===t.props.value? 'block':'hidden'}>{t.props.children}</div>
        ))}
      </div>
    </div>
  );
};

TabsComposition.Tab = ({ children }: TabProps) => <>{children}</>;
TabsComposition.Tab.displayName = 'Tab';

