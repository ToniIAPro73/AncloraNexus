export type EbookInputFormat =
  | "mobi"
  | "epub"
  | "pdf"
  | "doc"
  | "docx"
  | "html"
  | "rtf"
  | "txt"
  | "azw";

export type EbookOutputFormat =
  | "epub"
  | "pdf"
  | "azw"
  | "azw3"
  | "rtf"
  | "txt"
  | "mobi";

export interface EbookConversion {
  source: EbookInputFormat;
  target: EbookOutputFormat;
}
