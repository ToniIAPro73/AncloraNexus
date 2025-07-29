import React, { useState } from 'react';
import { IconAudio, IconVideo, IconImage, IconFile, IconArchive, IconPresentation, IconArrowRight, IconEbook } from '../frontend/components/Icons';
import { FileCategory } from '../utils/conversionMaps';

type CategoryInfo = {
  name: string;
  icon: React.FC<{ className?: string }>;
  conversions: { from: string; to: string }[];
};

const popularData: Record<FileCategory, CategoryInfo> = {
    ebook: { 
        name: 'Ebook', 
        icon: IconEbook, 
        conversions: [
            { from: 'AZW', to: 'AZW3' }, { from: 'AZW', to: 'EPUB' },
            { from: 'AZW', to: 'LRF' }, { from: 'AZW', to: 'MOBI' },
            { from: 'AZW', to: 'OEB' }, { from: 'AZW', to: 'PDB' },
        ]
    },
    audio: {
        name: 'Audio',
        icon: IconAudio,
        conversions: [
            { from: 'MP3', to: 'WAV' }, { from: 'WAV', to: 'MP3' },
            { from: 'FLAC', to: 'MP3' }, { from: 'M4A', to: 'MP3' },
            { from: 'OGG', to: 'MP3' }, { from: 'AAC', to: 'MP3' },
        ],
    },
    video: {
        name: 'Video',
        icon: IconVideo,
        conversions: [
            { from: 'MP4', to: 'WEBM' }, { from: 'MP4', to: 'GIF' },
            { from: 'MOV', to: 'MP4' }, { from: 'AVI', to: 'MP4' },
            { from: 'MKV', to: 'MP4' }, { from: 'WMV', to: 'MP4' },
        ],
    },
    image: {
        name: 'Imagen',
        icon: IconImage,
        conversions: [
            { from: 'JPG', to: 'PNG' }, { from: 'PNG', to: 'JPG' },
            { from: 'HEIC', to: 'JPG' }, { from: 'WEBP', to: 'JPG' },
            { from: 'GIF', to: 'MP4' }, { from: 'SVG', to: 'PNG' },
        ],
    },
    document: {
        name: 'Documento',
        icon: IconFile,
        conversions: [
            { from: 'PDF', to: 'DOCX' }, { from: 'DOCX', to: 'PDF' },
            { from: 'PDF', to: 'JPG' }, { from: 'PPTX', to: 'PDF' },
            { from: 'XLSX', to: 'PDF' }, { from: 'HTML', to: 'PDF' },
        ],
    },
    archive: {
        name: 'Archivo',
        icon: IconArchive,
        conversions: [
            { from: 'ZIP', to: 'RAR' }, { from: 'RAR', to: 'ZIP' },
            { from: '7Z', to: 'ZIP' }, { from: 'TAR.GZ', to: 'ZIP' },
            { from: 'ZIP', to: '7Z' }, { from: 'TAR', to: 'ZIP' },
        ],
    },
    presentation: {
        name: 'Presentación',
        icon: IconPresentation,
        conversions: [
            { from: 'PPTX', to: 'PDF' }, { from: 'PPT', to: 'PDF' },
            { from: 'KEY', to: 'PPTX' }, { from: 'ODP', to: 'PPTX' },
            { from: 'PPTX', to: 'MP4' }, { from: 'PPT', to: 'ODP' },
        ]
    },
    font: { name: 'Font', icon: IconFile, conversions: [] },
};

const displayCategories: FileCategory[] = ['ebook', 'audio', 'video', 'image', 'document', 'archive', 'presentation'];

const ConversionButton: React.FC<{from: string, to: string}> = ({ from, to }) => (
    <button className="popular-conversion-card w-full flex items-center justify-between">
        <span className="font-semibold">{from} a {to}</span>
        <IconArrowRight className="w-5 h-5" />
    </button>
);


export const PopularConversions: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<FileCategory>('ebook');

    const activeInfo = popularData[activeCategory];

    return (
        <section className="w-full max-w-6xl mx-auto py-16 sm:py-24">
            <h2 className="text-h2 text-center mb-12">
                Accede rápidamente a nuestras solicitudes de conversión más populares
            </h2>
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                <aside className="w-full md:w-1/4">
                    <ul className="space-y-2">
                        {displayCategories.map(catKey => {
                            const category = popularData[catKey as FileCategory];
                            const Icon = category.icon;
                            const isActive = activeCategory === catKey;
                            return (
                                <li key={catKey}>
                                    <button 
                                        onClick={() => setActiveCategory(catKey as FileCategory)}
                                        className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors text-lg ${isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}
                                    >
                                        <Icon className="w-6 h-6 flex-shrink-0" />
                                        <span>{category.name}</span>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </aside>
                <main className="w-full md:w-3/4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeInfo.conversions.map((conv, index) => (
                            <ConversionButton key={index} from={conv.from} to={conv.to} />
                        ))}
                    </div>
                </main>
            </div>
        </section>
    );
}