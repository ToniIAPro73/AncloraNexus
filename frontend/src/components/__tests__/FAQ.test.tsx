import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { FAQ } from '../FAQ';

describe('FAQ Component', () => {
  it('renders with the default tab "Conversions" active and first question open', () => {
    render(<FAQ />);
    const conversionsTab = screen.getByRole('button', { name: 'Conversions' });
    expect(conversionsTab).toHaveClass('border-green-500');

    // Check that the first question is open by checking for its answer
    expect(screen.getByText(/En, estamos orgullosos de ofrecer una plataforma versátil/i)).toBeInTheDocument();
    
    // Check that the second question is closed
    expect(screen.queryByText(/Sí, el límite de tamaño depende de tu plan de suscripción/i)).not.toBeInTheDocument();
  });

  it('opens and closes questions on click', () => {
    render(<FAQ />);
    const secondQuestionButton = screen.getByRole('button', { name: /¿Hay un límite de tamaño máximo para los archivos que se pueden convertir?/i });

    // Answer should not be visible initially
    expect(screen.queryByText(/Sí, el límite de tamaño depende de tu plan de suscripción/i)).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(secondQuestionButton);
    expect(screen.getByText(/Sí, el límite de tamaño depende de tu plan de suscripción/i)).toBeInTheDocument();

    // Click again to close
    fireEvent.click(secondQuestionButton);
    expect(screen.queryByText(/Sí, el límite de tamaño depende de tu plan de suscripción/i)).not.toBeInTheDocument();
  });

  it('switches tabs and content on tab click', () => {
    render(<FAQ />);
    const accountTabButton = screen.getByRole('button', { name: 'Cuenta' });
    
    // Default tab content is visible
    expect(screen.getByText(/¿Qué tipos de archivos puedo convertir con?/i)).toBeInTheDocument();

    // Click on 'Account' tab
    fireEvent.click(accountTabButton);

    // Account tab should be active
    expect(accountTabButton).toHaveClass('border-green-500');
    
    // Default tab content should be gone
    expect(screen.queryByText(/¿Qué tipos de archivos puedo convertir con?/i)).not.toBeInTheDocument();
    
    // New tab's first question should be visible and open
    expect(screen.getByText(/¿Cómo puedo crear una cuenta?/i)).toBeInTheDocument();
    expect(screen.getByText(/Crear una cuenta es un proceso sin complicaciones./i)).toBeInTheDocument();
  });
});
