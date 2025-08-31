import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EbookConverter } from '../EbookConverter';
import { CreditProvider } from '../../../components/CreditSystem';

// Mock de servicios
vi.mock('../services/ebookConversionService', () => ({
  EbookConversionService: {
    getInstance: () => ({
      validateFile: vi.fn().mockResolvedValue({
        success: true,
        data: {
          name: 'test.epub',
          size: 1024000,
          format: 'epub',
          metadata: {
            title: 'Test Book',
            author: 'Test Author',
            description: 'Test Description'
          }
        }
      }),
      startConversion: vi.fn().mockResolvedValue({
        success: true,
        data: 'conversion-job-123'
      })
    })
  }
}));

vi.mock('../services/ebookValidationService', () => ({
  EbookValidationService: {
    getInstance: () => ({
      validateEbook: vi.fn().mockResolvedValue({
        isValid: true,
        quality: 'good',
        issues: [],
        metadata: {
          title: 'Test Book',
          author: 'Test Author'
        }
      })
    })
  }
}));

describe('EbookConverter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza correctamente el componente de e-books', () => {
    render(<CreditProvider><EbookConverter /></CreditProvider>);
    
    expect(screen.getByText('Arrastra tu e-book aquÃ­ o haz clic para seleccionar')).toBeInTheDocument();
    expect(screen.getByText('Formatos soportados:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /seleccionar archivo/i })).toBeInTheDocument();
  });

  it('muestra los formatos soportados correctamente', () => {
    render(<CreditProvider><EbookConverter /></CreditProvider>);
    
    expect(screen.getByText(/PDF, EPUB, MOBI, AZW, AZW3, DOC, DOCX, HTML, RTF, TXT/)).toBeInTheDocument();
  });

  it('maneja la carga de archivos de e-book', async () => {
    render(<CreditProvider><EbookConverter /></CreditProvider>);
    
    const dropZone = screen.getByText('Arrastra tu e-book aquÃ­ o haz clic para seleccionar').closest('div');
    const file = new File(['test content'], 'test.epub', { type: 'application/epub+zip' });
    
    // Simular drag and drop
    const dragEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dragEvent, 'dataTransfer', {
      value: { files: [file] }
    });
    
    fireEvent(dropZone!, dragEvent);
    
    // Verificar que el archivo se procesa
    await waitFor(() => {
      expect(screen.getByText('test.epub')).toBeInTheDocument();
    });
  });

  it('muestra el estado de validaciÃ³n durante la carga', async () => {
    render(<CreditProvider><EbookConverter /></CreditProvider>);
    
    const dropZone = screen.getByText('Arrastra tu e-book aquÃ­ o haz clic para seleccionar').closest('div');
    const file = new File(['test content'], 'test.epub', { type: 'application/epub+zip' });
    
    const dragEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dragEvent, 'dataTransfer', {
      value: { files: [file] }
    });
    
    fireEvent(dropZone!, dragEvent);
    
    // Verificar que muestra estado de validaciÃ³n
    expect(screen.getByText('Validando archivo...')).toBeInTheDocument();
  });

  it('muestra los metadatos despuÃ©s de la validaciÃ³n exitosa', async () => {
    render(<CreditProvider><EbookConverter /></CreditProvider>);
    
    const dropZone = screen.getByText('Arrastra tu e-book aquÃ­ o haz clic para seleccionar').closest('div');
    const file = new File(['test content'], 'test.epub', { type: 'application/epub+zip' });
    
    const dragEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dragEvent, 'dataTransfer', {
      value: { files: [file] }
    });
    
    fireEvent(dropZone!, dragEvent);
    
    // Esperar a que aparezcan los metadatos
    await waitFor(() => {
      expect(screen.getByText('Test Book')).toBeInTheDocument();
      expect(screen.getByText('Test Author')).toBeInTheDocument();
    });
  });

  it('muestra el selector de formato despuÃ©s de cargar un archivo vÃ¡lido', async () => {
    render(<CreditProvider><EbookConverter /></CreditProvider>);
    
    const dropZone = screen.getByText('Arrastra tu e-book aquÃ­ o haz clic para seleccionar').closest('div');
    const file = new File(['test content'], 'test.epub', { type: 'application/epub+zip' });
    
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

  it('permite seleccionar diferentes formatos de salida', async () => {
    render(<CreditProvider><EbookConverter /></CreditProvider>);
    
    // Cargar archivo
    const dropZone = screen.getByText('Arrastra tu e-book aquÃ­ o haz clic para seleccionar').closest('div');
    const file = new File(['test content'], 'test.epub', { type: 'application/epub+zip' });
    
    const dragEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dragEvent, 'dataTransfer', {
      value: { files: [file] }
    });
    
    fireEvent(dropZone!, dragEvent);
    
    // Esperar a que aparezca el selector
    await waitFor(() => {
      expect(screen.getByText('PDF')).toBeInTheDocument();
      expect(screen.getByText('MOBI')).toBeInTheDocument();
      expect(screen.getByText('AZW3')).toBeInTheDocument();
    });
  });

  it('inicia la conversiÃ³n al seleccionar un formato', async () => {
    render(<CreditProvider><EbookConverter /></CreditProvider>);
    
    // Cargar archivo
    const dropZone = screen.getByText('Arrastra tu e-book aquÃ­ o haz clic para seleccionar').closest('div');
    const file = new File(['test content'], 'test.epub', { type: 'application/epub+zip' });
    
    const dragEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dragEvent, 'dataTransfer', {
      value: { files: [file] }
    });
    
    fireEvent(dropZone!, dragEvent);
    
    // Seleccionar formato PDF
    await waitFor(() => {
      const pdfButton = screen.getByText('PDF');
      fireEvent.click(pdfButton);
    });
    
    // Verificar que inicia la conversiÃ³n
    await waitFor(() => {
      expect(screen.getByText('Convirtiendo a PDF...')).toBeInTheDocument();
    });
  });

  it('muestra el progreso de conversiÃ³n con barra de progreso', async () => {
    render(<CreditProvider><EbookConverter /></CreditProvider>);
    
    // Simular proceso completo
    const dropZone = screen.getByText('Arrastra tu e-book aquÃ­ o haz clic para seleccionar').closest('div');
    const file = new File(['test content'], 'test.epub', { type: 'application/epub+zip' });
    
    const dragEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dragEvent, 'dataTransfer', {
      value: { files: [file] }
    });
    
    fireEvent(dropZone!, dragEvent);
    
    await waitFor(() => {
      const pdfButton = screen.getByText('PDF');
      fireEvent.click(pdfButton);
    });
    
    // Verificar elementos de progreso
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('maneja errores de validaciÃ³n correctamente', async () => {
    // Mock de error en validaciÃ³n
    vi.mocked(require('../services/ebookConversionService').EbookConversionService.getInstance().validateFile)
      .mockResolvedValueOnce({
        success: false,
        error: 'Formato de archivo no soportado'
      });
    
    render(<CreditProvider><EbookConverter /></CreditProvider>);
    
    const dropZone = screen.getByText('Arrastra tu e-book aquÃ­ o haz clic para seleccionar').closest('div');
    const file = new File(['invalid content'], 'test.txt', { type: 'text/plain' });
    
    const dragEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dragEvent, 'dataTransfer', {
      value: { files: [file] }
    });
    
    fireEvent(dropZone!, dragEvent);
    
    // Verificar que se muestra el error
    await waitFor(() => {
      expect(screen.getByText('Formato de archivo no soportado')).toBeInTheDocument();
    });
  });

  it('permite reiniciar el proceso despuÃ©s de un error', async () => {
    // Mock de error
    vi.mocked(require('../services/ebookConversionService').EbookConversionService.getInstance().validateFile)
      .mockResolvedValueOnce({
        success: false,
        error: 'Error de validaciÃ³n'
      });
    
    render(<CreditProvider><EbookConverter /></CreditProvider>);
    
    const dropZone = screen.getByText('Arrastra tu e-book aquÃ­ o haz clic para seleccionar').closest('div');
    const file = new File(['test content'], 'test.epub', { type: 'application/epub+zip' });
    
    const dragEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dragEvent, 'dataTransfer', {
      value: { files: [file] }
    });
    
    fireEvent(dropZone!, dragEvent);
    
    await waitFor(() => {
      expect(screen.getByText('Error de validaciÃ³n')).toBeInTheDocument();
    });
    
    // Hacer clic en "Intentar de nuevo"
    const retryButton = screen.getByText('Intentar de nuevo');
    fireEvent.click(retryButton);
    
    // Verificar que vuelve al estado inicial
    expect(screen.getByText('Arrastra tu e-book aquÃ­ o haz clic para seleccionar')).toBeInTheDocument();
  });

  it('muestra el historial de conversiones', async () => {
    render(<CreditProvider><EbookConverter /></CreditProvider>);
    
    // Completar una conversiÃ³n
    const dropZone = screen.getByText('Arrastra tu e-book aquÃ­ o haz clic para seleccionar').closest('div');
    const file = new File(['test content'], 'test.epub', { type: 'application/epub+zip' });
    
    const dragEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dragEvent, 'dataTransfer', {
      value: { files: [file] }
    });
    
    fireEvent(dropZone!, dragEvent);
    
    await waitFor(() => {
      const pdfButton = screen.getByText('PDF');
      fireEvent.click(pdfButton);
    });
    
    // Verificar que aparece en el historial
    await waitFor(() => {
      expect(screen.getByText('Historial de conversiones')).toBeInTheDocument();
      expect(screen.getByText('test.epub â†’ PDF')).toBeInTheDocument();
    });
  });

  it('valida tipos de archivo soportados', async () => {
    render(<CreditProvider><EbookConverter /></CreditProvider>);
    
    const dropZone = screen.getByText('Arrastra tu e-book aquÃ­ o haz clic para seleccionar').closest('div');
    
    // Intentar cargar un archivo no soportado
    const file = new File(['test content'], 'test.mp3', { type: 'audio/mpeg' });
    
    const dragEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dragEvent, 'dataTransfer', {
      value: { files: [file] }
    });
    
    fireEvent(dropZone!, dragEvent);
    
    // Verificar que se rechaza el archivo
    await waitFor(() => {
      expect(screen.getByText(/formato no soportado/i)).toBeInTheDocument();
    });
  });
});


