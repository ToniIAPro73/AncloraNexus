import React, { useState, useRef, useContext } from "react";
// Asegúrate de que las siguientes rutas y módulos existen en tu proyecto:
import { apiClient } from "../services/api";
import { AuthContext } from "../auth/AuthContext";

// #region Tipos y tipos auxiliares
interface ConversionOption {
  icon: string;
  label: string;
  from: string;
  to: string;
  cost: number;
}

const popularConversions: ConversionOption[] = [
  {
    icon: "📄➡️🖼️",
    label: "PDF a JPG",
    from: "pdf",
    to: "jpg",
    cost: 2,
  },
  {
    icon: "🖼️➡️PDF",
    label: "JPG a PDF",
    from: "jpg",
    to: "pdf",
    cost: 2,
  },
  // Añade aquí más conversiones populares si quieres
];
// #endregion

const steps = [
  { label: "Subir Archivo", color: "from-blue-500 to-cyan-500", icon: "📁" },
  { label: "Análisis IA", color: "from-purple-500 to-pink-500", icon: "🤖" },
  { label: "Configurar", color: "from-green-500 to-emerald-400", icon: "⚙️" },
  { label: "Descargar", color: "from-cyan-500 to-blue-500", icon: "📥" },
];

const UniversalConverter: React.FC = () => {
  // Estado del componente
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [conversionFormat, setConversionFormat] = useState<string | undefined>(
    undefined
  );
  const [conversionCost, setConversionCost] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Si usas autenticación/contexto de usuario
  const { user } = useContext(AuthContext);

  // #region Manejadores de eventos
  const handleFileSelect = (file: unknown) => {
    if (file instanceof File) {
      setSelectedFile(file);
      setError(null);
      setCurrentStep(1); // Paso a análisis IA
      // Ejemplo de análisis IA simulado:
      setTimeout(() => {
        setCurrentStep(2); // Paso a configurar
      }, 1500);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFormatSelect = (option: ConversionOption) => {
    setConversionFormat(`${option.from}-${option.to}`);
    setConversionCost(option.cost);
    setCurrentStep(3);
  };

  const handleStartOver = () => {
    setCurrentStep(0);
    setSelectedFile(null);
    setConversionFormat(undefined);
    setConversionCost(0);
    setDownloadUrl(null);
    setError(null);
  };

  const handleConversion = async () => {
    if (!selectedFile || !conversionFormat) {
      setError("Selecciona un archivo y formato de conversión");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Lógica POST real aquí (API propia)
      // Este ejemplo asume éxito y asigna una URL de descarga dummy
      // const response = await apiClient.convert(selectedFile, conversionFormat);
      // setDownloadUrl(response.downloadUrl);

      setTimeout(() => {
        setDownloadUrl("/descargas/archivo-resultante.output");
        setLoading(false);
      }, 2000);
    } catch (err) {
      setError("Ocurrió un error en la conversión. Intenta de nuevo.");
      setLoading(false);
    }
  };
  // #endregion

  // #region Render de pasos
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div
            className="flex flex-col items-center gap-4 py-12"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <button
              className="flex flex-col items-center border-2 border-blue-400 border-dashed rounded-xl bg-slate-900/50 p-6 cursor-pointer transition hover:border-blue-500 hover:bg-blue-950/30"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <span className="text-4xl">{steps[0].icon}</span>
              <span className="mt-2 text-lg font-medium text-blue-300">
                Arrastra tu archivo aquí o haz clic para seleccionar
              </span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </button>
            {selectedFile && (
              <div className="mt-4 text-blue-200">
                Archivo seleccionado: <b>{selectedFile.name}</b>
              </div>
            )}
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col items-center py-12">
            <div className="animate-spin mb-4 text-3xl text-purple-300">🤖</div>
            <div className="text-lg text-purple-200">Analizando archivo con IA...</div>
          </div>
        );
      case 2:
        return (
          <div className="py-8">
            <div className="mb-4 text-center text-cyan-300">
              Selecciona el tipo de conversión
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {popularConversions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleFormatSelect(option)}
                  className="flex items-center justify-between px-6 py-4 rounded-xl border border-cyan-700/40 bg-slate-800/70 shadow-md hover:border-cyan-400 transition"
                  type="button"
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="font-medium text-cyan-100">{option.label}</span>
                  <span className="ml-5 text-sm text-cyan-300">{option.cost} créditos</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col items-center py-12 gap-6">
            <div className="text-lg text-green-200 font-medium">
              Conversión seleccionada: <span className="font-bold">{conversionFormat}</span>
            </div>
            <button
              onClick={handleConversion}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-700 text-white font-semibold shadow-xl tracking-wide hover:scale-105 transition disabled:opacity-40 disabled:cursor-not-allowed"
              type="button"
              disabled={loading}
            >
              {loading ? "Convirtiendo..." : `Convertir (${conversionCost} créditos)`}
            </button>
            {downloadUrl && (
              <a
                href={downloadUrl}
                download
                className="mt-5 px-6 py-3 rounded-lg bg-blue-600/90 text-white font-bold shadow hover:bg-blue-700 transition"
              >
                Descargar archivo convertido
              </a>
            )}
          </div>
        );
      default:
        return null;
    }
  };
  // #endregion

  return (
    <div className="w-full max-w-5xl mx-auto my-8 px-4 space-y-8">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
          Conversor Inteligente
        </h1>
        <p className="text-cyan-200 text-sm">
          Convierte archivos con inteligencia artificial avanzada 
          y un diseño profesional tipo dashboard.
        </p>
      </header>

      {/* Stepper */}
      <div className="flex justify-center space-x-0 md:space-x-10 w-full pb-6">
        {steps.map((step, idx) => (
          <div
            key={step.label}
            className="flex flex-col items-center w-1/4"
          >
            <div
              className={
                "w-10 h-10 flex items-center justify-center rounded-full text-2xl font-bold " +
                (currentStep === idx
                  ? `bg-gradient-to-tr ${step.color} text-white shadow-xl scale-110`
                  : "bg-slate-700 text-slate-200")
              }
            >
              {step.icon}
            </div>
            <p
              className={
                "mt-2 text-xs font-medium " +
                (currentStep === idx
                  ? "text-cyan-200"
                  : "text-slate-400")
              }
            >
              {step.label}
            </p>
            {idx < steps.length - 1 && (
              <div className="hidden md:block h-1 w-12 bg-gradient-to-r from-teal-600 to-blue-800 my-1 rounded-full" />
            )}
          </div>
        ))}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 shadow mb-6 text-center">
          {error}
        </div>
      )}

      {/* Renderiza el paso actual */}
      <main className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 p-6 shadow-xl">
        {renderStep()}
        {(currentStep > 0 || selectedFile) && (
          <button
            onClick={handleStartOver}
            className="mt-8 px-4 py-2 rounded text-xs bg-slate-700 text-slate-200 hover:bg-slate-600 mx-auto block"
            type="button"
          >
            Reiniciar conversión
          </button>
        )}
      </main>

      {/* Conversiones Populares (parte extra visual) */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h2 className="text-blue-300 font-semibold mb-4 text-lg">Conversiones Populares</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {popularConversions.map((conversion, idx) => (
            <div
              key={idx}
              className="flex items-center px-6 py-4 rounded-xl border border-blue-800/40 bg-slate-900/60 hover:border-blue-400 transition"
            >
              <span className="text-3xl">{conversion.icon}</span>
              <span className="ml-3 font-medium text-blue-100">{conversion.label}</span>
              <span className="ml-auto text-sm text-blue-300">{conversion.cost} créditos</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UniversalConverter;
