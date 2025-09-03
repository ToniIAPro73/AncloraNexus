import React, { useState, useMemo } from 'react';
import { Search, FileText, Image, Book, Layers, Settings, ChevronRight } from 'lucide-react';

interface FormatOption {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  popular?: boolean;
}

interface FormatSelectorProps {
  availableFormats: string[];
  selectedFormat: string;
  onFormatSelect: (format: string) => void;
  sourceFormat: string;
  className?: string;
  showHeader?: boolean;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  availableFormats,
  selectedFormat,
  onFormatSelect,
  sourceFormat,
  className = '',
  showHeader = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Definición completa de formatos con categorías
  const formatDefinitions: Record<string, FormatOption> = {
    // Documentos
    'pdf': { id: 'pdf', name: 'PDF', description: 'Documento Portátil', category: 'Document', icon: '📄', popular: true },
    'docx': { id: 'docx', name: 'DOCX', description: 'Microsoft Word', category: 'Document', icon: '📝', popular: true },
    'doc': { id: 'doc', name: 'DOC', description: 'Word Legacy', category: 'Document', icon: '📝' },
    'txt': { id: 'txt', name: 'TXT', description: 'Texto Plano', category: 'Document', icon: '📄' },
    'html': { id: 'html', name: 'HTML', description: 'Página Web', category: 'Document', icon: '🌐', popular: true },
    'md': { id: 'md', name: 'MD', description: 'Markdown', category: 'Document', icon: '📝' },
    'rtf': { id: 'rtf', name: 'RTF', description: 'Texto Enriquecido', category: 'Document', icon: '📝' },
    'odt': { id: 'odt', name: 'ODT', description: 'OpenDocument', category: 'Document', icon: '📄' },
    
    // Imágenes
    'jpg': { id: 'jpg', name: 'JPG', description: 'Imagen JPEG', category: 'Image', icon: '🖼️', popular: true },
    'png': { id: 'png', name: 'PNG', description: 'Imagen PNG', category: 'Image', icon: '🖼️', popular: true },
    'gif': { id: 'gif', name: 'GIF', description: 'Imagen Animada', category: 'Image', icon: '🎞️' },
    'webp': { id: 'webp', name: 'WEBP', description: 'Imagen Web', category: 'Image', icon: '🖼️' },
    'bmp': { id: 'bmp', name: 'BMP', description: 'Bitmap', category: 'Image', icon: '🖼️' },
    'tiff': { id: 'tiff', name: 'TIFF', description: 'Imagen TIFF', category: 'Image', icon: '🖼️' },
    
    // Libros electrónicos
    'epub': { id: 'epub', name: 'EPUB', description: 'Libro Electrónico', category: 'Ebook', icon: '📚' },
    
    // Datos
    'csv': { id: 'csv', name: 'CSV', description: 'Datos Tabulares', category: 'Data', icon: '📊' },
    'json': { id: 'json', name: 'JSON', description: 'Datos JSON', category: 'Data', icon: '📋' },
  };

  // Categorías con iconos
  const categories = [
    { id: 'All', name: 'Todos', icon: '⚡', count: 0 },
    { id: 'Document', name: 'Docs', icon: '📄', count: 0 },
    { id: 'Image', name: 'Imágenes', icon: '🖼️', count: 0 },
    { id: 'Ebook', name: 'Libros', icon: '📚', count: 0 },
    { id: 'Data', name: 'Datos', icon: '📊', count: 0 },
  ];

  // Filtrar formatos disponibles
  const filteredFormats = useMemo(() => {
    let formats = availableFormats
      .map(format => formatDefinitions[format])
      .filter(Boolean);

    // Filtrar por categoría
    if (selectedCategory !== 'All') {
      formats = formats.filter(format => format.category === selectedCategory);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      formats = formats.filter(format => 
        format.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        format.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar: populares primero, luego alfabético
    return formats.sort((a, b) => {
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [availableFormats, selectedCategory, searchTerm]);

  // Calcular conteos por categoría
  const categoriesWithCounts = useMemo(() => {
    const counts = categories.map(cat => ({
      ...cat,
      count: cat.id === 'All' 
        ? availableFormats.length 
        : availableFormats.filter(format => formatDefinitions[format]?.category === cat.id).length
    }));
    return counts.filter(cat => cat.count > 0);
  }, [availableFormats]);

  return (
    <div className={`rounded-xl border transition-colors duration-300 bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 shadow-lg ${className}`}>
      {/* Header con búsqueda */}
      {showHeader && (
        <div className="p-4 border-b transition-colors duration-300 border-gray-200 dark:border-slate-700">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 text-gray-400 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Buscar formato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-lg pl-10 pr-4 py-2 text-sm focus:border-emerald-500 focus:outline-none transition-colors duration-300 bg-gray-50 dark:bg-slate-700/50 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400"
            />
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar de categorías */}
        <div className="w-48 border-r p-4 transition-colors duration-300 border-gray-200 dark:border-slate-700">
          <div className="space-y-1">
            {categoriesWithCounts.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 pr-4 rounded-lg text-sm transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-emerald-100 dark:bg-emerald-500/30 text-emerald-800 dark:text-white border border-emerald-300 dark:border-emerald-500/50 shadow-lg'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span className="flex-1 text-left">{category.name}</span>
                <span className={`text-sm px-3 py-1.5 rounded-full min-w-[36px] h-[28px] flex items-center justify-center font-semibold transition-colors duration-300 shrink-0 ${
                  selectedCategory === category.id
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Grid de formatos */}
        <div className="flex-1 p-4">
          {filteredFormats.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {filteredFormats.map(format => (
                <button
                  key={format.id}
                  onClick={() => onFormatSelect(format.id)}
                  className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedFormat === format.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
                      : 'border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/30 hover:border-gray-400 dark:hover:border-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {/* Badge popular */}
                  {format.popular && (
                    <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                      ⭐
                    </div>
                  )}

                  <div className="text-center">
                    <div className="text-2xl mb-2">{format.icon}</div>
                    <div className="font-bold text-sm mb-1 transition-colors duration-300 text-gray-900 dark:text-white">{format.name}</div>
                    <div className="text-xs transition-colors duration-300 text-gray-600 dark:text-slate-400">{format.description}</div>
                  </div>

                  {/* Indicador de selección */}
                  {selectedFormat === format.id && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 transition-colors duration-300 text-gray-500 dark:text-slate-400">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <p>No se encontraron formatos</p>
              <p className="text-sm">Intenta con otro término de búsqueda</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer con información */}

    </div>
  );
};
