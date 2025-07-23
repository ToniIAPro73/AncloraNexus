import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UniversalConverter } from '../../../components/UniversalConverter';
import { CreditProvider } from '../../../components/CreditSystem';

// Mock de servicios
vi.mock('../services/geminiService', () => ({
  GeminiService: {
    getInstance: () => ({
      convertFile: vi.fn().mockResolvedValue({
        success: true,
        data: { downloadUrl: 'http://example.com/converted-file.pdf' }
      })
    })
  }
}));

describe('UniversalConverter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza correctamente el componente principal', () => {
    render(<CreditProvider><UniversalConverter /></CreditProvider>);
    
    expect(screen.getByText('Explora tus archivos')).toBeInTheDocument();
    expect(screen.getByText('O arrastre y suelte su archivo aquí')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /elige un archivo/i })).toBeInTheDocument();
  });

  it('muestra las categorías de archivos correctamente', () => {
    render(<CreditProvider><UniversalConverter /></CreditProvider>);
    
    // Verificar que las categorías principales están presentes
    expect(screen.getByText('Audio')).toBeInTheDocument();
    expect(screen.getByText('Video')).toBeInTheDocument();
    expect(screen.getByText('Imagen')).toBeInTheDocument();
    expect(screen.getByText('Documento')).toBeInTheDocument();
    expect(screen.getByText('Ebook')).toBeInTheDocument();
  });

  it('cambia las conversiones populares al seleccionar una categoría', async () => {
    render(<CreditProvider><UniversalConverter /></CreditProvider>);
    
    // Hacer clic en la categoría Audio
    const audioButton = screen.getByText('Audio');
    fireEvent.click(audioButton);
    
    // Verificar que aparecen conversiones de audio
    await waitFor(() => {
      expect(screen.getByText('MP3 a WAV')).toBeInTheDocument();
      expect(screen.getByText('WAV a MP3')).toBeInTheDocument();
    });
  });

  it('cambia a conversiones de video al seleccionar la categoría', async () => {
    render(<CreditProvider><UniversalConverter /></CreditProvider>);
    
    // Hacer clic en la categoría Video
    const videoButton = screen.getByText('Video');
    fireEvent.click(videoButton);
    
    // Verificar que aparecen conversiones de video
    await waitFor(() => {
      expect(screen.getByText('MP4 a WEBM')).toBeInTheDocument();
      expect(screen.getByText('MOV a MP4')).toBeInTheDocument();
    });
  });

  it('maneja la carga de archivos mediante drag and drop', async () => {
    render(<CreditProvider><UniversalConverter /></CreditProvider>);
    
    const dropZone = screen.getByText('O arrastre y suelte su archivo aquí').closest('div');
    
    // Simular drag and drop
    const file = new File(['test content'], 'test.mp3', { type: 'audio/mpeg' });
    const dragEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dragEvent, 'dataTransfer', {
      value: {
        files: [file]
      }
    });
    
    fireEvent(dropZone!, dragEvent);
    
    // Verificar que el archivo se procesa
    await waitFor(() => {
      expect(screen.getByText('test.mp3')).toBeInTheDocument();
    });
  });

  it('maneja la selección de archivos mediante el botón', async () => {
    render(<CreditProvider><UniversalConverter /></CreditProvider>);
    
    const fileInput = screen.getByRole('button', { name: /elige un archivo/i });
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    // Simular selección de archivo
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });

  it('muestra el selector de formato después de cargar un archivo', async () => {
    render(<CreditProvider><UniversalConverter /></CreditProvider>);
    
    const dropZone = screen.getByText('O arrastre y suelte su archivo aquí').closest('div');
    const file = new File(['test content'], 'test.mp3', { type: 'audio/mpeg' });
    
    // Simular carga de archivo
    const dragEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dragEvent, 'dataTransfer', {
      value: { files: [file] }
    });
    
    fireEvent(dropZone!, dragEvent);
    
    // Verificar que aparece el selector de formato
    await waitFor(() => {
      expect(screen.getByText('Seleccionar formato de salida')).toBeInTheDocument();
    });
  });

  it('inicia la conversión cuando se selecciona un formato', async () => {
    render(<CreditProvider><UniversalConverter /></CreditProvider>);
    
    // Cargar archivo
    const dropZone = screen.getByText('O arrastre y suelte su archivo aquí').closest('div');
    const file = new File(['test content'], 'test.mp3', { type: 'audio/mpeg' });
    
    const dragEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dragEvent, 'dataTransfer', {
      value: { files: [file] }
    });
    
    fireEvent(dropZone!, dragEvent);
    
    // Seleccionar formato de salida
    await waitFor(() => {
      const formatButton = screen.getByText('WAV');
      fireEvent.click(formatButton);
    });
    
    // Verificar que inicia la conversión
    await waitFor(() => {
      expect(screen.getByText('Convirtiendo...')).toBeInTheDocument();
    });
  });

  it('muestra el progreso de conversión', async () => {
    render(<CreditProvider><UniversalConverter /></CreditProvider>);
    
    // Simular proceso de conversión
    const dropZone = screen.getByText('O arrastre y suelte su archivo aquí').closest('div');
    const file = new File(['test content'], 'test.mp3', { type: 'audio/mpeg' });
    
    const dragEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dragEvent, 'dataTransfer', {
      value: { files: [file] }
    });
    
    fireEvent(dropZone!, dragEvent);
    
    await waitFor(() => {
      const formatButton = screen.getByText('WAV');
      fireEvent.click(formatButton);
    });
    
    // Verificar elementos de progreso
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('muestra el botón de descarga al completar la conversión', async () => {
    render(<CreditProvider><UniversalConverter /></CreditProvider>);
    
    // Simular conversión completa
    const dropZone = screen.getByText('O arrastre y suelte su archivo aquí').closest('div');
    const file = new File(['test content'], 'test.mp3', { type: 'audio/mpeg' });
    
    const dragEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dragEvent, 'dataTransfer', {
      value: { files: [file] }
    });
    
    fireEvent(dropZone!, dragEvent);
    
    await waitFor(() => {
      const formatButton = screen.getByText('WAV');
      fireEvent.click(formatButton);
    });
    
    // Esperar a que complete la conversión
    await waitFor(() => {
      expect(screen.getByText('Descargar archivo convertido')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('maneja errores de conversión correctamente', async () => {
    // Mock de error en el servicio
    vi.mocked(require('../services/geminiService').GeminiService.getInstance().convertFile)
      .mockRejectedValueOnce(new Error('Error de conversión'));
    
    render(<CreditProvider><UniversalConverter /></CreditProvider>);
    
    const dropZone = screen.getByText('O arrastre y suelte su archivo aquí').closest('div');
    const file = new File(['test content'], 'test.mp3', { type: 'audio/mpeg' });
    
    const dragEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dragEvent, 'dataTransfer', {
      value: { files: [file] }
    });
    
    fireEvent(dropZone!, dragEvent);
    
    await waitFor(() => {
      const formatButton = screen.getByText('WAV');
      fireEvent.click(formatButton);
    });
    
    // Verificar que se muestra el error
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('permite reiniciar el proceso después de una conversión', async () => {
    render(<CreditProvider><UniversalConverter /></CreditProvider>);
    
    // Completar una conversión
    const dropZone = screen.getByText('O arrastre y suelte su archivo aquí').closest('div');
    const file = new File(['test content'], 'test.mp3', { type: 'audio/mpeg' });
    
    const dragEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dragEvent, 'dataTransfer', {
      value: { files: [file] }
    });
    
    fireEvent(dropZone!, dragEvent);
    
    await waitFor(() => {
      const formatButton = screen.getByText('WAV');
      fireEvent.click(formatButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Descargar archivo convertido')).toBeInTheDocument();
    });
    
    // Hacer clic en "Convertir otro archivo"
    const resetButton = screen.getByText('Convertir otro archivo');
    fireEvent.click(resetButton);
    
    // Verificar que vuelve al estado inicial
    expect(screen.getByText('Explora tus archivos')).toBeInTheDocument();
  });
});

