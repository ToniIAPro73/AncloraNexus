import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Extend the global type for our custom globals.
// This is needed because these libraries are loaded from a CDN in the app,
// but we mock them globally in the test environment.
declare global {
  // eslint-disable-next-line no-var
  var mammoth: any;
  // eslint-disable-next-line no-var
  var pdfjsLib: any;
  // eslint-disable-next-line no-var
  var showdown: any;
  // eslint-disable-next-line no-var
  var htmlToDocx: any;
}


// Mock for window.matchMedia, which is not implemented in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock for clipboard API
Object.defineProperty(navigator, 'clipboard', {
    value: {
        writeText: vi.fn().mockResolvedValue(undefined),
    },
    writable: true,
});

// Mock for CDN-loaded libraries
(window as any).mammoth = {
    extractRawText: vi.fn(),
};

(window as any).pdfjsLib = {
    GlobalWorkerOptions: { workerSrc: '' },
    getDocument: vi.fn(),
};

(window as any).showdown = {
    Converter: vi.fn().mockImplementation(() => ({
        makeHtml: (text: string) => `<p>${text}</p>`, // Simple mock
    })),
};

(window as any).htmlToDocx = vi.fn().mockResolvedValue(new Blob(['docx content']));

// Mock for window.print
window.print = vi.fn();
// Mock for window.alert
window.alert = vi.fn();

// Mock window.open to simulate popup behavior for PDF generation
window.open = vi.fn().mockReturnValue({
    document: {
        write: vi.fn(),
        close: vi.fn(),
    },
    focus: vi.fn(),
    print: vi.fn(),
    close: vi.fn(),
});

// Mock URL.createObjectURL and URL.revokeObjectURL
URL.createObjectURL = vi.fn(() => 'blob:http://localhost:5173/mock-url');
URL.revokeObjectURL = vi.fn();

// Mock scrollIntoView as it's not implemented in JSDOM
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Prevent tests from navigating the JSDOM window
const originalLocation = window.location;
Object.defineProperty(window, 'location', {
  configurable: true,
  value: {
    ...originalLocation,
    assign: vi.fn(),
  },
});
