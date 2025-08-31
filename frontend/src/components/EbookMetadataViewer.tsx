import React, { useState } from 'react';
import { IconEbook, IconSettings, IconCheck, IconX, IconUser, IconCalendar, IconGlobe } from './Icons';
import { EbookMetadata, EbookValidationResult } from '../types/ebook';

interface EbookMetadataViewerProps {
  metadata?: EbookMetadata;
  validationResult?: EbookValidationResult;
  editable?: boolean;
  onMetadataChange?: (metadata: EbookMetadata) => void;
  className?: string;
}

export const EbookMetadataViewer: React.FC<EbookMetadataViewerProps> = ({
  metadata,
  validationResult,
  editable = false,
  onMetadataChange,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<EbookMetadata>(metadata || {});

  const handleSave = () => {
    onMetadataChange?.(data);
    setIsEditing(false);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
        <h3 className="text-h3 font-semibold flex items-center" style={{ color: 'var(--color-neutral-900)', gap: 'var(--space-1)' }}>
          <IconEbook className="w-5 h-5 text-primary" />
          InformaciÃ³n del E-book
        </h3>
        {editable && (
          isEditing ? (
            <div className="flex" style={{ gap: 'var(--space-1)' }}>
              <button onClick={handleSave} className="px-3 py-1 rounded text-sm font-medium" style={{ backgroundColor: 'var(--color-success)', color: 'var(--color-neutral-100)' }}>Guardar</button>
              <button onClick={() => { setData(metadata || {}); setIsEditing(false); }} className="px-3 py-1 rounded text-sm font-medium" style={{ backgroundColor: 'var(--color-neutral-200)', color: 'var(--color-neutral-900)' }}>Cancelar</button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="px-3 py-1 rounded text-sm font-medium flex items-center" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-neutral-100)', gap: '4px' }}>
              <IconSettings className="w-4 h-4" />
              Editar
            </button>
          )
        )}
      </div>

      {validationResult && (
        <div className="rounded-lg p-3 mb-4 cursor-pointer" style={{ backgroundColor: validationResult.valid ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)' }}>
          <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
            {validationResult.valid ? <IconCheck className="w-4 h-4 text-green-600" /> : <IconX className="w-4 h-4 text-red-600" />}
            <span className="font-medium" style={{ color: validationResult.valid ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {validationResult.valid ? 'Archivo vÃ¡lido' : 'Problemas detectados'}
            </span>
          </div>
          {validationResult.errors && validationResult.errors.length > 0 && (
            <ul style={{ fontSize: '11px', color: 'var(--color-neutral-900)', opacity: '0.8', marginTop: '6px' }}>
              {validationResult.errors.map((e, i) => <li key={i}>â€¢ {e}</li>)}
            </ul>
          )}
        </div>
      )}

      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--color-neutral-100)', border: `1px solid var(--color-neutral-200)` }}>
          <h4 className="text-h4 font-semibold mb-4" style={{ color: 'var(--color-neutral-900)' }}>InformaciÃ³n bÃ¡sica</h4>
          <Field label="TÃ­tulo" icon={<IconEbook className="w-4 h-4 text-primary" />} value={data.title} onChange={(v) => setData({ ...data, title: v })} editing={isEditing} />
          <Field label="Autor" icon={<IconUser className="w-4 h-4 text-primary" />} value={data.author} onChange={(v) => setData({ ...data, author: v })} editing={isEditing} />
          <Field label="DescripciÃ³n" value={data.description} onChange={(v) => setData({ ...data, description: v })} editing={isEditing} />
          <Field label="Formato" value={data.format?.toUpperCase()} editing={false} />
        </div>

        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--color-neutral-100)', border: `1px solid var(--color-neutral-200)` }}>
          <h4 className="text-h4 font-semibold mb-4" style={{ color: 'var(--color-neutral-900)' }}>Detalles de publicaciÃ³n</h4>
          <Field label="Editorial" value={data.publisher} onChange={(v) => setData({ ...data, publisher: v })} editing={isEditing} />
          <Field label="Fecha de publicaciÃ³n" icon={<IconCalendar className="w-4 h-4 text-primary" />} value={data.publishDate} onChange={(v) => setData({ ...data, publishDate: v })} editing={isEditing} />
          <Field label="ISBN" value={data.isbn} onChange={(v) => setData({ ...data, isbn: v })} editing={isEditing} />
          <Field label="Idioma" icon={<IconGlobe className="w-4 h-4 text-primary" />} value={data.language} onChange={(v) => setData({ ...data, language: v })} editing={isEditing} />
        </div>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; value?: string | number; icon?: React.ReactNode; editing: boolean; onChange?: (v: string) => void; }> = ({ label, value, icon, editing, onChange }) => (
  <div style={{ marginBottom: 'var(--space-3)' }}>
    <div className="flex items-center" style={{ marginBottom: 'var(--space-1)', gap: 'var(--space-1)' }}>
      {icon}
      <label className="font-medium" style={{ fontSize: '14px', color: 'var(--color-neutral-900)' }}>{label}</label>
    </div>
    {editing && onChange ? (
      <input type="text" value={value?.toString() || ''} onChange={(e) => onChange(e.target.value)} className="w-full rounded border" style={{ padding: 'var(--space-1)', borderColor: 'var(--color-neutral-200)', fontSize: '14px' }} />
    ) : (
      <p style={{ fontSize: '14px', color: value ? 'var(--color-neutral-900)' : 'var(--color-neutral-900)', opacity: value ? '1' : '0.5', fontStyle: value ? 'normal' : 'italic' }}>{value?.toString() || 'No especificado'}</p>
    )}
  </div>
);


