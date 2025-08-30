export interface EbookFile {
  name: string;
  size: number;
  format?: string;
  metadata?: { title?: string; author?: string };
}

export interface EbookMetadata {
  title?: string;
  author?: string;
  description?: string;
  format?: string;
  publisher?: string;
  publishDate?: string;
  isbn?: string;
  language?: string;
  fileSize?: number;
  pageCount?: number;
  coverImage?: string;
}

export interface EbookConversionJob {
  id: string;
  inputFile: { name: string; format: string };
  outputFormat: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  outputFile?: { downloadUrl: string };
}

export interface EbookValidationResult {
  valid: boolean;
  errors?: string[];
}
