import React, { useRef } from 'react';
import { Header } from './components/Header';
import { UniversalConverter } from './components/UniversalConverter';
import { Features } from './components/Features';
import { PopularConversions } from './components/PopularConversions';
import { SupportedFormats } from './components/SupportedFormats';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';

function App() {
  const converterRef = useRef<HTMLElement>(null);

  const handleScrollToConverter = () => {
    converterRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="bg-slate-100">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center pt-12 pb-8 sm:pt-16 sm:pb-12">
                <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight">
                    Convierte cualquier archivo
                </h1>
                <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
                    Sube tu archivo y elige el formato al que quieres convertirlo. Fácil, rápido y seguro.
                </p>
            </header>
            
            <main ref={converterRef} id="converter" className="bg-white rounded-2xl shadow-2xl shadow-slate-200/60 ring-1 ring-slate-200 relative scroll-mt-20">
                <div className="max-w-4xl mx-auto">
                    <UniversalConverter />
                </div>
            </main>
            
            <Features onStartConverting={handleScrollToConverter} />
            
            <div className="border-b border-slate-200 w-full max-w-5xl mx-auto"></div>
            
            <PopularConversions />
    
            <SupportedFormats />

            <FAQ />
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default App;
