import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';

type SupportedResponse = {
  supported_conversions: Record<string, Record<string, number>>;
  allowed_extensions: string[];
};

const FormatsView: React.FC = () => {
  const [data, setData] = useState<SupportedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFormats = async () => {
      try {
        const res = await apiService.getSupportedFormats();
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Error cargando formatos');
      } finally {
        setLoading(false);
      }
    };
    fetchFormats();
  }, []);

  if (loading) return <p>Cargando formatos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-h2 font-bold mb-6">Formatos soportados</h1>
      {data &&
        Object.entries(data.supported_conversions).map(([source, targets]) => (
          <div key={source} className="mb-4">
            <h2 className="font-semibold">{source.toUpperCase()}</h2>
            <ul className="list-disc ml-6">
              {Object.keys(targets).map((target) => (
                <li key={target}>{target.toUpperCase()}</li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
};

export default FormatsView;

