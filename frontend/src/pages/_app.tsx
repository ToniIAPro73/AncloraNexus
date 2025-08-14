// src/pages/_app.tsx
import '../styles/brand-styles.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../auth/AuthContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </I18nextProvider>
  );
}

export default MyApp;
