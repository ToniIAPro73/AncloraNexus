# Instrucciones de Deployment - Anclora Converter

## 🚀 Opciones de Deployment

### **Opción 1: GitHub Pages (Recomendada para Frontend)**

#### **Configuración Automática**
```bash
# 1. Instalar gh-pages
npm install --save-dev gh-pages

# 2. Añadir scripts a package.json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# 3. Configurar homepage en package.json
"homepage": "https://tu-usuario.github.io/Anclora_Converter_Original"

# 4. Deploy
npm run deploy
```

#### **Configuración Manual**
```bash
# 1. Build del proyecto
npm run build

# 2. Crear rama gh-pages
git checkout --orphan gh-pages
git rm -rf .
cp -r dist/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

# 3. Configurar en GitHub
# Settings > Pages > Source: Deploy from branch > gh-pages
```

### **Opción 2: Vercel (Recomendada para Full-Stack)**

#### **Deploy Automático**
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login y deploy
vercel login
vercel

# 3. Configurar dominio personalizado (opcional)
vercel --prod
```

#### **Configuración vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### **Opción 3: Netlify**

#### **Deploy por Git**
```bash
# 1. Conectar repositorio en netlify.com
# 2. Configurar build settings:
#    Build command: npm run build
#    Publish directory: dist

# 3. Variables de entorno (si necesarias)
# Site settings > Environment variables
```

#### **Deploy Manual**
```bash
# 1. Build local
npm run build

# 2. Drag & drop carpeta dist en netlify.com
```

### **Opción 4: Firebase Hosting**

#### **Configuración**
```bash
# 1. Instalar Firebase CLI
npm install -g firebase-tools

# 2. Login y configurar
firebase login
firebase init hosting

# 3. Configurar firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}

# 4. Deploy
npm run build
firebase deploy
```

---

## ⚙️ Configuración de Variables de Entorno

### **Variables Requeridas**
```bash
# .env.production
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
VITE_GEMINI_API_KEY=tu_gemini_api_key
```

### **Configuración por Plataforma**

#### **Vercel**
```bash
# CLI
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_GEMINI_API_KEY

# Dashboard: Settings > Environment Variables
```

#### **Netlify**
```bash
# CLI
netlify env:set VITE_SUPABASE_URL "tu_valor"

# Dashboard: Site settings > Environment variables
```

#### **GitHub Pages**
```bash
# Settings > Secrets and variables > Actions
# Añadir como Repository secrets
```

---

## 🔧 Optimizaciones de Producción

### **Vite Build Optimizations**
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ebook: ['./src/services/ebookConversionService.ts'],
          utils: ['./src/utils/conversionMaps.ts']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

### **Compresión de Assets**
```bash
# Instalar plugin de compresión
npm install --save-dev vite-plugin-compression

# vite.config.ts
import { compression } from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    compression({
      algorithm: 'gzip'
    })
  ]
})
```

### **PWA (Opcional)**
```bash
# Instalar plugin PWA
npm install --save-dev vite-plugin-pwa

# vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
})
```

---

## 📊 Monitoreo y Analytics

### **Google Analytics 4**
```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### **Error Tracking (Sentry)**
```bash
# Instalar Sentry
npm install @sentry/react @sentry/tracing

# main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

---

## 🔒 Seguridad

### **Content Security Policy**
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  connect-src 'self' https://api.supabase.io https://generativelanguage.googleapis.com;
">
```

### **Headers de Seguridad**
```javascript
// netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## 🚀 CI/CD Pipeline

### **GitHub Actions**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

---

## 📈 Performance

### **Lighthouse Optimizations**
```javascript
// Lazy loading de componentes
const EbookConverter = lazy(() => import('./components/EbookConverter'));

// Preload de recursos críticos
<link rel="preload" href="/fonts/sf-pro-display.woff2" as="font" type="font/woff2" crossorigin>

// Service Worker para caching
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### **Bundle Analysis**
```bash
# Analizar bundle
npm install --save-dev rollup-plugin-visualizer

# Generar reporte
npm run build -- --analyze
```

---

## 🌐 Dominio Personalizado

### **Configuración DNS**
```
# Para subdomain (recomendado)
CNAME   converter   tu-dominio-principal.com

# Para domain apex
A       @           192.30.252.153
A       @           192.30.252.154
```

### **SSL/HTTPS**
- **GitHub Pages**: Automático con dominios .github.io
- **Vercel**: Automático con certificados Let's Encrypt
- **Netlify**: Automático con certificados Let's Encrypt
- **Cloudflare**: Proxy + SSL gratuito

---

## 🔄 Rollback Strategy

### **Preparación**
```bash
# Crear tags de versión
git tag -a v1.0.0 -m "Version 1.0.0 - Ebook functionality"
git push origin v1.0.0

# Mantener ramas de release
git checkout -b release/v1.0.0
git push origin release/v1.0.0
```

### **Rollback Rápido**
```bash
# Vercel
vercel rollback [deployment-url]

# Netlify
netlify deploy --dir=dist --prod --alias=previous-version

# GitHub Pages
git checkout release/v0.9.0
npm run deploy
```

---

## ✅ Checklist de Deployment

### **Pre-deployment**
- [ ] Tests pasan correctamente
- [ ] Build se genera sin errores
- [ ] Variables de entorno configuradas
- [ ] Documentación actualizada
- [ ] Performance optimizada (Lighthouse > 90)

### **Deployment**
- [ ] Deploy exitoso en staging
- [ ] Funcionalidades verificadas
- [ ] Cross-browser testing
- [ ] Mobile responsiveness
- [ ] SEO básico configurado

### **Post-deployment**
- [ ] Monitoreo activo
- [ ] Analytics configurado
- [ ] Error tracking funcionando
- [ ] Backup de versión anterior
- [ ] Documentación de deployment

---

## 📞 Soporte de Deployment

### **Recursos Útiles**
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Deployment](https://create-react-app.dev/docs/deployment/)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)

### **Comandos de Diagnóstico**
```bash
# Verificar build local
npm run build && npm run preview

# Verificar dependencias
npm audit

# Verificar bundle size
npm run build -- --analyze

# Test de performance
npx lighthouse http://localhost:4173 --view
```

---

**¡Tu aplicación Anclora Converter está lista para producción!** 🚀

