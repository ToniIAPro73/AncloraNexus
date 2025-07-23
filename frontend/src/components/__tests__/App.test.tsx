import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import App from '../../../App';

describe('App Component', () => {
  it('renders all main sections of the application', () => {
    render(<App />);
    
    // Header
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    
    // Main Title
    expect(screen.getByText('Convierte cualquier archivo')).toBeInTheDocument();
    
    // Universal Converter
    expect(screen.getByText('Explora tus archivos')).toBeInTheDocument();
    
    // Features
    expect(screen.getByText('Es fácil')).toBeInTheDocument();
    expect(screen.getByText('Es seguro')).toBeInTheDocument();
    expect(screen.getByText('Es ilimitado')).toBeInTheDocument();
    
    // Popular Conversions
    expect(screen.getByText(/Accede rápidamente a nuestras solicitudes de conversión más populares/i)).toBeInTheDocument();
    
    // Supported Formats
    expect(screen.getByText(/O consulte todos nuestros formatos compatibles/i)).toBeInTheDocument();
    
    // FAQ
    expect(screen.getByText(/¿Puede que tenga algunas preguntas?/i)).toBeInTheDocument();

    // Footer
    expect(screen.getByText(/¿Todavía tienes una pregunta?/i)).toBeInTheDocument();
    expect(screen.getByText('© 2023 online-file-converter.')).toBeInTheDocument();
  });

  it('scrolls to the converter when "Comienza a convertir" button is clicked', () => {
    const scrollIntoViewMock = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
    
    render(<App />);
    
    const startConvertingButton = screen.getByRole('button', { name: /Comienza a convertir/i });
    fireEvent.click(startConvertingButton);
    
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
  });
});