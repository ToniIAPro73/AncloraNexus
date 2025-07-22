import React, { useState, useEffect } from 'react';
import { apiService, formatFileSize } from '../services/api';
import { useAuth } from '../auth/AuthContext';

interface Conversion {
  id: number;
  original_filename: string;
  original_format: string;
  target_format: string;
  file_size: number;
  conversion_type: string;
  credits_used: number;
  processing_time?: number;
  status: string;
  error_message?: string;
  output_filename?: string;
  created_at: string;
  completed_at?: string;
}

export const ConversionHistory: React.FC = () => {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadConversions();
  }, []);

  const loadConversions = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getConversionHistory();
      setConversions(response.conversions);
    } catch (error: any) {
      setError(error.message || 'Error cargando historial');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (conversionId: number, filename: string) => {
    try {
      const blob = await apiService.downloadConversion(conversionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      alert('Error descargando archivo: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'pending': return 'Procesando';
      case 'failed': return 'Error';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-slate-300">Cargando historial...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          📋 Historial de Conversiones
        </h1>
        <p className="text-slate-300">
          Todas tus conversiones realizadas
        </p>
      </div>

      {/* Estadísticas */}
      {user && (
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">{user.total_conversions}</div>
              <div className="text-slate-400">Total Conversiones</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{user.credits}</div>
              <div className="text-slate-400">Créditos Disponibles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{user.credits_used_this_month}</div>
              <div className="text-slate-400">Créditos Usados Este Mes</div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de conversiones */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {conversions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4 opacity-50">📁</div>
            <p className="text-slate-400 mb-4">No hay conversiones aún</p>
            <p className="text-slate-500 text-sm">
              Cuando realices tu primera conversión, aparecerá aquí
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversions.map((conversion) => (
              <div 
                key={conversion.id}
                className="flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-600/40 rounded-lg transition-colors border border-slate-700/30"
              >
                {/* Lado izquierdo - Información del archivo */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-blue-400 text-xl">
                      {conversion.target_format === 'pdf' ? '📄' : 
                       conversion.target_format === 'html' ? '🌐' : 
                       conversion.target_format === 'jpg' ? '🖼️' : '📝'}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-white font-medium">
                      {conversion.original_filename}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {conversion.original_format.toUpperCase()} → {conversion.target_format.toUpperCase()} • 
                      {formatFileSize(conversion.file_size)} • 
                      {conversion.credits_used} créditos
                    </p>
                    <p className="text-slate-500 text-xs">
                      {formatDate(conversion.created_at)}
                      {conversion.processing_time && ` • ${conversion.processing_time.toFixed(1)}s`}
                    </p>
                  </div>
                </div>

                {/* Lado derecho - Estado y acciones */}
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className={`text-sm font-medium ${getStatusColor(conversion.status)}`}>
                      {getStatusLabel(conversion.status)}
                    </span>
                    {conversion.error_message && (
                      <p className="text-red-400 text-xs mt-1">
                        {conversion.error_message}
                      </p>
                    )}
                  </div>

                  {conversion.status === 'completed' && conversion.output_filename && (
                    <button
                      onClick={() => handleDownload(conversion.id, conversion.output_filename!)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Descargar
                    </button>
                  )}

                  {conversion.status === 'pending' && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botón de actualizar */}
        <div className="mt-6 text-center">
          <button
            onClick={loadConversions}
            disabled={isLoading}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>
    </div>
  );
};

