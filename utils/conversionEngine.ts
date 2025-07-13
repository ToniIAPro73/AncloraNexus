import { getFileCategory } from './conversionMaps';

export type ConversionMatrix = Record<string, string[]>;

const intraCategoryMatrix: ConversionMatrix = {
  mp3: ['wav', 'aac'],
  wav: ['mp3', 'flac'],
  flac: ['mp3'],
  mp4: ['webm', 'mov'],
  mov: ['mp4'],
  png: ['jpg', 'webp'],
  jpg: ['png', 'webp'],
  docx: ['pdf', 'txt'],
  pdf: ['docx'],
};

const interCategoryMatrix: ConversionMatrix = {
  jpg: ['pdf'],
  png: ['pdf'],
  mp3: ['mp4'],
  docx: ['jpg'],
};

const combinedMatrix: ConversionMatrix = { ...intraCategoryMatrix };
for (const [src, targets] of Object.entries(interCategoryMatrix)) {
  combinedMatrix[src] = [...(combinedMatrix[src] || []), ...targets];
}

export interface ConversionResult {
  optimal: boolean;
  path: string[] | null;
}

function bfs(start: string, goal: string): string[] | null {
  if (start === goal) return [start];
  const queue: [string, string[]][] = [[start, [start]]];
  const visited = new Set<string>([start]);

  while (queue.length > 0) {
    const [current, path] = queue.shift()!;
    const neighbors = combinedMatrix[current.toLowerCase()] || [];
    for (const next of neighbors) {
      if (visited.has(next)) continue;
      const newPath = [...path, next];
      if (next === goal) return newPath;
      visited.add(next);
      queue.push([next, newPath]);
    }
  }
  return null;
}

export function findConversionPath(sourceExt: string, targetExt: string): ConversionResult {
  const path = bfs(sourceExt.toLowerCase(), targetExt.toLowerCase());
  return {
    optimal: path !== null && path.length === 2,
    path,
  };
}

export function canConvert(sourceExt: string, targetExt: string): boolean {
  return bfs(sourceExt.toLowerCase(), targetExt.toLowerCase()) !== null;
}
