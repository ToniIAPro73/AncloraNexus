import React, { useState } from "react";
import { FileText, Upload, Download, ArrowRight } from "lucide-react";

const ConversorInteligente = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleConvert = () => {
    if (selectedFile && targetFormat) {
      console.log(`Converting ${selectedFile.name} to ${targetFormat}`);
      // Aquí iría la lógica de conversión
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-gradient-to-br from-white via-gray-50 to-emerald-50/30 rounded-xl shadow-lg border border-gray-100 p-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-8 text-center">
          Conversor Inteligente
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Sección de archivo origen */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <Upload className="text-emerald-600" size={24} />
              Archivo de Origen
            </h3>
            
            <div className="border-2 border-dashed border-emerald-200 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 rounded-lg p-8 text-center hover:border-emerald-300 transition-all duration-300 hover:shadow-md">
              {selectedFile ? (
                <div className="space-y-4">
                  <FileText className="mx-auto h-16 w-16 text-emerald-600" />
                  <div>
                    <p className="font-medium text-gray-800">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-sm bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent hover:from-emerald-700 hover:to-teal-700 font-medium"
                  >
                    Cambiar archivo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <FileText className="mx-auto h-16 w-16 text-emerald-500" />
                  <div>
                    <p className="text-gray-600 mb-2">Arrastra tu archivo aquí</p>
                    <p className="text-sm text-gray-500 mb-4">o haz clic para seleccionar</p>
                  </div>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.docx,.txt,.epub,.html,.md"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Seleccionar Archivo
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Sección de formato destino */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <Download className="text-emerald-600" size={24} />
              Formato de Destino
            </h3>
            
            <div className="space-y-4">
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                className="w-full p-4 border border-gray-200 bg-gradient-to-br from-white via-gray-50 to-emerald-50/20 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-lg transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <option value="">Selecciona formato de destino...</option>
                <option value="pdf">PDF - Documento Portátil</option>
                <option value="docx">DOCX - Microsoft Word</option>
                <option value="epub">EPUB - Libro Electrónico</option>
                <option value="txt">TXT - Texto Plano</option>
                <option value="html">HTML - Página Web</option>
                <option value="md">Markdown - Texto Estructurado</option>
              </select>
              
              <button
                onClick={handleConvert}
                disabled={!selectedFile || !targetFormat}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 transition-all duration-300 font-medium text-lg disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
              >
                <span>Convertir Archivo</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 p-6 bg-gradient-to-br from-emerald-50 via-white to-teal-50/50 rounded-lg border border-emerald-100 shadow-sm">
          <h4 className="font-semibold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent mb-2">Formatos Soportados</h4>
          <p className="text-gray-600 text-sm">
            Entrada: PDF, DOCX, TXT, EPUB, HTML, Markdown | 
            Salida: PDF, DOCX, EPUB, TXT, HTML, Markdown
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConversorInteligente;