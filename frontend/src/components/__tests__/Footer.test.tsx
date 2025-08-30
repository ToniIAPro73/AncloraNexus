import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { Footer } from '../Footer';

describe('Footer Component', () => {
    it('renders contact information correctly', () => {
        render(<Footer />);
        expect(screen.getByText('contact@online-file-converter.com')).toBeInTheDocument();
        expect(screen.getByText('Ve al chat')).toBeInTheDocument();
    });

    it('renders all navigation columns', () => {
        render(<Footer />);
        // Check for column titles
        expect(screen.getByRole('heading', { name: 'Convertir' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Comprimir' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Herramientas PDF' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Acerca de' })).toBeInTheDocument();
    });

    it('renders the language selector and main login button', () => {
        render(<Footer />);
        expect(screen.getByRole('button', { name: /EspaÃ±ol/i })).toBeInTheDocument();
        // The footer has a login button as well
        expect(screen.getAllByRole('link', { name: 'Iniciar sesiÃ³n' })).toHaveLength(1);
    });

    it('renders legal links', () => {
        render(<Footer />);
        expect(screen.getByRole('link', { name: 'Aviso legal' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'PolÃ­tica de privacidad' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'TÃ©rminos y condiciones generales' })).toBeInTheDocument();
    });

    it('renders payment icons and copyright notice', () => {
        render(<Footer />);
        expect(screen.getByText('Pagos seguros')).toBeInTheDocument();
        expect(screen.getByText(/Â© 2023 online-file-converter./)).toBeInTheDocument();
        // Check for svg icons by their container
        const paymentContainer = screen.getByText('Pagos seguros').parentElement;
        expect(paymentContainer?.querySelectorAll('svg').length).toBeGreaterThanOrEqual(2);
    });
});

