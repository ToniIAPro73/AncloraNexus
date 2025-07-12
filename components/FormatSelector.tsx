import React, { useState, useMemo, useRef, useEffect } from 'react';
import { IconChevronDown, IconSearch, IconFile, IconEbook, IconImage, IconAudio, IconVideo, IconArchive, IconPresentation, IconFont } from './Icons';
import { FileCategory } from '../utils/conversionMaps';

const AllIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25v2.25a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
    </svg>
);

const categoryDetails: Record<FileCategory | 'all', { name: string, icon: React.FC<{className?: string}> }> = {
    all: { name: 'All', icon: AllIcon },
    document: { name: 'Document', icon: IconFile },
    ebook: { name: 'Ebook', icon: IconEbook },
    image: { name: 'Image', icon: IconImage },
    audio: { name: 'Audio', icon: IconAudio },
    video: { name: 'Video', icon: IconVideo },
    archive: { name: 'Archive', icon: IconArchive },
    presentation: { name: 'Presentation', icon: IconPresentation },
    font: { name: 'Font', icon: IconFont },
};

interface FormatSelectorProps {
    availableFormats: Partial<Record<FileCategory, string[]>>;
    onSelectFormat: (format: string) => void;
    selectedFormat: string | null;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({ availableFormats, onSelectFormat, selectedFormat }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<FileCategory | 'all'>('all');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const availableCategories = useMemo(() => ['all' as const, ...Object.keys(availableFormats) as FileCategory[]], [availableFormats]);
    
    const displayedFormatsByCategory = useMemo(() => {
        const result: Partial<Record<FileCategory, string[]>> = {};
        const searchTermLower = searchTerm.toLowerCase();

        for (const cat of availableCategories) {
            if (cat === 'all') continue;
            const formats = (availableFormats[cat] || []).filter(f => f.toLowerCase().includes(searchTermLower));
            if (formats.length > 0) {
                result[cat] = formats.sort();
            }
        }
        return result;
    }, [availableFormats, searchTerm, availableCategories]);

    const formatsToShow = useMemo(() => {
        if (activeCategory === 'all') {
            return Object.values(displayedFormatsByCategory).flat().sort((a,b) => a.localeCompare(b));
        }
        return displayedFormatsByCategory[activeCategory] || [];
    }, [activeCategory, displayedFormatsByCategory]);


    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setActiveCategory('all');
            setSearchTerm('');
        }
    };
    
    const handleSelect = (format: string) => {
        onSelectFormat(format);
        setIsOpen(false);
        setSearchTerm('');
    };
    
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const noResults = Object.keys(displayedFormatsByCategory).length === 0 && searchTerm.length > 0;

    return (
        <div className="relative w-full sm:w-64" ref={wrapperRef}>
            <button
                type="button"
                onClick={handleToggle}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-green-500 rounded-lg text-left text-lg font-semibold"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className={selectedFormat ? 'text-green-700' : 'text-slate-500'}>
                    {selectedFormat || 'Selecciona tu formato'}
                </span>
                <IconChevronDown className={`w-6 h-6 text-slate-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-10 mt-2 w-[95vw] max-w-md sm:max-w-xl -translate-x-1/2 left-1/2 sm:left-auto sm:translate-x-0 bg-white border border-slate-200 rounded-lg shadow-2xl">
                    <div className="p-3 border-b border-slate-200">
                        <div className="relative">
                            <IconSearch className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-400 focus:border-green-400"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="flex" style={{ height: '350px' }}>
                        <div className="w-1/3 border-r border-slate-200 p-2 space-y-1 overflow-y-auto">
                            {availableCategories.map(catKey => {
                                const details = categoryDetails[catKey];
                                if (!details || (catKey !== 'all' && !displayedFormatsByCategory[catKey]?.length)) return null;

                                const Icon = details.icon;
                                const isActive = activeCategory === catKey;

                                return (
                                    <button
                                        key={catKey}
                                        onClick={() => setActiveCategory(catKey)}
                                        className={`w-full flex items-center space-x-3 text-left p-2 rounded-md transition-colors text-sm border-l-2 ${isActive ? 'bg-green-50 text-green-700 font-semibold border-green-500' : 'text-slate-600 hover:bg-slate-50 border-transparent'}`}
                                    >
                                        <Icon className="w-5 h-5 flex-shrink-0" />
                                        <span>{details.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="w-2/3 p-3 overflow-y-auto">
                            {noResults ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-slate-500 text-center">No matching formats.</p>
                                </div>
                            ) : (
                                <ul className="grid grid-cols-3 gap-2">
                                    {formatsToShow.map(format => (
                                        <li key={format}>
                                            <button
                                                onClick={() => handleSelect(format)}
                                                className="w-full text-center px-2 py-3 border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-300 rounded-md transition-colors"
                                                role="option"
                                                aria-selected={format === selectedFormat}
                                            >
                                                {format}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};