export interface EbookFile {
  name: string;
  size: number;
}
export interface EbookConversionJob {
  id: string;
}
export interface EbookValidationResult {
  valid: boolean;
  errors?: string[];
}
