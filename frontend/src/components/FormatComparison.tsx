import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from './ui';
import { Button, Badge } from './ui';
import { ArrowRight, Check, Info, HelpCircle, Star, Download, FileSearch, FileQuestion } from 'lucide-react';

interface FormatFeature {
  name: string;
  description: string;
}

interface FormatData {
  id: string;
  name: string;
  extension: string;
  icon: React.ReactNode;
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string[];
  features: Record<string, boolean>;
  popularity: 1 | 2 | 3 | 4 | 5;
  compatibility: 1 | 2 | 3 | 4 | 5;
  type: 'document' | 'image' | 'audio' | 'video' | 'ebook' | 'other';
}

interface FormatComparisonProps {
  formats?: FormatData[];
  onSelectFormat?: (formatId: string) => void;
  className?: string;
}

export const FormatComparison: React.FC<FormatComparisonProps> = ({
  formats = [],
  onSelectFormat,
  className = '',
}) => {
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFormat, setExpandedFormat] = useState<string | null>(null);
  
  // Common features across formats for comparison
  const commonFeatures: FormatFeature[] = [
    { name: 'Editable Text', description: 'Texto puede ser editado directamente' },
    { name: 'Vector Graphics', description: 'Soporta grÃ¡ficos vectoriales que mantienen calidad al ampliar' },
    { name: 'Compression', description: 'Formato comprimido para reducir tamaÃ±o de archivo' },
    { name: 'Metadata', description: 'Permite almacenamiento de metadatos como autor, fecha, etc.' },
    { name: 'Password Protection', description: 'Puede ser protegido con contraseÃ±a' },
    { name: 'Web Compatible', description: 'Compatible con navegadores web modernos' },
    { name: 'Mobile Support', description: 'Buen soporte en dispositivos mÃ³viles' }
  ];

  // Filter formats by type and search query
  const filteredFormats = formats.filter(format => {
    // Filter by type
    if (filterType !== 'all' && format.type !== filterType) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        format.name.toLowerCase().includes(searchLower) ||
        format.extension.toLowerCase().includes(searchLower) ||
        format.description.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  const toggleFormatSelection = (formatId: string) => {
    setSelectedFormats(prev => {
      if (prev.includes(formatId)) {
        return prev.filter(id => id !== formatId);
      } else {
        // Limit to max 3 formats for comparison
        if (prev.length >= 3) {
          return [...prev.slice(1), formatId];
        }
        return [...prev, formatId];
      }
    });
  };
  
  const toggleExpandFormat = (formatId: string) => {
    setExpandedFormat(prev => prev === formatId ? null : formatId);
  };

  const handleSelectFormat = (formatId: string) => {
    if (onSelectFormat) {
      onSelectFormat(formatId);
    }
  };
  
  // Render stars for ratings (popularity, compatibility)
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={14} 
            className={`${star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-600'} mr-0.5`} 
          />
        ))}
      </div>
    );
  };
  
  // If no formats are provided, show example formats
  const exampleFormats: FormatData[] = [
    {
      id: 'pdf',
      name: 'PDF',
      extension: '.pdf',
      icon: <FileSearch className="h-6 w-6 text-red-500" />,
      description: 'Formato de documento portÃ¡til, ideal para compartir documentos que mantendrÃ¡n su formato en diferentes dispositivos y plataformas.',
      pros: [
        'Mantiene formato exacto en cualquier dispositivo',
        'Ampliamente soportado en todas las plataformas',
        'Bueno para documentos finalizados',
        'Puede incluir elementos interactivos'
      ],
      cons: [
        'DifÃ­cil de editar sin software especializado',
        'Puede resultar en archivos grandes',
        'No ideal para contenido que requiere ediciÃ³n frecuente'
      ],
      bestFor: [
        'Documentos oficiales',
        'Manuales',
        'Formularios',
        'Documentos para impresiÃ³n'
      ],
      features: {
        'Editable Text': false,
        'Vector Graphics': true,
        'Compression': true,
        'Metadata': true,
        'Password Protection': true,
        'Web Compatible': true,
        'Mobile Support': true
      },
      popularity: 5,
      compatibility: 5,
      type: 'document'
    },
    {
      id: 'docx',
      name: 'Word Document',
      extension: '.docx',
      icon: <FileSearch className="h-6 w-6 text-blue-500" />,
      description: 'Formato estÃ¡ndar de Microsoft Word para documentos editables con formato enriquecido, tablas e imÃ¡genes.',
      pros: [
        'Totalmente editable',
        'Compatible con la mayorÃ­a de procesadores de texto',
        'Soporta elementos complejos como tablas y grÃ¡ficos',
        'Corrector ortogrÃ¡fico y herramientas de revisiÃ³n'
      ],
      cons: [
        'Puede tener problemas de compatibilidad entre versiones',
        'No garantiza formato exacto en todas las plataformas',
        'Requiere software compatible para visualizaciÃ³n Ã³ptima'
      ],
      bestFor: [
        'Documentos de trabajo',
        'Reportes editables',
        'Documentos colaborativos',
        'CurrÃ­culums'
      ],
      features: {
        'Editable Text': true,
        'Vector Graphics': true,
        'Compression': true,
        'Metadata': true,
        'Password Protection': true,
        'Web Compatible': false,
        'Mobile Support': true
      },
      popularity: 5,
      compatibility: 4,
      type: 'document'
    },
    {
      id: 'jpg',
      name: 'JPEG Image',
      extension: '.jpg',
      icon: <FileSearch className="h-6 w-6 text-green-500" />,
      description: 'Formato de imagen con compresiÃ³n que equilibra calidad visual y tamaÃ±o de archivo, ideal para fotografÃ­as.',
      pros: [
        'Universalmente soportado en dispositivos y plataformas',
        'Buena compresiÃ³n para reducir tamaÃ±o de archivo',
        'Ideal para fotografÃ­as y imÃ¡genes complejas'
      ],
      cons: [
        'CompresiÃ³n con pÃ©rdida de calidad',
        'No soporta transparencia',
        'No adecuado para grÃ¡ficos con texto o lÃ­neas finas'
      ],
      bestFor: [
        'FotografÃ­as',
        'Contenido web',
        'Compartir en redes sociales',
        'ImpresiÃ³n de fotos'
      ],
      features: {
        'Editable Text': false,
        'Vector Graphics': false,
        'Compression': true,
        'Metadata': true,
        'Password Protection': false,
        'Web Compatible': true,
        'Mobile Support': true
      },
      popularity: 5,
      compatibility: 5,
      type: 'image'
    },
    {
      id: 'png',
      name: 'PNG Image',
      extension: '.png',
      icon: <FileSearch className="h-6 w-6 text-yellow-500" />,
      description: 'Formato de imagen sin pÃ©rdida de calidad que soporta transparencia, ideal para grÃ¡ficos con Ã¡reas transparentes.',
      pros: [
        'CompresiÃ³n sin pÃ©rdida de calidad',
        'Soporta transparencia',
        'Ideal para grÃ¡ficos, logos e ilustraciones'
      ],
      cons: [
        'Archivos mÃ¡s grandes que JPEG para fotos',
        'No ideal para fotografÃ­as complejas por tamaÃ±o',
        'Menos eficiente para imÃ¡genes fotogrÃ¡ficas'
      ],
      bestFor: [
        'Logos',
        'GrÃ¡ficos con transparencia',
        'Capturas de pantalla',
        'Ilustraciones'
      ],
      features: {
        'Editable Text': false,
        'Vector Graphics': false,
        'Compression': true,
        'Metadata': true,
        'Password Protection': false,
        'Web Compatible': true,
        'Mobile Support': true
      },
      popularity: 4,
      compatibility: 5,
      type: 'image'
    },
    {
      id: 'svg',
      name: 'SVG Vector',
      extension: '.svg',
      icon: <FileSearch className="h-6 w-6 text-purple-500" />,
      description: 'Formato de grÃ¡ficos vectoriales escalables que mantiene la calidad a cualquier tamaÃ±o, ideal para grÃ¡ficos e ilustraciones.',
      pros: [
        'Escalable sin pÃ©rdida de calidad',
        'Archivos pequeÃ±os para grÃ¡ficos simples',
        'Editable con editores vectoriales',
        'Animable con CSS o JavaScript'
      ],
      cons: [
        'No adecuado para fotografÃ­as',
        'Requiere soporte de navegador para web',
        'Puede ser complejo para diseÃ±os muy detallados'
      ],
      bestFor: [
        'Iconos',
        'Logos',
        'Ilustraciones',
        'GrÃ¡ficos para web'
      ],
      features: {
        'Editable Text': true,
        'Vector Graphics': true,
        'Compression': false,
        'Metadata': true,
        'Password Protection': false,
        'Web Compatible': true,
        'Mobile Support': true
      },
      popularity: 3,
      compatibility: 4,
      type: 'image'
    }
  ];
  
  const displayFormats = formats.length > 0 ? filteredFormats : exampleFormats;
  const selectedFormatsData = displayFormats.filter(format => selectedFormats.includes(format.id));

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileQuestion className="mr-2 text-primary h-5 w-5" />
              <CardTitle>ComparaciÃ³n de Formatos</CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs">
              {displayFormats.length} formatos disponibles
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and filter controls */}
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar formatos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200"
              >
                <option value="all">Todos los tipos</option>
                <option value="document">Documentos</option>
                <option value="image">ImÃ¡genes</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="ebook">E-books</option>
                <option value="other">Otros</option>
              </select>
              
              <Button 
                className="border border-slate-700 text-slate-200 px-3 py-2 rounded-md text-sm hover:bg-slate-700/50"
                onClick={() => setSelectedFormats([])}
                disabled={selectedFormats.length === 0}
              >
                Limpiar selecciÃ³n
              </Button>
            </div>
          </div>

          {/* Selected formats comparison section */}
          {selectedFormats.length > 0 && (
            <div className="mb-6 bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h3 className="font-medium text-white mb-3">ComparaciÃ³n de Formatos Seleccionados</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-sm text-slate-400 border-b border-slate-700">
                      <th className="text-left pb-2 w-1/4">CaracterÃ­stica</th>
                      {selectedFormatsData.map(format => (
                        <th key={format.id} className="text-center pb-2">
                          <div className="flex flex-col items-center justify-center">
                            {format.icon}
                            <span className="mt-1">{format.extension}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Features comparison */}
                    {commonFeatures.map(feature => (
                      <tr key={feature.name} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                        <td className="py-2 pr-4">
                          <div className="flex items-center">
                            <span className="text-sm text-slate-300">{feature.name}</span>
                            <span title={feature.description}>
                              <HelpCircle 
                                size={14} 
                                className="ml-1 text-slate-400 cursor-help"
                              />
                            </span>
                          </div>
                        </td>
                        {selectedFormatsData.map(format => (
                          <td key={`${format.id}-${feature.name}`} className="text-center py-2">
                            {format.features[feature.name] ? (
                              <Check size={18} className="inline-block text-green-500" />
                            ) : (
                              <span className="inline-block h-4 w-4 rounded-full bg-slate-700"></span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                    
                    {/* Ratings */}
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="py-2 pr-4">
                        <span className="text-sm text-slate-300">Popularidad</span>
                      </td>
                      {selectedFormatsData.map(format => (
                        <td key={`${format.id}-popularity`} className="text-center py-2">
                          {renderStars(format.popularity)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-700/20">
                      <td className="py-2 pr-4">
                        <span className="text-sm text-slate-300">Compatibilidad</span>
                      </td>
                      {selectedFormatsData.map(format => (
                        <td key={`${format.id}-compatibility`} className="text-center py-2">
                          {renderStars(format.compatibility)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-center mt-4 gap-2">
                {selectedFormatsData.map(format => (
                  <Button 
                    key={`select-${format.id}`}
                    className="bg-secondary text-white text-xs px-3 py-1 rounded-md"
                    onClick={() => handleSelectFormat(format.id)}
                  >
                    Usar {format.extension.toUpperCase()}
                    <ArrowRight size={14} className="ml-2" />
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Formats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayFormats.map(format => (
              <Card key={format.id}>
                <div 
                  className={`overflow-hidden border ${
                    selectedFormats.includes(format.id) 
                      ? 'border-primary/50 shadow-md shadow-primary/10' 
                      : 'border-slate-700 hover:border-slate-600'
                  } transition-colors cursor-pointer`}
                  onClick={() => toggleFormatSelection(format.id)}
                >
                  <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {format.icon}
                      <div>
                        <h3 className="font-medium text-white">{format.name}</h3>
                        <p className="text-xs text-slate-400">{format.extension}</p>
                      </div>
                    </div>
                    
                    {selectedFormats.includes(format.id) && (
                      <Badge className="bg-primary text-white text-xs px-2 py-1 rounded">Seleccionado</Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-300 mt-2 line-clamp-2">
                    {format.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center">
                      <span className="text-xs text-slate-400 mr-1">Popularidad:</span>
                      {renderStars(format.popularity)}
                    </div>
                    
                    <Button
                      className="text-xs h-6 px-2 py-0 rounded-md hover:bg-slate-700/30"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpandFormat(format.id);
                      }}
                    >
                      {expandedFormat === format.id ? 'Menos info' : 'MÃ¡s info'}
                    </Button>
                  </div>
                </div>
                
                {expandedFormat === format.id && (
                  <div className="px-4 pb-4 pt-0 bg-slate-800/50 animate-in fade-in-0 slide-in-from-top-5 duration-300">
                    <div className="border-t border-slate-700 mb-3 pt-3">
                      <h4 className="text-xs font-medium text-slate-300 mb-1 flex items-center">
                        <Check size={14} className="text-green-500 mr-1" /> 
                        Ventajas
                      </h4>
                      <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
                        {format.pros.map((pro, index) => (
                          <li key={index}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-3">
                      <h4 className="text-xs font-medium text-slate-300 mb-1 flex items-center">
                        <Info size={14} className="text-amber-500 mr-1" />
                        Desventajas
                      </h4>
                      <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
                        {format.cons.map((con, index) => (
                          <li key={index}>{con}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium text-slate-300 mb-1">Ideal para:</h4>
                      <div className="flex flex-wrap gap-1">
                        {format.bestFor.map((use, index) => (
                          <Badge key={index} className="bg-secondary text-xs px-2 py-1 rounded">
                            {use}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      className="bg-primary text-white mt-3 w-full px-3 py-2 rounded-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectFormat(format.id);
                      }}
                    >
                      <Download size={14} className="mr-1" />
                      Seleccionar {format.extension}
                    </Button>
                  </div>
                )}
                </div>
              </Card>
            ))}
          </div>
          
          {displayFormats.length === 0 && (
            <div className="text-center p-10">
              <FileQuestion className="h-10 w-10 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No se encontraron formatos</h3>
              <p className="text-slate-400">
                No hay formatos que coincidan con tu bÃºsqueda. Intenta con otros tÃ©rminos o elimina los filtros.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FormatComparison;

