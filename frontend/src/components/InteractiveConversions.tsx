import React from 'react';
import { IconAudio, IconVideo, IconImage, IconFile, IconArchive, IconPresentation, IconEbook } from './Icons';

interface Category {
  key: string;
  name: string;
  icon: React.FC<{ className?: string }>;
}

const categories: Category[] = [
  { key: 'document', name: 'Documentos', icon: IconFile },
  { key: 'image', name: 'Imágenes', icon: IconImage },
  { key: 'audio', name: 'Audio', icon: IconAudio },
  { key: 'video', name: 'Video', icon: IconVideo },
  { key: 'presentation', name: 'Presentaciones', icon: IconPresentation },
  { key: 'ebook', name: 'Ebooks', icon: IconEbook },
  { key: 'archive', name: 'Archivos', icon: IconArchive },
];

export const InteractiveConversions: React.FC = () => {
  return (
    <section className="w-full max-w-6xl mx-auto py-12 sm:py-16">
      <h2 className="text-h2 text-center text-white mb-8">
        ¿Qué quieres convertir hoy?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map(({ key, name, icon: Icon }) => (
          <a
            key={key}
            href={`/app?category=${key}`}
            className="flex flex-col items-center justify-center p-6 rounded-lg bg-slate-800/50 hover:bg-primary/20 transition-colors"        >
            <Icon className="w-12 h-12 mb-4 text-secondary" />
            <span className="text-white font-semibold">{name}</span>
          </a>
        ))}
      </div>
    </section>
  );
};

export default InteractiveConversions;

