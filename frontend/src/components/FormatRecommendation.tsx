import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, Badge, Button } from './ui';
import { Info, CheckCircle, Zap, FileIcon, HelpCircle } from 'lucide-react';

interface FormatOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  bestFor: string[];
  compatibleWith: string[];
  features: string[];
  popularity: number; // 1-10 scale
  fileSize: 'Small' | 'Medium' | 'Large';
  qualityLoss: 'None' | 'Low' | 'Medium' | 'High';
}

interface FormatRecommendationProps {
  sourceFormat: string;
  fileType: 'image' | 'document' | 'video' | 'audio' | 'ebook';
  onSelectFormat: (formatId: string) => void;
  className?: string;
}

export const FormatRecommendation: React.FC<FormatRecommendationProps> = ({
  sourceFormat,
  fileType,
  onSelectFormat,
  className = '',
}) => {
  const [focusOn, setFocusOn] = useState<'quality' | 'size' | 'compatibility'>('quality');
  
  // Sample format options for different file types
  const imageFormats: FormatOption[] = [
    {
      id: 'png',
      name: 'PNG',
      description: 'Formato sin pÃ©rdida ideal para imÃ¡genes con transparencias y grÃ¡ficos con bordes definidos.',
      icon: <FileIcon className="text-blue-400" />,
      bestFor: ['Capturas de pantalla', 'Ilustraciones', 'GrÃ¡ficos con texto'],
      compatibleWith: ['Web', 'Todas las plataformas', 'Redes sociales'],
      features: ['Transparencia', 'Sin pÃ©rdida de calidad', 'Mayor tamaÃ±o'],
      popularity: 9,
      fileSize: 'Large',
      qualityLoss: 'None'
    },
    {
      id: 'jpg',
      name: 'JPG/JPEG',
      description: 'Formato con compresiÃ³n eficiente para fotografÃ­as con gran variedad de colores.',
      icon: <FileIcon className="text-green-400" />,
      bestFor: ['FotografÃ­as', 'ImÃ¡genes para web'],
      compatibleWith: ['Web', 'Todas las plataformas', 'Redes sociales'],
      features: ['CompresiÃ³n ajustable', 'TamaÃ±o reducido', 'Sin transparencia'],
      popularity: 10,
      fileSize: 'Medium',
      qualityLoss: 'Low'
    },
    {
      id: 'webp',
      name: 'WebP',
      description: 'Formato moderno con excelente compresiÃ³n y soporte para transparencias.',
      icon: <FileIcon className="text-purple-400" />,
      bestFor: ['ImÃ¡genes web', 'Apps mÃ³viles'],
      compatibleWith: ['Navegadores modernos', 'Android'],
      features: ['Alta compresiÃ³n', 'Transparencia', 'Animaciones'],
      popularity: 7,
      fileSize: 'Small',
      qualityLoss: 'Low'
    },
    {
      id: 'svg',
      name: 'SVG',
      description: 'Formato vectorial escalable perfecto para logos e iconos.',
      icon: <FileIcon className="text-orange-400" />,
      bestFor: ['Logos', 'Iconos', 'Ilustraciones'],
      compatibleWith: ['Web', 'Software de diseÃ±o'],
      features: ['Escalable sin pÃ©rdida', 'Editable', 'Animable'],
      popularity: 8,
      fileSize: 'Small',
      qualityLoss: 'None'
    },
  ];

  const documentFormats: FormatOption[] = [
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Formato universal para documentos que preserva diseÃ±o en cualquier plataforma.',
      icon: <FileIcon className="text-red-400" />,
      bestFor: ['Documentos finales', 'Formularios', 'Manuales'],
      compatibleWith: ['Todas las plataformas'],
      features: ['PreservaciÃ³n exacta del formato', 'Seguridad', 'CompresiÃ³n'],
      popularity: 10,
      fileSize: 'Medium',
      qualityLoss: 'None'
    },
    {
      id: 'docx',
      name: 'DOCX',
      description: 'Formato editable de Microsoft Word para documentos de texto.',
      icon: <FileIcon className="text-blue-500" />,
      bestFor: ['Documentos de trabajo', 'ColaboraciÃ³n'],
      compatibleWith: ['Microsoft Office', 'Google Docs', 'LibreOffice'],
      features: ['FÃ¡cil ediciÃ³n', 'Seguimiento de cambios', 'Compatibilidad Office'],
      popularity: 9,
      fileSize: 'Medium',
      qualityLoss: 'None'
    },
    {
      id: 'txt',
      name: 'TXT',
      description: 'Formato de texto plano compatible con cualquier plataforma.',
      icon: <FileIcon className="text-slate-400" />,
      bestFor: ['Texto simple', 'Compatibilidad universal'],
      compatibleWith: ['Todas las plataformas'],
      features: ['MÃ¡xima compatibilidad', 'TamaÃ±o mÃ­nimo', 'Sin formato'],
      popularity: 7,
      fileSize: 'Small',
      qualityLoss: 'Medium'
    },
  ];

  // Get the appropriate format options based on file type
  const getFormatOptions = () => {
    switch (fileType) {
      case 'image':
        return imageFormats;
      case 'document':
        return documentFormats;
      default:
        return [];
    }
  };

  const formatOptions = getFormatOptions();

  // Sort formats based on the current focus
  const getSortedFormats = () => {
    switch (focusOn) {
      case 'quality':
        return [...formatOptions].sort((a, b) => {
          const qualityRank = { 'None': 0, 'Low': 1, 'Medium': 2, 'High': 3 };
          return qualityRank[a.qualityLoss] - qualityRank[b.qualityLoss];
        });
      case 'size':
        return [...formatOptions].sort((a, b) => {
          const sizeRank = { 'Small': 0, 'Medium': 1, 'Large': 2 };
          return sizeRank[a.fileSize] - sizeRank[b.fileSize];
        });
      case 'compatibility':
        return [...formatOptions].sort((a, b) => b.popularity - a.popularity);
      default:
        return formatOptions;
    }
  };

  const sortedFormats = getSortedFormats();

  // Get the recommended format based on the current focus
  const getRecommendedFormat = () => {
    if (sortedFormats.length === 0) return null;
    return sortedFormats[0];
  };

  const recommendedFormat = getRecommendedFormat();
  
  // Get quality color
  const getQualityColor = (quality: 'None' | 'Low' | 'Medium' | 'High') => {
    switch (quality) {
      case 'None': return 'text-green-500';
      case 'Low': return 'text-blue-400';
      case 'Medium': return 'text-yellow-500';
      case 'High': return 'text-red-500';
    }
  };

  // Get size color
  const getSizeColor = (size: 'Small' | 'Medium' | 'Large') => {
    switch (size) {
      case 'Small': return 'text-green-500';
      case 'Medium': return 'text-blue-400';
      case 'Large': return 'text-yellow-500';
    }
  };

  if (!recommendedFormat) {
    return (
      <Card variant="default" className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-slate-300">No hay recomendaciones disponibles para este tipo de archivo.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Recommendation Control */}
      <Card variant="default" className="animate-in fade-in slide-in-from-bottom duration-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>RecomendaciÃ³n de Formato</CardTitle>
            <div className="flex items-center">
              <Info size={14} className="text-slate-400 mr-1" />
              <span className="text-xs text-slate-400">Desde: {sourceFormat}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 mb-4">
            <p className="text-sm text-slate-300 mb-2">Optimizar para:</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={focusOn === 'quality' ? 'primary' : 'outline'} 
                size="sm" 
                onClick={() => setFocusOn('quality')}
              >
                Calidad
              </Button>
              <Button 
                variant={focusOn === 'size' ? 'primary' : 'outline'} 
                size="sm" 
                onClick={() => setFocusOn('size')}
              >
                TamaÃ±o de archivo
              </Button>
              <Button 
                variant={focusOn === 'compatibility' ? 'primary' : 'outline'} 
                size="sm" 
                onClick={() => setFocusOn('compatibility')}
              >
                Compatibilidad
              </Button>
            </div>
          </div>

          {/* Recommended Format */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/50 border border-slate-600/50 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center">
                  <Badge className="bg-green-500 text-xs mr-2 px-2 py-1 rounded bg-gradient-to-r from-green-500 to-emerald-600">
                    Recomendado
                  </Badge>
                  <h3 className="text-lg font-medium text-white">{recommendedFormat.name}</h3>
                </div>
                <p className="text-sm text-slate-300 mt-1">{recommendedFormat.description}</p>
              </div>
              <Button 
                variant="primary" 
                size="sm"
                iconLeft={<CheckCircle size={14} />}
                onClick={() => onSelectFormat(recommendedFormat.id)}
              >
                Seleccionar
              </Button>
            </div>
          </div>

          {/* Format Comparison */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-300">ComparaciÃ³n de formatos:</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="px-3 py-2 text-left text-slate-300">Formato</th>
                    <th className="px-3 py-2 text-left text-slate-300">PÃ©rdida de calidad</th>
                    <th className="px-3 py-2 text-left text-slate-300">TamaÃ±o</th>
                    <th className="px-3 py-2 text-left text-slate-300">Compatibilidad</th>
                    <th className="px-3 py-2 text-center text-slate-300">AcciÃ³n</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFormats.map((format) => (
                    <tr key={format.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                      <td className="px-3 py-2">
                        <div className="flex items-center">
                          {format.icon}
                          <span className="font-medium text-white ml-2">{format.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={getQualityColor(format.qualityLoss)}>
                          {format.qualityLoss === 'None' ? 'Sin pÃ©rdida' : format.qualityLoss === 'Low' ? 'Baja' : format.qualityLoss === 'Medium' ? 'Media' : 'Alta'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={getSizeColor(format.fileSize)}>
                          {format.fileSize === 'Small' ? 'PequeÃ±o' : format.fileSize === 'Medium' ? 'Medio' : 'Grande'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center">
                          <span className="inline-block w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <span 
                              className="h-full bg-blue-500 block rounded-full" 
                              style={{ width: `${format.popularity * 10}%` }}
                            />
                          </span>
                          <span className="text-slate-300 ml-2">{format.popularity}/10</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onSelectFormat(format.id)}
                        >
                          Usar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Format Details */}
            <div className="mt-6 bg-slate-800/50 rounded-lg border border-slate-700 p-4">
              <div className="flex items-center mb-2">
                <HelpCircle size={14} className="text-primary mr-1" />
                <h3 className="text-sm font-medium text-white">Â¿Para quÃ© usar {recommendedFormat.name}?</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div>
                  <h4 className="text-xs text-slate-400 mb-1">Mejor para</h4>
                  <ul className="text-sm space-y-1">
                    {recommendedFormat.bestFor.map((item, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle size={12} className="text-green-500 mr-1" /> 
                        <span className="text-slate-200">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-xs text-slate-400 mb-1">Compatible con</h4>
                  <ul className="text-sm space-y-1">
                    {recommendedFormat.compatibleWith.map((item, index) => (
                      <li key={index} className="flex items-center">
                        <Zap size={12} className="text-blue-400 mr-1" />
                        <span className="text-slate-200">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-xs text-slate-400 mb-1">CaracterÃ­sticas</h4>
                  <ul className="text-sm space-y-1">
                    {recommendedFormat.features.map((item, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-1.5"></span>
                        <span className="text-slate-200">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormatRecommendation;

