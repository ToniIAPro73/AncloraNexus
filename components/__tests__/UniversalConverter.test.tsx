import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { UniversalConverter } from '../UniversalConverter';

vi.useFakeTimers();

describe('UniversalConverter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.alert = vi.fn();
    });

    it('renders the initial idle state correctly', () => {
        render(<UniversalConverter />);
        expect(screen.getByText('Explora tus archivos')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Elige un archivo/i })).toBeInTheDocument();
    });

    it('transitions to uploaded state and shows correct info for an image file', async () => {
        render(<UniversalConverter />);
        
        const mockFile = new File(['image content'], 'photo.jpg', { type: 'image/jpeg' });
        // The file input is hidden, we need to find it differently
        const uploaderContainer = screen.getByText('Elige un archivo').closest('div');
        const fileInput = uploaderContainer?.querySelector('input[type="file"]');
        
        expect(fileInput).not.toBeNull();

        fireEvent.change(fileInput!, { target: { files: [mockFile] } });
        
        await waitFor(() => {
            expect(screen.getByText('photo.jpg')).toBeInTheDocument();
            expect(screen.getByText('Selecciona tu formato')).toBeInTheDocument();
            expect(screen.getByRole('button', {name: /Convertir ahora/i})).toBeInTheDocument();
            // Check for image icon
            expect(screen.getByText('photo.jpg').previousElementSibling?.querySelector('svg')).toBeInTheDocument();
        });
    });
    
    it('shows an alert for unsupported file types', async () => {
        render(<UniversalConverter />);
        const mockFile = new File(['content'], 'file.unsupported', { type: 'application/octet-stream' });
        const uploaderContainer = screen.getByText('Elige un archivo').closest('div');
        const fileInput = uploaderContainer?.querySelector('input[type="file"]');
        
        fireEvent.change(fileInput!, { target: { files: [mockFile] } });
        
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith("This file type is not supported for conversion or has no available target formats.");
        });
    });

    it('enables convert button only after selecting a format', async () => {
        render(<UniversalConverter />);
        const mockFile = new File(['image'], 'image.png', { type: 'image/png' });
        const uploaderContainer = screen.getByText('Elige un archivo').closest('div');
        const fileInput = uploaderContainer?.querySelector('input[type="file"]');

        fireEvent.change(fileInput!, { target: { files: [mockFile] } });

        const convertButton = await screen.findByRole('button', { name: /Convertir ahora/i });
        expect(convertButton).toBeDisabled();
        
        const formatSelectorButton = screen.getByText('Selecciona tu formato');
        fireEvent.click(formatSelectorButton);

        const jpgOption = await screen.findByRole('button', { name: 'JPG' });
        fireEvent.click(jpgOption);

        expect(convertButton).not.toBeDisabled();
    });

    it('shows loading and success states on conversion', async () => {
        render(<UniversalConverter />);
        const mockFile = new File(['image'], 'image.png', { type: 'image/png' });
        const uploaderContainer = screen.getByText('Elige un archivo').closest('div');
        const fileInput = uploaderContainer?.querySelector('input[type="file"]');

        fireEvent.change(fileInput!, { target: { files: [mockFile] } });
        
        const formatSelectorButton = await screen.findByText('Selecciona tu formato');
        fireEvent.click(formatSelectorButton);
        fireEvent.click(await screen.findByRole('button', { name: 'JPG' }));

        const convertButton = await screen.findByRole('button', { name: /Convertir ahora/i });
        fireEvent.click(convertButton);
        
        expect(screen.getByText('Convirtiendo tu archivo...')).toBeInTheDocument();

        vi.runAllTimers();

        await waitFor(() => {
            expect(screen.getByText('Conversion Complete!')).toBeInTheDocument();
            expect(screen.getByText('image.png')).toBeInTheDocument();
            expect(screen.getByText('JPG')).toBeInTheDocument();
            expect(screen.getByText('image.jpg')).toBeInTheDocument();
        });
    });

    it('resets the view when "Convert Another" is clicked from success state', async () => {
        render(<UniversalConverter />);
        const mockFile = new File(['image'], 'image.png', { type: 'image/png' });
        const uploaderContainer = screen.getByText('Elige un archivo').closest('div');
        const fileInput = uploaderContainer?.querySelector('input[type="file"]');
        fireEvent.change(fileInput!, { target: { files: [mockFile] } });
        
        const formatSelectorButton = await screen.findByText('Selecciona tu formato');
        fireEvent.click(formatSelectorButton);
        fireEvent.click(await screen.findByRole('button', { name: 'JPG' }));

        fireEvent.click(await screen.findByRole('button', { name: /Convertir ahora/i }));
        vi.runAllTimers();
        
        const convertAnotherButton = await screen.findByRole('button', { name: 'Convert Another' });
        fireEvent.click(convertAnotherButton);
        
        await waitFor(() => {
            expect(screen.getByText('Explora tus archivos')).toBeInTheDocument();
        });
    });

    it('resets the view when "Cancelar" is clicked from uploaded state', async () => {
        render(<UniversalConverter />);
        const mockFile = new File(['audio'], 'song.mp3', { type: 'audio/mpeg' });
        const uploaderContainer = screen.getByText('Elige un archivo').closest('div');
        const fileInput = uploaderContainer?.querySelector('input[type="file"]');
        fireEvent.change(fileInput!, { target: { files: [mockFile] } });

        const cancelButton = await screen.findByRole('button', { name: /Cancelar/i });
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(screen.getByText('Explora tus archivos')).toBeInTheDocument();
        });
    });
    
    it('shows PDF as a target for image files', async () => {
        render(<UniversalConverter />);
        const mockFile = new File(['image'], 'image.png', { type: 'image/png' });
        const uploaderContainer = screen.getByText('Elige un archivo').closest('div');
        const fileInput = uploaderContainer?.querySelector('input[type="file"]');
        fireEvent.change(fileInput!, { target: { files: [mockFile] } });
        
        const formatSelectorButton = await screen.findByText('Selecciona tu formato');
        fireEvent.click(formatSelectorButton);
        
        expect(await screen.findByRole('button', { name: 'PDF' })).toBeInTheDocument();
    });

    it('shows font formats as targets for SVG files', async () => {
        render(<UniversalConverter />);
        const mockFile = new File(['svg content'], 'icon.svg', { type: 'image/svg+xml' });
        const uploaderContainer = screen.getByText('Elige un archivo').closest('div');
        const fileInput = uploaderContainer?.querySelector('input[type="file"]');
        fireEvent.change(fileInput!, { target: { files: [mockFile] } });
        
        const formatSelectorButton = await screen.findByText('Selecciona tu formato');
        fireEvent.click(formatSelectorButton);
        
        expect(await screen.findByRole('button', { name: 'EOT' })).toBeInTheDocument();
        expect(await screen.findByRole('button', { name: 'OTF' })).toBeInTheDocument();
    });

    it('handles ebook conversion flow correctly', async () => {
        render(<UniversalConverter />);
        const mockFile = new File(['ebook content'], 'book.azw', { type: 'application/octet-stream' });
        const uploaderContainer = screen.getByText('Elige un archivo').closest('div');
        const fileInput = uploaderContainer?.querySelector('input[type="file"]');
        fireEvent.change(fileInput!, { target: { files: [mockFile] } });
        
        const formatSelectorButton = await screen.findByText('Selecciona tu formato');
        fireEvent.click(formatSelectorButton);
        
        expect(await screen.findByRole('button', { name: 'EPUB' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'EPUB' }));

        fireEvent.click(screen.getByRole('button', { name: /Convertir ahora/i }));

        vi.runAllTimers();

        await waitFor(() => {
            expect(screen.getByText('Conversion Complete!')).toBeInTheDocument();
            expect(screen.getByText('book.epub')).toBeInTheDocument();
        });
    });
});