import React, { useState, useEffect } from 'react';
import { apiService, formatFileSize } from '../services/api';
import { useAuth } from '../hooks/useAuth';

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

  const [filterType, setFilterType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    pages: 1,
    has_next: false,
    has_prev: false,
  });

  useEffect(() => {
    loadConversions(page);
  }, [page]);

  const loadConversions = async (pageParam = page) => {
    try {
      setIsLoading(true);
      const response = await apiService.getConversionHistory({
        page: pageParam,
        type: filterType || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        search: searchText || undefined,
      });
      setConversions(response.conversions);
      if (response.pagination) setPagination(response.pagination);
    } catch (error: any) {
      setError(error.message || 'Error cargando historial');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = () => {
    setPage(1);
    loadConversions(1);
  };

  const typeOptions = Array.from(new Set(conversions.map(c => c.conversion_type)));

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
        <h1 className="text-h1 font-bold text-white mb-2">
          ðŸ“‹ Historial de Conversiones
        </h1>
        <p className="text-slate-300">
          Todas tus conversiones realizadas
        </p>
      </div>

      {/* EstadÃ­sticas */}
      {user && (
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">{user.total_conversions || 0}</div>
              <div className="text-slate-400">Total Conversiones</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{user.credits || 0}</div>
              <div className="text-slate-400">CrÃ©ditos Disponibles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{user.credits_used_this_month || 0}</div>
              <div className="text-slate-400">CrÃ©ditos Usados Este Mes</div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="px-3 py-2 rounded bg-slate-700/50 text-white"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded bg-slate-700/50 text-white"
          >
            <option value="">Todos los tipos</option>
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type.toUpperCase()}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 rounded bg-slate-700/50 text-white"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 rounded bg-slate-700/50 text-white"
          />
        </div>
        <div className="mt-4 text-right">
          <button
            onClick={handleFilter}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Aplicar filtros
          </button>
        </div>
      </div>

      {/* Lista de conversiones */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {conversions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4 opacity-50">ðŸ“</div>
            <p className="text-slate-400 mb-4">No hay conversiones aÃºn</p>
            <p className="text-slate-500 text-sm">
              Cuando realices tu primera conversiÃ³n, aparecerÃ¡ aquÃ­
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversions.map((conversion) => (
              <div 
                key={conversion.id}
                className="flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-600/40 rounded-lg transition-colors border border-slate-700/30"
              >
                {/* Lado izquierdo - InformaciÃ³n del archivo */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-blue-400 text-xl">
                      {conversion.target_format === 'pdf' ? 'ðŸ“„' : 
                       conversion.target_format === 'html' ? 'ðŸŒ' : 
                       conversion.target_format === 'jpg' ? 'ðŸ–¼ï¸' : 'ðŸ“'}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-white font-medium">
                      {conversion.original_filename}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {conversion.original_format.toUpperCase()} â†’ {conversion.target_format.toUpperCase()} â€¢ 
                      {formatFileSize(conversion.file_size)} â€¢ 
                      {conversion.credits_used} crÃ©ditos
                    </p>
                    <p className="text-slate-500 text-xs">
                      {formatDate(conversion.created_at)}
                      {conversion.processing_time && ` â€¢ ${conversion.processing_time.toFixed(1)}s`}
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

        {/* PaginaciÃ³n */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-6">
            <button
              onClick={() => pagination.has_prev && setPage(page - 1)}
              disabled={!pagination.has_prev}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-slate-300">
              PÃ¡gina {page} de {pagination.pages}
            </span>
            <button
              onClick={() => pagination.has_next && setPage(page + 1)}
              disabled={!pagination.has_next}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}

        {/* BotÃ³n de actualizar */}
        <div className="mt-6 text-center">
          <button
            onClick={() => loadConversions(page)}
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

