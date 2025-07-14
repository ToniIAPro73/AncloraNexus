import { describe, it, expect } from 'vitest';
import { findConversionPath } from '../conversionEngine';

describe('conversion engine', () => {
  it('detects optimal direct conversion', () => {
    const result = findConversionPath('mp3', 'wav');
    expect(result.optimal).toBe(true);
    expect(result.path).toEqual(['mp3', 'wav']);
  });

  it('finds intermediate path when direct conversion missing', () => {
    const result = findConversionPath('flac', 'aac');
    expect(result.optimal).toBe(false);
    expect(result.path).toEqual(['flac', 'mp3', 'aac']);
  });

  it('returns null path when no conversion possible', () => {
    const result = findConversionPath('mp3', 'docx');
    expect(result.path).toBeNull();
    expect(result.optimal).toBe(false);
  });
});
