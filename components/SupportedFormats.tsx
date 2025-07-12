import React, { useState } from 'react';
import {
  IconAudio,
  IconVideo,
  IconImage,
  IconFile,
  IconArchive,
  IconPresentation,
  IconFont,
  IconEbook,
} from './Icons';
import { FileCategory } from '../utils/conversionMaps';

type CategoryInfo = {
  name: string;
  icon: React.FC<{ className?: string }>;
};

const displayCategories: FileCategory[] = [
  'audio',
  'video',
  'image',
  'document',
  'archive',
  'presentation',
  'font',
  'ebook',
];

const categoryInfoMap: Record<FileCategory, CategoryInfo> = {
  audio: { name: 'Audio', icon: IconAudio },
  video: { name: 'Video', icon: IconVideo },
  image: { name: 'Imagen', icon: IconImage },
  document: { name: 'Documento', icon: IconFile },
  archive: { name: 'Archivo', icon: IconArchive },
  presentation: { name: 'Presentación', icon: IconPresentation },
  font: { name: 'Fuente', icon: IconFont },
  ebook: { name: 'Libro Electrónico', icon: IconEbook },
};

const allFormats: Record<FileCategory, { name: string; description: string }[]> = {
  audio: [
    { name: '3G2', description: 'x-3g2' }, { name: '3GP', description: 'x-3gp' }, { name: '3GPP', description: 'x-3gpp' },
    { name: 'AAC', description: 'x-aac' }, { name: 'AC3', description: 'x-ac3' }, { name: 'AIF', description: 'x-aif' },
    { name: 'AIFC', description: 'x-aifc' }, { name: 'AIFF', description: 'x-aiff' }, { name: 'AMR', description: 'x-amr' },
    { name: 'AU', description: 'x-au' }, { name: 'AVI', description: 'x-avi' }, { name: 'CAF', description: 'x-caf' },
    { name: 'CAVS', description: 'x-cavs' }, { name: 'DV', description: 'x-dv' }, { name: 'DVR', description: 'x-dvr' },
    { name: 'FLAC', description: 'x-flac' }, { name: 'M4A', description: 'x-m4a' }, { name: 'MP3', description: 'x-mp3' },
    { name: 'WAV', description: 'x-wav' }, { name: 'WMA', description: 'x-wma' },
  ].sort((a, b) => a.name.localeCompare(b.name)),
  video: [
    { name: 'FLV', description: 'x-flv' }, { name: 'MKV', description: 'x-mkv' },
    { name: 'MOV', description: 'x-mov' }, { name: 'MP4', description: 'x-mp4' }, { name: 'WEBM', description: 'x-webm' },
    { name: 'WMV', description: 'x-wmv' }, { name: 'M4V', description: 'x-m4v' },
  ],
  image: [
    { name: 'AI', description: 'x-ai' }, { name: 'BMP', description: 'x-bmp' }, { name: 'GIF', description: 'x-gif' },
    { name: 'HEIC', description: 'x-heic' }, { name: 'ICO', description: 'x-ico' }, { name: 'JPG', description: 'x-jpg' },
    { name: 'PNG', description: 'x-png' }, { name: 'PSD', description: 'x-psd' }, { name: 'SVG', description: 'x-svg' },
    { name: 'TIFF', description: 'x-tiff' }, { name: 'WEBP', description: 'x-webp' },
  ],
  document: [
    { name: 'ABW', description: 'x-abw' }, { name: 'DOC', description: 'x-doc' }, { name: 'DOCX', description: 'x-docx' },
    { name: 'HTML', description: 'x-html' }, { name: 'MD', description: 'x-md' }, { name: 'ODT', description: 'x-odt' },
    { name: 'PDF', description: 'x-pdf' }, { name: 'RTF', description: 'x-rtf' }, { name: 'TXT', description: 'x-txt' },
  ],
  archive: [
    { name: '7Z', description: 'x-7z' }, { name: 'ACE', description: 'x-ace' }, { name: 'RAR', description: 'x-rar' },
    { name: 'TAR', description: 'x-tar' }, { name: 'TAR.BZ2', description: 'x-tar.bz2' }, { name: 'TAR.GZ', description: 'x-tar.gz' },
    { name: 'ZIP', description: 'x-zip' },
  ],
  presentation: [
    { name: 'DPS', description: 'x-dps' }, { name: 'KEY', description: 'x-key' }, { name: 'ODP', description: 'x-odp' },
    { name: 'POT', description: 'x-pot' }, { name: 'PPT', description: 'x-ppt' }, { name: 'PPTX', description: 'x-pptx' },
  ],
  font: [
    { name: 'EOT', description: 'x-eot' }, { name: 'OTF', description: 'x-otf' }, { name: 'TTF', description: 'x-ttf' },
    { name: 'WOFF', description: 'x-woff' }, { name: 'WOFF2', description: 'x-woff2' },
  ],
  ebook: [
    { name: 'AZW', description: 'x-azw' }, { name: 'AZW3', description: 'x-azw3' }, { name: 'EPUB', description: 'x-epub' },
    { name: 'LRF', description: 'x-lrf' }, { name: 'MOBI', description: 'x-mobi' }, { name: 'OEB', description: 'x-oeb' },
    { name: 'PDB', description: 'x-pdb' },
  ],
};

const FormatItem: React.FC<{ name: string; description: string }> = ({ name, description }) => (
    <div className="flex items-baseline justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
        <span className="font-bold text-slate-800 text-lg">{name}</span>
        <span className="text-slate-500">{description}</span>
    </div>
);

export const SupportedFormats: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<FileCategory>('audio');

    const currentFormats = allFormats[activeCategory];

    return (
        <section className="w-full max-w-6xl mx-auto py-16 sm:py-24">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight text-center mb-12">
                O consulte todos nuestros formatos compatibles
            </h2>
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/50 p-4 sm:p-6">
                <div className="flex justify-center border-b border-slate-200 mb-6">
                    <div className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-2 -mx-4 px-4">
                        {displayCategories.map(catKey => {
                            const { name, icon: Icon } = categoryInfoMap[catKey];
                            const isActive = activeCategory === catKey;
                            return (
                                <button
                                    key={catKey}
                                    onClick={() => setActiveCategory(catKey)}
                                    className={`relative flex-shrink-0 flex flex-col items-center justify-center space-y-1 px-3 sm:px-4 py-2 rounded-t-lg transition-colors duration-200 group ${isActive ? 'text-green-600' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    <Icon className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${isActive ? 'text-green-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
                                    <span className={`text-xs sm:text-sm font-medium transition-colors ${isActive ? 'text-green-600' : 'text-slate-500 group-hover:text-slate-700'}`}>{name}</span>
                                    {isActive && <div className="absolute bottom-0 w-full h-1 bg-green-500 rounded-full mt-1"></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {currentFormats.map(format => (
                        <FormatItem key={format.name} name={format.name} description={format.description} />
                    ))}
                </div>
            </div>
        </section>
    );
};