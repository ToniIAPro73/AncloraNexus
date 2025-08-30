import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  highContrast: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  toggleHighContrast: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('highContrast');
    if (stored === 'true') {
      setHighContrast(true);
      document.documentElement.classList.add('hc');
    }
  }, []);

  const toggleHighContrast = () => {
    setHighContrast((prev) => {
      const next = !prev;
      const root = document.documentElement;
      if (next) {
        root.classList.add('hc');
      } else {
        root.classList.remove('hc');
      }
      localStorage.setItem('highContrast', String(next));
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ highContrast, toggleHighContrast }}>
      {children}
    </ThemeContext.Provider>
  );
};


