import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { SupportedFormats } from '../SupportedFormats';

describe('SupportedFormats Component', () => {
    it('renders the component with the default category (audio) active', () => {
        render(<SupportedFormats />);
        expect(screen.getByRole('heading', { name: /O consulte todos nuestros formatos compatibles/i })).toBeInTheDocument();
        
        // Check if 'Audio' tab is active
        const audioTab = screen.getByRole('button', { name: /Audio/i });
        expect(audioTab).toHaveClass('text-green-600');
        
        // Check if some audio formats are displayed
        expect(screen.getByText('MP3')).toBeInTheDocument();
        expect(screen.getByText('WAV')).toBeInTheDocument();
    });

    it('changes the displayed formats when a new category tab is clicked', () => {
        render(<SupportedFormats />);
        
        // Initially, document formats should not be visible
        expect(screen.queryByText('PDF')).not.toBeInTheDocument();
        expect(screen.queryByText('DOCX')).not.toBeInTheDocument();

        // Click on the 'Documento' tab
        const documentTab = screen.getByRole('button', { name: /Documento/i });
        fireEvent.click(documentTab);

        // 'Documento' tab should now be active
        expect(documentTab).toHaveClass('text-green-600');
        
        // Now, document formats should be visible
        expect(screen.getByText('PDF')).toBeInTheDocument();
        expect(screen.getByText('DOCX')).toBeInTheDocument();

        // And audio formats should be gone
        expect(screen.queryByText('MP3')).not.toBeInTheDocument();
    });
});

