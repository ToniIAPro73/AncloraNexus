import React from 'react';

/**
 * Placeholder component for converting plain text into a document format.
 */
export const TextToDocConverter: React.FC = () => (
  <div className="p-4">
    <h2 className="text-h2 font-semibold">Text to Document Converter</h2>
    <p className="text-slate-600">Paste some text and receive a downloadable document.</p>
  </div>
);

export default TextToDocConverter;

