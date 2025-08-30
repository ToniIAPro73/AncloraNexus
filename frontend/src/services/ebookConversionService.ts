import type { EbookFile, EbookConversionJob } from '../types/ebook';

export const EbookConversionService = {
  getInstance() {
    return {
      validateFile: async (file: File): Promise<{ success: boolean; data: EbookFile | null; error?: string }> => {
        const name = file.name;
        const ext = name.split('.').pop() || 'txt';
        return { success: true, data: { name, size: file.size, format: ext } as any };
      },
      startConversion: async (
        _ebookFile: EbookFile,
        _targetFormat: string,
        _options: Record<string, unknown>
      ): Promise<{ success: boolean; data: string | null; error?: string }> => {
        const jobId = Math.random().toString(36).slice(2);
        return { success: true, data: jobId };
      },
      getConversionStatus: (_jobId: string): { success: boolean; data: EbookConversionJob | null } => {
        return {
          success: true,
          data: {
            id: _jobId,
            inputFile: { name: 'file', format: 'pdf' },
            outputFormat: 'epub',
            status: 'completed',
            progress: 100,
            outputFile: { downloadUrl: '#' },
          } as any,
        };
      },
    };
  },
};

