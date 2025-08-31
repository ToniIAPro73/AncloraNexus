import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { FileIcon, ImageIcon, FileTextIcon, VideoIcon } from 'lucide-react';

interface FormatInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  bestFor: string[];
  compatibleWith: string[];
  features: string[];
  popularity: number;
  fileSize: 'Small' | 'Medium' | 'Large';
  qualityLoss: 'None' | 'Low' | 'Medium' | 'High';
}

interface FormatRecommendationProps {
  formatType?: 'image' | 'document' | 'video' | 'audio';
  onSelectFormat?: (formatId: string) => void;
}

const fileSizeColor = {
  Small: 'bg-green-500',
  Medium: 'bg-yellow-500',
  Large: 'bg-red-500'
};

const qualityLossColor = {
  None: 'bg-green-500',
  Low: 'bg-green-400',
  Medium: 'bg-yellow-500',
  High: 'bg-red-500'
};

// Sample data for image formats
const imageFormats: FormatInfo[] = [
  {
    id: 'png',
    name: 'PNG',
    description: 'Formato sin pérdida ideal para imágenes con transparencias y gráficos con bordes definidos.',
    icon: <FileIcon className="text-blue-400" />,
    bestFor: ['Capturas de pantalla', 'Ilustraciones', 'Gráficos con texto'],
    compatibleWith: ['Web', 'Todas las plataformas', 'Redes sociales'],
    features: ['Transparencia', 'Sin pérdida de calidad', 'Mayor tamaño'],
    popularity: 9,
    fileSize: 'Large',
    qualityLoss: 'None'
  },
  {
    id: 'jpg',
    name: 'JPG/JPEG',
    description: 'Formato con compresión eficiente para fotografías con gran variedad de colores.',
    icon: <FileIcon className="text-green-400" />,
    bestFor: ['Fotografías', 'Imágenes para web'],
    compatibleWith: ['Web', 'Todas las plataformas', 'Redes sociales'],
    features: ['Compresión ajustable', 'Tamaño reducido', 'Sin transparencia'],
    popularity: 10,
    fileSize: 'Medium',
    qualityLoss: 'Low'
  },
  {
    id: 'webp',
    name: 'WebP',
    description: 'Formato moderno con excelente compresión y soporte para transparencias.',
    icon: <FileIcon className="text-purple-400" />,
    bestFor: ['Imágenes web', 'Apps móviles'],
    compatibleWith: ['Navegadores modernos', 'Android'],
    features: ['Alta compresión', 'Transparencia', 'Animaciones'],
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
    compatibleWith: ['Web', 'Software de diseño'],
    features: ['Escalable', 'Editable', 'Animable'],
    popularity: 8,
    fileSize: 'Small',
    qualityLoss: 'None'
  }
];

// Sample data for document formats
const documentFormats: FormatInfo[] = [
  {
    id: 'pdf',
    name: 'PDF',
    description: 'Formato estándar para documentos que preserva el diseño exacto en cualquier dispositivo.',
    icon: <FileTextIcon className="text-red-400" />,
    bestFor: ['Documentos finales', 'Formularios', 'Manuales'],
    compatibleWith: ['Todas las plataformas', 'Impresión', 'Visualización'],
    features: ['Preserva formato', 'Seguridad', 'Compresión'],
    popularity: 10,
    fileSize: 'Medium',
    qualityLoss: 'None'
  },
  {
    id: 'docx',
    name: 'DOCX',
    description: 'Formato editable de Microsoft Word para documentos de texto con formato.',
    icon: <FileTextIcon className="text-blue-400" />,
    bestFor: ['Documentos editables', 'Colaboración', 'Trabajo en progreso'],
    compatibleWith: ['Microsoft Office', 'Google Docs', 'LibreOffice'],
    features: ['Editable', 'Comentarios', 'Control de cambios'],
    popularity: 9,
    fileSize: 'Medium',
    qualityLoss: 'None'
  },
  {
    id: 'txt',
    name: 'TXT',
    description: 'Formato de texto plano sin formato, compatible con cualquier editor de texto.',
    icon: <FileTextIcon className="text-gray-400" />,
    bestFor: ['Texto simple', 'Compatibilidad', 'Notas'],
    compatibleWith: ['Todas las plataformas', 'Cualquier editor'],
    features: ['Universal', 'Ligero', 'Simple'],
    popularity: 7,
    fileSize: 'Small',
    qualityLoss: 'High'
  }
];

export const FormatRecommendation: React.FC<FormatRecommendationProps> = ({ 
  formatType = 'image',
  onSelectFormat 
}) => {
  const formats = formatType === 'image' ? imageFormats : documentFormats;
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">
        Formatos recomendados para {formatType === 'image' ? 'imágenes' : 'documentos'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {formats.map((format) => (
          <Card 
            key={format.id}
            className="bg-slate-800 border-slate-700 hover:border-primary/50 transition-all cursor-pointer"
            onClick={() => onSelectFormat && onSelectFormat(format.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="mr-3 p-2 bg-slate-700 rounded-lg">
                    {format.icon}
                  </div>
                  <CardTitle className="text-white">{format.name}</CardTitle>
                </div>
                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                  {format.id.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-slate-300 text-sm">{format.description}</p>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Popularidad</span>
                  <span className="text-slate-300">{format.popularity}/10</span>
                </div>
                <Progress value={format.popularity * 10} className="h-1" />
              </div>
              
              <div className="space-y-2">
                <div className="text-xs text-slate-400">Mejor para:</div>
                <div className="flex flex-wrap gap-1">
                  {format.bestFor.map((use, i) => (
                    <Badge key={i} variant="secondary" className="bg-slate-700 text-slate-300">
                      {use}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between text-xs">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full ${fileSizeColor[format.fileSize]} mr-1`}></div>
                  <span className="text-slate-400">Tamaño: {format.fileSize === 'Small' ? 'Pequeño' : format.fileSize === 'Medium' ? 'Medio' : 'Grande'}</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full ${qualityLossColor[format.qualityLoss]} mr-1`}></div>
                  <span className="text-slate-400">Pérdida: {format.qualityLoss === 'None' ? 'Ninguna' : format.qualityLoss === 'Low' ? 'Baja' : format.qualityLoss === 'Medium' ? 'Media' : 'Alta'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FormatRecommendation;