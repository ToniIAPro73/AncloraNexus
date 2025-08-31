import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { FileUploader } from '../FileUploader';

afterEach(() => cleanup());

describe('FileUploader default UI', () => {
  it('handles drag and drop', () => {
    const handleFile = vi.fn();
    render(<FileUploader onFileSelect={handleFile} isLoading={false} />);

    const dropzone = screen.getByLabelText('Zona de subida de archivos');
    const file = new File(['content'], 'hello.png', { type: 'image/png' });

    fireEvent.dragEnter(dropzone, { dataTransfer: { items: [file] } });
    expect(dropzone.className).toMatch(/scale-105/);

    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });
    expect(handleFile).toHaveBeenCalledWith(file);
  });

  it('shows error for unsupported files and exposes aria label', () => {
    const handleFile = vi.fn();
    render(
      <FileUploader onFileSelect={handleFile} isLoading={false} acceptedFiles="image/png" />
    );

    const dropzone = screen.getByLabelText('Zona de subida de archivos');
    const invalidFile = new File(['content'], 'audio.mp3', { type: 'audio/mpeg' });

    fireEvent.dragEnter(dropzone, { dataTransfer: { items: [invalidFile] } });
    fireEvent.drop(dropzone, { dataTransfer: { files: [invalidFile] } });

    expect(handleFile).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Formato de archivo no soportado');
  });
});


