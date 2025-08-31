import React, { useState } from 'react';
import LandingPage from './LandingPage';
import AppPage from '../pages/app';

type AppView = 'landing' | 'app';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('landing');

  const handleEnterApp = () => {
    setCurrentView('app');
  };

  if (currentView === 'landing') {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  // Ya no necesitamos el botón de volver, la app es independiente
  return <AppPage />;
};

export default MainApp;

