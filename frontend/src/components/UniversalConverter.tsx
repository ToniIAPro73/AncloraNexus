import React, { useState, useEffect, useCallback, useRef } from 'react';

import { FileUploader } from './FileUploader';

interface PhaseProgress {
  preprocess: number;
  convert: number;
  postprocess: number;
}

interface QueueItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

export const UniversalConverter: React.FC = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const timersRef = useRef<Record<string, { interval: ReturnType<typeof setInterval>; timeout: ReturnType<typeof setTimeout> }>>({});
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

    const interval = setInterval(() => {
      setQueue(prev =>
        prev.map(q =>
          q.id === item.id
            ? { ...q, progress: Math.min(q.progress + 10, 100) }
            : q
        )
      );
    }, 200);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setQueue(prev =>
        prev.map(q =>
          q.id === item.id
            ? { ...q, progress: 100, status: 'completed' }
            : q
        )
      );
      delete timersRef.current[item.id];
      setProcessing(false);
    }, 2000);

    timersRef.current[item.id] = { interval, timeout };
  };

  const cancelConversion = (id: string) => {
    const timer = timersRef.current[id];
    if (timer) {
      clearInterval(timer.interval);
      clearTimeout(timer.timeout);
      delete timersRef.current[id];
    }
    const wasProcessing = queue.find(q => q.id === id)?.status === 'processing';
    setQueue(prev =>
      prev.map(q => (q.id === id ? { ...q, status: 'cancelled' } : q))
    );
    if (wasProcessing) {
      setProcessing(false);
    }
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    setQueue(prev => {
      const index = prev.findIndex(q => q.id === id);
      if (index === -1) return prev;
      const newIndex = direction === 'up' ? Math.max(index - 1, 0) : Math.min(index + 1, prev.length - 1);
      const newQueue = [...prev];
      const [item] = newQueue.splice(index, 1);
      newQueue.splice(newIndex, 0, item);
      return newQueue;
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
          {queue.map((item, index) => (
            <div key={item.id} className="p-4 border rounded-md space-y-2">
              <div className="flex justify-between mb-1">
                <span className="truncate">{item.file.name}</span>
                <span className="text-sm">
                  {item.status === 'cancelled' ? 'Cancelado' : `${item.progress}%`}
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded">
                <div
                  className="bg-green-500 h-2 rounded"
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => cancelConversion(item.id)}
                  disabled={item.status === 'completed' || item.status === 'cancelled'}
                  className="px-2 py-1 border rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => moveItem(item.id, 'up')}
                  disabled={index === 0 || item.status !== 'pending'}
                  className="px-2 py-1 border rounded"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveItem(item.id, 'down')}
                  disabled={index === queue.length - 1 || item.status !== 'pending'}
                  className="px-2 py-1 border rounded"
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
