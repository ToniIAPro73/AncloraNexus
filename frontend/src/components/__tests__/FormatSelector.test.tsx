import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { FormatSelector } from '../FormatSelector';
import { FileCategory } from '../../utils/conversionMaps';

const mockAvailableFormats: Partial<Record<FileCategory, string[]>> = {
    image: ['JPG', 'PNG', 'WEBP'],
    document: ['PDF', 'DOCX'],
    video: ['MP4', 'MOV'],
};

describe('FormatSelector Component', () => {
    
    it('renders with a placeholder when no format is selected', () => {
        render(<FormatSelector availableFormats={mockAvailableFormats} onSelectFormat={() => {}} selectedFormat={null} />);
        expect(screen.getByText('Selecciona tu formato')).toBeInTheDocument();
    });

    it('displays the selected format', () => {
        render(<FormatSelector availableFormats={mockAvailableFormats} onSelectFormat={() => {}} selectedFormat="PNG" />);
        expect(screen.getByText('PNG')).toBeInTheDocument();
    });

    it('opens and closes the format list on button click', () => {
        render(<FormatSelector availableFormats={mockAvailableFormats} onSelectFormat={() => {}} selectedFormat={null} />);
        const toggleButton = screen.getByRole('button', { name: /Selecciona tu formato/i });

        // List should be closed initially
        expect(screen.queryByPlaceholderText('Search formats...')).not.toBeInTheDocument();

        // Open the list
        fireEvent.click(toggleButton);
        expect(screen.getByPlaceholderText('Search formats...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'JPG' })).toBeInTheDocument();

        // Close the list by clicking the main button again
        fireEvent.click(toggleButton);
        expect(screen.queryByPlaceholderText('Search formats...')).not.toBeInTheDocument();
    });

    it('displays category filters and all formats when opened', () => {
        render(<FormatSelector availableFormats={mockAvailableFormats} onSelectFormat={() => {}} selectedFormat={null} />);
        fireEvent.click(screen.getByRole('button', { name: /Selecciona tu formato/i }));

        // Check for category buttons
        expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Image' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Document' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Video' })).toBeInTheDocument();
        
        // 'All' is active by default, check all formats are visible
        expect(screen.getByRole('button', { name: 'JPG' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'DOCX' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'MP4' })).toBeInTheDocument();
    });

    it('filters formats when a category is selected', () => {
        render(<FormatSelector availableFormats={mockAvailableFormats} onSelectFormat={() => {}} selectedFormat={null} />);
        fireEvent.click(screen.getByRole('button', { name: /Selecciona tu formato/i }));

        // Click on 'Document' category
        fireEvent.click(screen.getByRole('button', { name: 'Document' }));
        
        // Only document formats should be visible
        expect(screen.getByRole('button', { name: 'PDF' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'DOCX' })).toBeInTheDocument();
        
        // Image and video formats should be hidden
        expect(screen.queryByRole('button', { name: 'JPG' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'MP4' })).not.toBeInTheDocument();
    });

    it('filters formats based on search input within the active category', () => {
        render(<FormatSelector availableFormats={mockAvailableFormats} onSelectFormat={() => {}} selectedFormat={null} />);
        fireEvent.click(screen.getByRole('button', { name: /Selecciona tu formato/i }));

        const searchInput = screen.getByPlaceholderText('Search formats...');

        // Search with 'All' category active
        fireEvent.change(searchInput, { target: { value: 'p' } });
        expect(screen.getByRole('button', { name: 'JPG' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'WEBP' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'PNG' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'PDF' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'MP4' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'DOCX' })).not.toBeInTheDocument();

        // Change category to 'Image' and search again
        fireEvent.click(screen.getByRole('button', { name: 'Image' }));
        fireEvent.change(searchInput, { target: { value: 'p' } });
        expect(screen.getByRole('button', { name: 'JPG' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'WEBP' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'PNG' })).toBeInTheDocument();
        // PDF and MP4 should not be visible now
        expect(screen.queryByRole('button', { name: 'PDF' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'MP4' })).not.toBeInTheDocument();
    });

    it('calls onSelectFormat and closes when a format is chosen', () => {
        const handleSelect = vi.fn();
        render(<FormatSelector availableFormats={mockAvailableFormats} onSelectFormat={handleSelect} selectedFormat={null} />);
        
        fireEvent.click(screen.getByRole('button', { name: /Selecciona tu formato/i }));
        fireEvent.click(screen.getByRole('button', { name: 'DOCX' }));

        expect(handleSelect).toHaveBeenCalledWith('DOCX');
        // Dropdown should close
        expect(screen.queryByPlaceholderText('Search formats...')).not.toBeInTheDocument();
    });

    it('shows a message when no formats match the search', () => {
        render(<FormatSelector availableFormats={mockAvailableFormats} onSelectFormat={() => {}} selectedFormat={null} />);
        fireEvent.click(screen.getByRole('button', { name: /Selecciona tu formato/i }));

        const searchInput = screen.getByPlaceholderText('Search formats...');
        fireEvent.change(searchInput, { target: { value: 'nonexistentformat' } });
        
        expect(screen.getByText('No matching formats.')).toBeInTheDocument();
    });
});
