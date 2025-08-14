import React, { useState, useEffect, useCallback } from 'react';
import { FileUploader } from './FileUploader';

interface QueueItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'processing' | 'completed';
  classification: 'valid' | 'salvageable' | 'unsalvageable';
}

export const UniversalConverter: React.FC = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [processing, setProcessing] = useState(false);

  const classifyFile = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const replacements = text.split('\ufffd').length - 1;
      if (!replacements) return 'valid';
      const ratio = replacements / (text.length || 1);
      return ratio < 0.3 ? 'salvageable' : 'unsalvageable';
    } catch {
      return 'unsalvageable';
    }
  }, []);

  const handleFileSelect = useCallback(async (files: File | File[]) => {
    const list = Array.isArray(files) ? files : [files];
    const items: QueueItem[] = [];
    for (const file of list) {
      const classification = await classifyFile(file);
      items.push({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: 'pending',
        classification,
      });
    }
    setQueue(prev => [...prev, ...items]);
  }, [classifyFile]);

  useEffect(() => {
    if (!processing) {
      const next = queue.find(item => item.status === 'pending');
      if (next) {
        startConversion(next);
      }
    }
  }, [queue, processing]);

  const startConversion = (item: QueueItem) => {
    setProcessing(true);
    setQueue(prev =>
      prev.map(q =>
        q.id === item.id ? { ...q, status: 'processing', progress: 0 } : q
      )
    );

    const interval = setInterval(() => {
      setQueue(prev =>
        prev.map(q =>
          q.id === item.id
            ? { ...q, progress: Math.min(q.progress + 10, 100) }
            : q
        )
      );
    }, 200);


    setTimeout(() => {
      clearInterval(interval);
      setQueue(prev =>
        prev.map(q =>
          q.id === item.id
            ? { ...q, progress: 100, status: 'completed' }
            : q
        )
      );
      setProcessing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Conversor Inteligente</h1>
      <FileUploader onFileSelect={handleFileSelect} isLoading={processing} multiple>
        <div className="p-6 border-2 border-dashed rounded-md text-center">
          <p className="text-sm mb-2">Haz clic o arrastra archivos aquí</p>
          <button className="bg-primary text-white px-4 py-2 rounded">
            Seleccionar archivos
          </button>
        </div>
      </FileUploader>
      {queue.length > 0 && (
        <div className="space-y-3">
          {queue.map(item => (
            <div key={item.id} className="p-4 border rounded-md">
              <div className="flex justify-between mb-1">
                <span className="truncate">{item.file.name}</span>
                <span className="text-sm">{item.progress}%</span>
              </div>
              <p className="text-xs mb-1">Clasificación: {item.classification}</p>
              <div className="w-full bg-gray-200 h-2 rounded">
                <div
                  className="bg-green-500 h-2 rounded"
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
