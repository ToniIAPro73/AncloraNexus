import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import FormatsView from '../FormatsView';

describe('FormatsView Component', () => {
    it('renders the component with loading state', () => {
        render(<FormatsView />);
        // Check if loading state is shown
        expect(screen.getByText('Cargando formatos...')).toBeInTheDocument();
    });

    it('renders loading state initially', () => {
        render(<FormatsView />);

        // Should show loading message
        expect(screen.getByText('Cargando formatos...')).toBeInTheDocument();
        expect(screen.queryByText('MP3')).not.toBeInTheDocument();
    });
});

