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
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  availableFormats,
  selectedFormat,
  onFormatSelect,
  sourceFormat,
  className = ''
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
    { id: 'Document', name: 'Documentos', icon: '📄', count: 0 },
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
    <div className={`bg-slate-800/50 rounded-xl border border-slate-700 ${className}`}>
      {/* Header con búsqueda */}
      <div className="p-4 border-b border-slate-700">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar formato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar de categorías */}
        <div className="w-48 border-r border-slate-700 p-4">
          <div className="space-y-1">
            {categoriesWithCounts.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span className="flex-1 text-left">{category.name}</span>
                <span className="text-xs bg-slate-600 px-2 py-1 rounded-full">
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
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                      : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
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
                    <div className="font-bold text-white text-sm mb-1">{format.name}</div>
                    <div className="text-xs text-slate-400">{format.description}</div>
                  </div>
                  
                  {/* Indicador de selección */}
                  {selectedFormat === format.id && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <p>No se encontraron formatos</p>
              <p className="text-sm">Intenta con otro término de búsqueda</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer con información */}
      {selectedFormat && (
        <div className="p-4 border-t border-slate-700 bg-slate-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{formatDefinitions[selectedFormat]?.icon}</span>
              <div>
                <div className="font-medium text-white">
                  {sourceFormat.toUpperCase()} → {selectedFormat.toUpperCase()}
                </div>
                <div className="text-sm text-slate-400">
                  {formatDefinitions[selectedFormat]?.description}
                </div>
              </div>
            </div>
            <ChevronRight size={20} className="text-primary" />
          </div>
        </div>
      )}
    </div>
  );
};
