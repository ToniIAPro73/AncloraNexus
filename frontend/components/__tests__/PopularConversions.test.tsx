import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { PopularConversions } from '../PopularConversions';

describe('PopularConversions Component', () => {
    it('renders the component with the default category (ebook) active', () => {
        render(<PopularConversions />);
        expect(screen.getByRole('heading', { name: /Accede rápidamente a nuestras solicitudes de conversión más populares/i })).toBeInTheDocument();
        
        // Check if 'Ebook' is the active category
        const ebookButton = screen.getByRole('button', { name: /Ebook/i });
        expect(ebookButton).toHaveClass('bg-blue-100');
        
        // Check if some ebook conversions are displayed
        expect(screen.getByRole('button', { name: /AZW a AZW3/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /AZW a EPUB/i })).toBeInTheDocument();
    });

    it('changes the displayed conversions when a new category is clicked', () => {
        render(<PopularConversions />);
        
        // Initially, video conversions should not be visible
        expect(screen.queryByRole('button', { name: /MOV a MP4/i })).not.toBeInTheDocument();

        // Click on the 'Video' category
        const videoButton = screen.getByRole('button', { name: /Video/i });
        fireEvent.click(videoButton);

        // 'Video' button should now be active
        expect(videoButton).toHaveClass('bg-blue-100');
        
        // Now, video conversions should be visible
        expect(screen.getByRole('button', { name: /MOV a MP4/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /MKV a MP4/i })).toBeInTheDocument();

        // And ebook conversions should be gone
        expect(screen.queryByRole('button', { name: /AZW a AZW3/i })).not.toBeInTheDocument();
    });
});
