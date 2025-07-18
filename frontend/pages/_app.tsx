// Archivo: frontend/pages/_app.tsx
import '../styles/brand-styles.css'; // Usando tu archivo de estilos correcto
import type { AppProps } from 'next/app';
import { AuthProvider } from '../auth/AuthContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;