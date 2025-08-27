import React, { useState } from 'react';
import LandingPage from './LandingPage';
import NewApp from './NewApp';

type AppView = 'landing' | 'app';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('landing');

  const handleEnterApp = () => {
    setCurrentView('app');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  if (currentView === 'landing') {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  return <NewApp onBackToLanding={handleBackToLanding} />;
};

export default MainApp;
