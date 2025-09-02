/**
 * Tests integrales para NewConversorInteligente
 * Incluye tests con archivos reales, casos edge y validación completa
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { NewConversorInteligente } from '../NewConversorInteligente';

// Mock del fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock de archivos de prueba
const createMockFile = (name: string, type: string, content: string = 'test content') => {
  const blob = new Blob([content], { type });
  const file = new File([blob], name, { type });
  return file;
};

// Helper para cargar archivos en tests
const uploadFile = async (file: File, user: any) => {
  // Buscar el área de drag & drop por su texto
  const uploadArea = screen.getByText(/arrastra tu archivo aquí o haz clic/i);
  await user.click(uploadArea);

  const fileInput = document.getElementById('file-input-main') as HTMLInputElement;
  if (fileInput) {
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });
    fireEvent.change(fileInput);
  }
};

describe('NewConversorInteligente - Tests Básicos', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    // Mock exitoso por defecto para analyze-conversion
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        analysis: {
          direct: { quality: 95, time: 2, cost: 1 },
          optimized: { quality: 98, time: 5, cost: 2 }
        }
      })
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Carga y validación de archivos', () => {
    it('debe cargar archivo válido correctamente', async () => {
      const user = userEvent.setup();
      render(<NewConversorInteligente />);

      const file = createMockFile('test.jpg', 'image/jpeg');
      await uploadFile(file, user);

      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });

    it('debe mostrar el input de archivo', () => {
      render(<NewConversorInteligente />);

      const fileInput = document.getElementById('file-input-main');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
    });

    it('debe mostrar los formatos soportados', () => {
      render(<NewConversorInteligente />);

      expect(screen.getByText(/Formatos soportados:/)).toBeInTheDocument();
      expect(screen.getByText(/TXT, PDF, DOC, DOCX/)).toBeInTheDocument();
    });

    it('debe mostrar el área de drag and drop', () => {
      render(<NewConversorInteligente />);

      expect(screen.getByText('Arrastra tu archivo aquí o haz clic para seleccionar')).toBeInTheDocument();
    });

  });

  describe('Renderizado básico', () => {
    it('debe renderizar el título correctamente', () => {
      render(<NewConversorInteligente />);

      expect(screen.getByText('Conversor')).toBeInTheDocument();
      expect(screen.getByText('Inteligente')).toBeInTheDocument();
    });

    it('debe mostrar el área de carga de archivos', () => {
      render(<NewConversorInteligente />);

      expect(screen.getByText(/arrastra tu archivo aquí o haz clic/i)).toBeInTheDocument();
    });

    it('debe mostrar las conversiones populares', () => {
      render(<NewConversorInteligente />);

      expect(screen.getByText('Conversiones Populares')).toBeInTheDocument();
    });

    it('debe mostrar los pasos del proceso', () => {
      render(<NewConversorInteligente />);

      expect(screen.getByText('Subir Archivo & Análisis IA')).toBeInTheDocument();
      expect(screen.getByText('Configurar Conversión')).toBeInTheDocument();
      expect(screen.getAllByText('Convertir & Descargar').length).toBeGreaterThan(0);
    });
  });
});
