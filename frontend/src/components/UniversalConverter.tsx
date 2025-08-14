import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { apiService } from '../services/api';
import { FileUploader } from './FileUploader';

interface PhaseProgress {
  preprocess: number;
  convert: number;
  postprocess: number;
}

interface QueueItem {
  id: string;
  file: File;
  progress: PhaseProgress;
  status: 'pending' | 'processing' | 'completed';
}

export const UniversalConverter: React.FC = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const handleFileSelect = useCallback((files: File | File[]) => {
    const list = Array.isArray(files) ? files : [files];
    const items = list.map(file => ({
      id: crypto.randomUUID(),
      file,
      progress: { preprocess: 0, convert: 0, postprocess: 0 },
      status: 'pending' as const,
    }));
    setQueue(prev => [...prev, ...items]);
  }, []);

  useEffect(() => {
    const socket = apiService.connectProgress();
    socket.on('conversion_progress', ({ conversion_id, phase, percent }) => {
      setQueue(prev =>
        prev.map(item =>
          item.id === String(conversion_id)
            ? {
                ...item,
                progress: { ...item.progress, [phase]: percent },
                status:
                  phase === 'postprocess' && percent === 100
                    ? 'completed'
                    : item.status,
              }
            : item
        )
      );
    });
    socketRef.current = socket;
    return () => {
      socket.disconnect();
    };
  }, []);

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
        q.id === item.id
          ? { ...q, status: 'processing', progress: { preprocess: 0, convert: 0, postprocess: 0 } }
          : q
      )
    );

    apiService
      .convertFile({ file: item.file, target_format: 'html' })
      .then(res => {
        const convId = String(res.conversion.id);
        setQueue(prev =>
          prev.map(q => (q.id === item.id ? { ...q, id: convId } : q))
        );
      })
      .finally(() => {
        setProcessing(false);
      });
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
          {queue.map(item => {
            const total = Math.round(
              (item.progress.preprocess + item.progress.convert + item.progress.postprocess) /
                3
            );
            return (
              <div key={item.id} className="p-4 border rounded-md">
                <div className="flex justify-between mb-1">
                  <span className="truncate">{item.file.name}</span>
                  <span className="text-sm">{total}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded flex overflow-hidden">
                  <div
                    className="bg-blue-500 h-2"
                    style={{ width: `${item.progress.preprocess / 3}%` }}
                  ></div>
                  <div
                    className="bg-yellow-500 h-2"
                    style={{ width: `${item.progress.convert / 3}%` }}
                  ></div>
                  <div
                    className="bg-green-500 h-2"
                    style={{ width: `${item.progress.postprocess / 3}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
