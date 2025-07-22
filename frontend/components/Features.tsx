import React from 'react';
import { IconSparkles, IconShieldCheck, IconInfinity } from './Icons';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="flex flex-col items-center p-6">
    <div className="flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-6">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600 text-center">{description}</p>
  </div>
);

interface FeaturesProps {
    onStartConverting: () => void;
}

export const Features: React.FC<FeaturesProps> = ({ onStartConverting }) => {
  return (
    <section className="w-full max-w-5xl mx-auto py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
                icon={<IconSparkles className="w-10 h-10 text-orange-500" />}
                title={<>Es <span className="text-orange-500">fácil</span></>}
                description="Funciona en línea, no hay software para descargar. Suba su archivo, elija un formato y convierta."
            />
            <FeatureCard 
                icon={<IconShieldCheck className="w-10 h-10 text-blue-500" />}
                title={<>Es <span className="text-blue-500">seguro</span></>}
                description="Tus archivos están encriptados y almacenados en nuestros servidores por una hora, luego se eliminan para siempre."
            />
            <FeatureCard 
                icon={<IconInfinity className="w-10 h-10 text-yellow-500" />}
                title={<>Es <span className="text-yellow-500">ilimitado</span></>}
                description="Cualquier tipo, cualquier formato, en cualquier momento. No ponemos límites."
            />
        </div>
        <div className="text-center mt-12">
            <button
                onClick={onStartConverting}
                className="px-8 py-4 button-primary font-bold text-lg rounded-lg shadow-md transition-transform hover:scale-105"
            >
                Comienza a convertir
            </button>
        </div>
    </section>
  );
};