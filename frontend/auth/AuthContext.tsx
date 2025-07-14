import React, { createContext, useContext, useState, ReactNode } from 'react';

// Tipos simplificados para testing
interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  checkUsageLimit: (fileSizeMB: number) => Promise<{ canConvert: boolean; reason?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    // Simulación de login
    setTimeout(() => {
      setUser({ id: '1', email, name: 'Usuario Test' });
      setLoading(false);
    }, 1000);
    return { success: true };
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    // Simulación de registro
    setTimeout(() => {
      setUser({ id: '1', email, name: 'Usuario Test' });
      setLoading(false);
    }, 1000);
    return { success: true };
  };

  const signOut = async () => {
    setUser(null);
    return { success: true };
  };

  const checkUsageLimit = async (fileSizeMB: number) => {
    // Simulación de verificación de límites
    return { canConvert: true };
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    signIn,
    signUp,
    signOut,
    checkUsageLimit,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

