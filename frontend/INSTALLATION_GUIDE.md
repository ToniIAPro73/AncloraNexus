# Guía de Instalación - Anclora Converter con Funcionalidad de E-books

## Requisitos del Sistema

### Requisitos Mínimos
- **Sistema Operativo**: Windows 10, macOS 10.15, Ubuntu 18.04 o superior
- **Node.js**: Versión 18.x o superior
- **npm**: Versión 8.x o superior
- **RAM**: 4GB mínimo, 8GB recomendado
- **Espacio en disco**: 2GB libres

### Navegadores Soportados
- **Chrome**: 90 o superior
- **Firefox**: 88 o superior
- **Safari**: 14 o superior
- **Edge**: 90 o superior

---

## Instalación Paso a Paso

### 1. Preparación del Entorno

#### Verificar Node.js
```bash
node --version
npm --version
```

Si no tienes Node.js instalado:
- **Windows/macOS**: Descarga desde [nodejs.org](https://nodejs.org/)
- **Ubuntu**: 
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```

### 2. Obtener el Código

#### Opción A: Clonar desde GitHub
```bash
git clone https://github.com/ToniIAPro73/Anclora_Converter_Original.git
cd Anclora_Converter_Original
```

#### Opción B: Descargar ZIP
1. Ve a https://github.com/ToniIAPro73/Anclora_Converter_Original
2. Haz clic en "Code" → "Download ZIP"
3. Extrae el archivo y navega al directorio

### 3. Instalación de Dependencias

```bash
# Instalar todas las dependencias
npm install

# Verificar instalación
npm list --depth=0
```

**Dependencias principales instaladas**:
- React 19.1.0
- Vite 5.4.19
- TypeScript
- JSZip 3.10.1
- PDF-lib 1.17.1

### 4. Configuración del Entorno

#### Variables de Entorno (Opcional)
Crea un archivo `.env` en la raíz del proyecto:

```env
# Configuración de desarrollo
VITE_APP_NAME=Anclora Converter
VITE_ENABLE_EBOOK_CONVERSION=true

# URLs de API (configurar según tu entorno)
VITE_API_BASE_URL=http://localhost:3000
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_key
```

### 5. Verificación de la Instalación

#### Ejecutar en Modo Desarrollo
```bash
npm run dev
```

**Resultado esperado**:
```
VITE v5.4.19  ready in 200ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

#### Abrir en el Navegador
1. Ve a `http://localhost:5173`
2. Deberías ver la página principal de Anclora Converter
3. Haz clic en "Conversor especializado de E-books"
4. Verifica que la página de e-books carga correctamente

---

## Configuración Avanzada

### Configuración de Puerto

Si el puerto 5173 está ocupado:

```bash
# Especificar puerto manualmente
npm run dev -- --port 3000

# O configurar en vite.config.ts
export default defineConfig({
  server: {
    port: 3000
  }
})
```

### Configuración de Red

Para acceso desde otros dispositivos:

```bash
npm run dev -- --host
```

Esto permitirá acceso desde:
- `http://localhost:5173`
- `http://[tu-ip]:5173`

### Configuración de Proxy (Opcional)

Si necesitas conectar con una API backend:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

---

## Build de Producción

### Generar Build

```bash
npm run build
```

**Archivos generados en `dist/`**:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [otros assets]
└── [archivos estáticos]
```

### Previsualizar Build

```bash
npm run preview
```

### Servir en Producción

#### Opción A: Servidor Simple
```bash
# Instalar servidor estático
npm install -g serve

# Servir archivos
serve -s dist -l 3000
```

#### Opción B: Nginx
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    root /ruta/a/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Opción C: Apache
```apache
<VirtualHost *:80>
    ServerName tu-dominio.com
    DocumentRoot /ruta/a/dist
    
    <Directory /ruta/a/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Para SPA routing
    FallbackResource /index.html
</VirtualHost>
```

---

## Solución de Problemas

### Problemas Comunes

#### Error: "Module not found"
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### Error: "Port already in use"
```bash
# Encontrar proceso usando el puerto
lsof -ti:5173
kill -9 [PID]

# O usar puerto diferente
npm run dev -- --port 3001
```

#### Error: "Permission denied"
```bash
# En sistemas Unix/Linux
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) node_modules
```

#### Error de compilación TypeScript
```bash
# Verificar versión de TypeScript
npx tsc --version

# Limpiar cache de TypeScript
npx tsc --build --clean
```

### Problemas de Rendimiento

#### Build lento
```bash
# Usar cache de Vite
npm run build -- --mode production

# Verificar tamaño del bundle
npm run build -- --analyze
```

#### Aplicación lenta en desarrollo
```bash
# Deshabilitar source maps temporalmente
VITE_DISABLE_SOURCEMAPS=true npm run dev
```

### Problemas de Navegador

#### Funcionalidad no disponible
1. Verifica que JavaScript esté habilitado
2. Limpia cache del navegador (Ctrl+Shift+R)
3. Verifica la consola del desarrollador (F12)

#### Estilos no se cargan
1. Verifica que el archivo CSS se genere correctamente
2. Comprueba la red en herramientas de desarrollador
3. Verifica que no haya errores de CORS

---

## Configuración de Desarrollo

### Estructura de Archivos

```
Anclora_Converter_Original/
├── public/                 # Archivos estáticos
├── src/                   # Código fuente (si existe)
├── components/            # Componentes React
│   ├── EbookConverter.tsx
│   ├── EbookFormatSelector.tsx
│   └── ...
├── services/              # Servicios backend
├── types/                 # Definiciones TypeScript
├── utils/                 # Utilidades
├── App.tsx               # Componente principal
├── index.html            # HTML principal
├── package.json          # Dependencias
├── vite.config.ts        # Configuración Vite
└── tsconfig.json         # Configuración TypeScript
```

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run dev:host     # Servidor accesible desde red

# Producción
npm run build        # Build de producción
npm run preview      # Preview del build

# Testing
npm run test         # Ejecutar tests
npm run test:watch   # Tests en modo watch

# Linting y formato
npm run lint         # Verificar código
npm run lint:fix     # Corregir problemas automáticamente
npm run format       # Formatear código
```

### Configuración del Editor

#### VS Code (Recomendado)
Extensiones recomendadas:
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-eslint"
  ]
}
```

#### Configuración de Prettier
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

---

## Actualización y Mantenimiento

### Actualizar Dependencias

```bash
# Verificar dependencias desactualizadas
npm outdated

# Actualizar dependencias menores
npm update

# Actualizar dependencias mayores (con cuidado)
npm install package@latest
```

### Backup y Restauración

#### Backup de configuración
```bash
# Respaldar archivos importantes
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup
cp vite.config.ts vite.config.ts.backup
```

#### Restaurar configuración
```bash
# Restaurar desde backup
cp package.json.backup package.json
npm install
```

### Monitoreo de Logs

#### Logs de desarrollo
```bash
# Ver logs detallados
DEBUG=vite:* npm run dev

# Logs de red
npm run dev -- --debug
```

#### Logs de producción
```bash
# Con PM2
pm2 logs anclora-converter

# Con systemd
journalctl -u anclora-converter -f
```

---

## Seguridad

### Configuración de Seguridad

#### Headers de Seguridad
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block'
    }
  }
})
```

#### Variables de Entorno Seguras
- Nunca incluyas claves secretas en el código
- Usa variables de entorno para configuración sensible
- Prefija variables públicas con `VITE_`

### Auditoría de Seguridad

```bash
# Auditar dependencias
npm audit

# Corregir vulnerabilidades automáticamente
npm audit fix

# Auditoría manual
npm audit --audit-level moderate
```

---

## Soporte y Recursos

### Documentación Adicional
- [Guía de Usuario](./EBOOK_FUNCTIONALITY_GUIDE.md)
- [Documentación Técnica](./TECHNICAL_DOCUMENTATION.md)
- [README Principal](./README.md)

### Comunidad y Soporte
- **GitHub Issues**: Reportar bugs y solicitar funcionalidades
- **Documentación Vite**: https://vitejs.dev/
- **Documentación React**: https://react.dev/

### Contacto
Para soporte técnico o consultas sobre la instalación, contacta al equipo de desarrollo a través de los canales oficiales del proyecto.

---

*Esta guía cubre la instalación completa de Anclora Converter con la nueva funcionalidad de e-books. Para uso de la aplicación, consulta la guía de usuario.*

