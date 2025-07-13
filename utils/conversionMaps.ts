export enum FileCategory {
  Audio = "audio",
  Video = "video",
  Image = "image",
  Document = "document",
  Archive = "archive",
  Presentation = "presentation",
  Font = "font",
  Ebook = "ebook",
}

const extensionMap: Record<string, FileCategory> = {
  // audio
  "3g2": FileCategory.Audio,
  "3gp": FileCategory.Audio,
  "3gpp": FileCategory.Audio,
  aac: FileCategory.Audio,
  ac3: FileCategory.Audio,
  aif: FileCategory.Audio,
  aiff: FileCategory.Audio,
  aifc: FileCategory.Audio,
  amr: FileCategory.Audio,
  au: FileCategory.Audio,
  flac: FileCategory.Audio,
  m4a: FileCategory.Audio,
  mp3: FileCategory.Audio,
  wav: FileCategory.Audio,
  wma: FileCategory.Audio,
  // video
  flv: FileCategory.Video,
  mkv: FileCategory.Video,
  mov: FileCategory.Video,
  mp4: FileCategory.Video,
  webm: FileCategory.Video,
  wmv: FileCategory.Video,
  m4v: FileCategory.Video,
  avi: FileCategory.Video,
  // image
  ai: FileCategory.Image,
  bmp: FileCategory.Image,
  gif: FileCategory.Image,
  heic: FileCategory.Image,
  ico: FileCategory.Image,
  jpg: FileCategory.Image,
  jpeg: FileCategory.Image,
  png: FileCategory.Image,
  psd: FileCategory.Image,
  svg: FileCategory.Image,
  tiff: FileCategory.Image,
  webp: FileCategory.Image,
  // document
  abw: FileCategory.Document,
  doc: FileCategory.Document,
  docx: FileCategory.Document,
  html: FileCategory.Document,
  md: FileCategory.Document,
  odt: FileCategory.Document,
  pdf: FileCategory.Document,
  rtf: FileCategory.Document,
  txt: FileCategory.Document,
  // archive
  "7z": FileCategory.Archive,
  ace: FileCategory.Archive,
  rar: FileCategory.Archive,
  tar: FileCategory.Archive,
  zip: FileCategory.Archive,
  gz: FileCategory.Archive,
  bz2: FileCategory.Archive,
  // presentation
  dps: FileCategory.Presentation,
  key: FileCategory.Presentation,
  odp: FileCategory.Presentation,
  pot: FileCategory.Presentation,
  ppt: FileCategory.Presentation,
  pptx: FileCategory.Presentation,
  // font
  eot: FileCategory.Font,
  otf: FileCategory.Font,
  ttf: FileCategory.Font,
  woff: FileCategory.Font,
  woff2: FileCategory.Font,
  // ebook
  azw: FileCategory.Ebook,
  azw3: FileCategory.Ebook,
  epub: FileCategory.Ebook,
  lrf: FileCategory.Ebook,
  mobi: FileCategory.Ebook,
  oeb: FileCategory.Ebook,
  pdb: FileCategory.Ebook,
};

export function getFileCategory(filename: string): FileCategory | "other" {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext && extensionMap[ext] ? extensionMap[ext] : "other";
}

const targetFormats: Record<FileCategory, string[]> = {
  [FileCategory.Audio]: ["MP3", "WAV", "FLAC", "AAC"],
  [FileCategory.Video]: ["MP4", "MOV", "WEBM", "MKV"],
  [FileCategory.Image]: ["JPG", "PNG", "WEBP", "GIF", "TIFF"],
  [FileCategory.Document]: ["PDF", "DOCX", "TXT", "HTML"],
  [FileCategory.Archive]: ["ZIP", "7Z", "TAR", "RAR"],
  [FileCategory.Presentation]: ["PPTX", "PPT", "PDF"],
  [FileCategory.Font]: ["TTF", "OTF", "WOFF"],
  [FileCategory.Ebook]: ["EPUB", "PDF", "AZW", "AZW3", "RTF", "TXT", "MOBI"],
};

export function getTargetFormats(
  category: FileCategory | "other",
  sourceExt?: string,
): Partial<Record<FileCategory, string[]>> {
  if (category === "other") return {};
  const formats = targetFormats[category] || [];
  const filtered = sourceExt
    ? formats.filter((f) => f.toLowerCase() !== sourceExt.toLowerCase())
    : formats;
  return { [category]: filtered };
}
