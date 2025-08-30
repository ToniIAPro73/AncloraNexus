type Device = 'kindle' | 'kobo' | 'mobile' | 'desktop' | 'universal';

export const EbookFormatService = {
  getInstance() {
    const formats = [
      { extension: 'epub', name: 'EPUB', description: 'Formato abierto y flexible', deviceCompatibility: ['kindle','kobo','mobile','desktop'], advantages: ['Reflowable','Ampliamente soportado'], disadvantages: ['No siempre mantiene el diseño'] },
      { extension: 'pdf', name: 'PDF', description: 'Diseño fijo', deviceCompatibility: ['mobile','desktop'], advantages: ['Diseño preciso'], disadvantages: ['No reflowable'] },
      { extension: 'mobi', name: 'MOBI', description: 'Antiguo formato Kindle', deviceCompatibility: ['kindle'], advantages: ['Compatible con Kindle antiguos'], disadvantages: ['Obsoleto'] },
      { extension: 'azw3', name: 'AZW3', description: 'Formato moderno Kindle', deviceCompatibility: ['kindle'], advantages: ['Mejor soporte Kindle'], disadvantages: ['Propietario'] },
      { extension: 'txt', name: 'TXT', description: 'Texto plano', deviceCompatibility: ['universal'], advantages: ['Máxima compatibilidad'], disadvantages: ['Sin formato'] },
    ];

    return {
      getRecommendedFormats: (device: Device) => formats.filter(f => f.deviceCompatibility.includes(device) || device === 'universal'),
      getFormatDetails: (ext: string) => formats.find(f => f.extension === ext) || null,
      checkCompatibility: (source: string, target: string) => ({ compatible: source !== target, difficulty: 'medium', warnings: [], dataLoss: [] }),
    };
  },
};

