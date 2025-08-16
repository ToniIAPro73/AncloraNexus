import React, { useState } from 'react';
import { IconEbook, IconUser, IconCalendar, IconGlobe, IconSettings, IconCheck, IconX } from './Icons';
import { EbookMetadata, EbookValidationResult } from '../types/ebook';

interface EbookMetadataViewerProps {
  metadata?: EbookMetadata;
  validationResult?: EbookValidationResult;
  editable?: boolean;
  onMetadataChange?: (metadata: EbookMetadata) => void;
  className?: string;
}

interface EditableMetadata extends EbookMetadata {
  [key: string]: any;
}

export const EbookMetadataViewer: React.FC<EbookMetadataViewerProps> = ({
  metadata,
  validationResult,
  editable = false,
  onMetadataChange,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<EditableMetadata>(metadata || {} as EditableMetadata);
  const [showValidation, setShowValidation] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditableData(metadata || {} as EditableMetadata);
  };

  const handleSave = () => {
    if (onMetadataChange) {
      onMetadataChange(editableData);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditableData(metadata || {} as EditableMetadata);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditableData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Desconocido';
    const mb = bytes / (1024 * 1024);
    return mb > 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch {
      return dateString;
    }
  };

  const getValidationIcon = (isValid: boolean) => {
    return isValid ? (
      <IconCheck className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
    ) : (
      <IconX className="w-4 h-4" style={{ color: 'var(--color-danger)' }} />
    );
  };

  const MetadataField: React.FC<{
    label: string;
    value?: string | number;
    field?: string;
    type?: 'text' | 'number' | 'date';
    icon?: React.ReactNode;
    required?: boolean;
  }> = ({ label, value, field, type = 'text', icon, required = false }) => {
    const displayValue = value?.toString() || 'No especificado';
    
    return (
      <div style={{ marginBottom: 'var(--space-3)' }}>
        <div className="flex items-center" style={{ marginBottom: 'var(--space-1)', gap: 'var(--space-1)' }}>
          {icon}
          <label 
            className="font-medium"
            style={{ 
              fontSize: '14px',
              color: 'var(--color-neutral-900)'
            }}
          >
            {label}
            {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
          </label>
        </div>
        
        {isEditing && field ? (
          <input
            type={type}
            value={editableData[field] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full rounded border transition-colors"
            style={{
              padding: 'var(--space-1)',
              borderColor: 'var(--color-neutral-200)',
              fontSize: '14px'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-neutral-200)'}
          />
        ) : (
          <p 
            style={{ 
              fontSize: '14px',
              color: value ? 'var(--color-neutral-900)' : 'var(--color-neutral-900)',
              opacity: value ? '1' : '0.5',
              fontStyle: value ? 'normal' : 'italic'
            }}
          >
            {displayValue}
          </p>
        )}
      </div>
    );
  };

  if (!metadata && !validationResult) {
    return (
      <div 
        className={`text-center p-8 rounded-lg ${className}`}
        style={{ 
          backgroundColor: 'var(--color-neutral-200)',
          border: `1px solid var(--color-neutral-200)`
        }}
      >
        <IconEbook 
          className="w-12 h-12 mx-auto mb-4" 
          style={{ color: 'var(--color-neutral-900)', opacity: '0.3' }}
        />
        <p style={{ color: 'var(--color-neutral-900)', opacity: '0.6' }}>
          No hay metadatos disponibles
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
        <h3
          className="text-h3 font-semibold flex items-center"
          style={{
            color: 'var(--color-neutral-900)',
            gap: 'var(--space-1)'
          }}
        >
          <IconEbook className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          Información del E-book
        </h3>
        
        {editable && (
          <div className="flex" style={{ gap: 'var(--space-1)' }}>
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-3 py-1 rounded text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--color-success)',
                    color: 'var(--color-neutral-100)'
                  }}
                >
                  Guardar
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 rounded text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--color-neutral-200)',
                    color: 'var(--color-neutral-900)'
                  }}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="px-3 py-1 rounded text-sm font-medium transition-colors flex items-center"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-neutral-100)',
                  gap: '4px'
                }}
              >
                <IconSettings className="w-4 h-4" />
                Editar
              </button>
            )}
          </div>
        )}
      </div>

      {/* Validation Status */}
      {validationResult && (
        <div 
          className="rounded-lg p-3 mb-4 cursor-pointer transition-colors"
          style={{ 
            backgroundColor: validationResult.isValid ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
            border: `1px solid ${validationResult.isValid ? 'var(--color-success)' : 'var(--color-danger)'}`
          }}
          onClick={() => setShowValidation(!showValidation)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
              {getValidationIcon(validationResult.isValid)}
              <span 
                className="font-medium"
                style={{ 
                  color: validationResult.isValid ? 'var(--color-success)' : 'var(--color-danger)'
                }}
              >
                {validationResult.isValid ? 'Archivo válido' : 'Problemas detectados'}
              </span>
            </div>
            <span 
              className="text-xs"
              style={{ color: 'var(--color-neutral-900)', opacity: '0.6' }}
            >
              {showValidation ? 'Ocultar' : 'Ver detalles'}
            </span>
          </div>
          
          {showValidation && (
            <div style={{ marginTop: 'var(--space-2)' }}>
              {validationResult.errors.length > 0 && (
                <div style={{ marginBottom: 'var(--space-2)' }}>
                  <p 
                    className="font-medium"
                    style={{ 
                      fontSize: '12px',
                      color: 'var(--color-danger)',
                      marginBottom: '4px'
                    }}
                  >
                    Errores:
                  </p>
                  <ul style={{ fontSize: '11px', color: 'var(--color-neutral-900)', opacity: '0.8' }}>
                    {validationResult.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {validationResult.warnings.length > 0 && (
                <div>
                  <p 
                    className="font-medium"
                    style={{ 
                      fontSize: '12px',
                      color: 'var(--color-warning)',
                      marginBottom: '4px'
                    }}
                  >
                    Advertencias:
                  </p>
                  <ul style={{ fontSize: '11px', color: 'var(--color-neutral-900)', opacity: '0.8' }}>
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Metadata Grid */}
      <div 
        className="grid gap-6"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
      >
        {/* Basic Information */}
        <div 
          className="rounded-lg p-4"
          style={{ 
            backgroundColor: 'var(--color-neutral-100)',
            border: `1px solid var(--color-neutral-200)`
          }}
        >
          <h4
            className="text-h4 font-semibold mb-4"
            style={{
              color: 'var(--color-neutral-900)'
            }}
          >
            Información básica
          </h4>
          
          <MetadataField
            label="Título"
            value={metadata?.title}
            field="title"
            icon={<IconEbook className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />}
            required
          />
          
          <MetadataField
            label="Autor"
            value={metadata?.author}
            field="author"
            icon={<IconUser className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />}
          />
          
          <MetadataField
            label="Descripción"
            value={metadata?.description}
            field="description"
          />
          
          <MetadataField
            label="Formato"
            value={metadata?.format?.toUpperCase()}
          />
        </div>

        {/* Publication Details */}
        <div 
          className="rounded-lg p-4"
          style={{ 
            backgroundColor: 'var(--color-neutral-100)',
            border: `1px solid var(--color-neutral-200)`
          }}
        >
          <h4
            className="text-h4 font-semibold mb-4"
            style={{
              color: 'var(--color-neutral-900)'
            }}
          >
            Detalles de publicación
          </h4>
          
          <MetadataField
            label="Editorial"
            value={metadata?.publisher}
            field="publisher"
          />
          
          <MetadataField
            label="Fecha de publicación"
            value={formatDate(metadata?.publishDate)}
            field="publishDate"
            type="date"
            icon={<IconCalendar className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />}
          />
          
          <MetadataField
            label="ISBN"
            value={metadata?.isbn}
            field="isbn"
          />
          
          <MetadataField
            label="Idioma"
            value={metadata?.language}
            field="language"
            icon={<IconGlobe className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />}
          />
        </div>

        {/* Technical Information */}
        <div 
          className="rounded-lg p-4"
          style={{ 
            backgroundColor: 'var(--color-neutral-100)',
            border: `1px solid var(--color-neutral-200)`
          }}
        >
          <h4
            className="text-h4 font-semibold mb-4"
            style={{
              color: 'var(--color-neutral-900)'
            }}
          >
            Información técnica
          </h4>
          
          <MetadataField
            label="Tamaño del archivo"
            value={formatFileSize(metadata?.fileSize)}
          />
          
          <MetadataField
            label="Número de páginas"
            value={metadata?.pageCount}
            field="pageCount"
            type="number"
          />
          
          {validationResult?.fileInfo && (
            <>
              <MetadataField
                label="Última modificación"
                value={validationResult.fileInfo.lastModified.toLocaleDateString('es-ES')}
              />
              
              {validationResult.fileInfo.encoding && (
                <MetadataField
                  label="Codificación"
                  value={validationResult.fileInfo.encoding}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Cover Image Preview */}
      {metadata?.coverImage && (
        <div 
          className="mt-6 rounded-lg p-4"
          style={{ 
            backgroundColor: 'var(--color-neutral-100)',
            border: `1px solid var(--color-neutral-200)`
          }}
        >
          <h4
            className="text-h4 font-semibold mb-4"
            style={{
              color: 'var(--color-neutral-900)'
            }}
          >
            Portada
          </h4>
          <div className="flex justify-center">
            <img
              src={metadata.coverImage}
              alt="Portada del libro"
              className="max-w-xs max-h-64 rounded shadow-sm"
              style={{ border: `1px solid var(--color-neutral-200)` }}
            />
          </div>
        </div>
      )}

      {/* Quality Score */}
      {validationResult && (
        <div 
          className="mt-6 rounded-lg p-4"
          style={{ 
            backgroundColor: 'var(--color-neutral-100)',
            border: `1px solid var(--color-neutral-200)`
          }}
        >
          <h4
            className="text-h4 font-semibold mb-4"
            style={{
              color: 'var(--color-neutral-900)'
            }}
          >
            Estado del archivo
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p 
                className="font-medium"
                style={{ 
                  fontSize: '14px',
                  color: 'var(--color-neutral-900)',
                  marginBottom: '4px'
                }}
              >
                Formato detectado
              </p>
              <p 
                className="uppercase font-bold"
                style={{ 
                  fontSize: '16px',
                  color: 'var(--color-primary)'
                }}
              >
                {validationResult.format}
              </p>
            </div>
            
            <div>
              <p 
                className="font-medium"
                style={{ 
                  fontSize: '14px',
                  color: 'var(--color-neutral-900)',
                  marginBottom: '4px'
                }}
              >
                Estado
              </p>
              <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
                {getValidationIcon(validationResult.isValid)}
                <span 
                  className="font-medium"
                  style={{ 
                    color: validationResult.isValid ? 'var(--color-success)' : 'var(--color-danger)'
                  }}
                >
                  {validationResult.isValid ? 'Válido' : 'Con errores'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

