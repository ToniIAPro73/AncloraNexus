import React, { useState } from 'react';
import LandingPage from './LandingPage';
import AppPage from '../pages/app';

type AppView = 'landing' | 'app';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('landing');

  const handleEnterApp = () => {
    setCurrentView('app');
  };

  // Comentamos esta función ya que no se usa actualmente
  // const handleBackToLanding = () => {
  //   setCurrentView('landing');
  // };

  if (currentView === 'landing') {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  // Aquí renderizamos el AppPage sin la propiedad onBackToLanding
  // ya que no está definida en sus props
  return <AppPage />;
};

export default MainApp;
