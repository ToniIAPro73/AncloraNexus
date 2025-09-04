# **📁 ESQUEMA COMPLETO DE ARQUITECTURA - ANCLORA NEXUS**

## **🚀 FLUJO PRINCIPAL DE LA APLICACIÓN:**

```
frontend/index.html (Entry HTML)
    ↓
frontend/src/main.tsx (React Entry Point)
    ↓
frontend/src/components/MainApp.tsx (App Controller)
    ↓ (decide entre landing o app)
frontend/src/components/LandingPage.tsx (Landing Page)
    ↓ (al hacer clic "Entrar a la App")
frontend/src/pages/app.tsx (función AppPage() que retorna <NewApp />)
    ↓
frontend/src/components/NewApp.tsx (Aplicación Principal Autenticada)
    ↓
frontend/src/components/Layout/MainLayout.tsx (Layout con fondo bd4.png)
    ↓
frontend/src/components/SafeConversor.tsx (Conversor Principal Activo)
```

---

## **📂 ESTRUCTURA DETALLADA DEL FRONTEND:**

### **🎯 PUNTOS DE ENTRADA:**
- `frontend/index.html` - **HTML base** con div#root
- `frontend/src/main.tsx` - **Entry point React** con BrowserRouter y AuthProvider
- `frontend/src/App.tsx` - **Router alternativo** (no usado actualmente)

### **🎮 CONTROLADORES PRINCIPALES:**
- `frontend/src/components/MainApp.tsx` - **CONTROLADOR PRINCIPAL** que decide entre landing/app
- `frontend/src/components/LandingPage.tsx` - **LANDING PAGE** llamada por MainApp
- `frontend/src/pages/app.tsx` - **WRAPPER** función AppPage() que retorna `<NewApp />`
- `frontend/src/components/NewApp.tsx` - **APLICACIÓN PRINCIPAL** autenticada

### **🏗️ LAYOUT Y ESTRUCTURA:**
- `frontend/src/components/Layout/MainLayout.tsx` - **LAYOUT PRINCIPAL** con fondo bd4.png
- `frontend/src/components/Layout/Sidebar.tsx` - **MENÚ LATERAL** con navegación
- `frontend/src/components/Layout/Header.tsx` - **HEADER SUPERIOR** con título y controles

### **⚙️ CONVERSORES (COMPONENTES PRINCIPALES):**
- `frontend/src/components/SafeConversor.tsx` - **🎯 CONVERSOR ACTIVO PRINCIPAL**
- `frontend/src/components/NewConversorInteligente.tsx` - Conversor alternativo
- `frontend/src/components/OldConversorInteligente.tsx` - Conversor legacy
- `frontend/src/components/TestConversor.tsx` - Conversor de pruebas
- `frontend/src/components/SimpleConversor.tsx` - Conversor simple
- `frontend/src/components/DebugConversor.tsx` - Conversor debug

### **🤖 ANÁLISIS IA:**
- `frontend/src/components/AIContentAnalysis.tsx` - **ANÁLISIS DE CONTENIDO IA**
- `frontend/src/components/AIConversionStudio.tsx` - Estudio de conversión IA

### **🎨 SISTEMA UI:**
- `frontend/src/components/ui/Card.tsx` - Tarjetas con glassmorphism
- `frontend/src/components/ui/Tabs.tsx` - Sistema de pestañas
- `frontend/src/components/ui/FormatSelector.tsx` - Selector de formatos
- `frontend/src/components/ui/StepProgress.tsx` - Progreso de pasos
- `frontend/src/components/ui/index.ts` - Exportaciones UI

### **📤 UPLOAD Y ARCHIVOS:**
- `frontend/src/components/FileUploader.tsx` - **SUBIDA DE ARCHIVOS**
- `frontend/src/components/EnhancedFileUploader.tsx` - Uploader mejorado
- `frontend/src/components/BatchFileUploader.tsx` - Subida por lotes

### **🔐 AUTENTICACIÓN:**
- `frontend/src/auth/AuthContext.tsx` - **CONTEXT DE AUTENTICACIÓN**
- `frontend/src/auth/AuthContext.test.tsx` - Tests de autenticación
- `frontend/src/services/authService.ts` - Servicio de autenticación

### **💳 SISTEMA DE CRÉDITOS:**
- `frontend/src/components/CreditSystem/` - **SISTEMA DE CRÉDITOS COMPLETO**
- `frontend/src/components/CreditPurchase.tsx` - Compra de créditos

### **📊 HISTORIAL Y DATOS:**
- `frontend/src/components/ConversionHistory.tsx` - **HISTORIAL DE CONVERSIONES**
- `frontend/src/components/HistoryView.tsx` - Vista de historial
- `frontend/src/pages/history.tsx` - Página de historial

### **🎭 SISTEMA DE TEMAS:**
- `frontend/src/theme/ThemeProvider.tsx` - **PROVEEDOR DE TEMAS**
- `frontend/src/styles/index.css` - Estilos principales
- `frontend/src/styles/brand-styles.css` - Estilos de marca
- `frontend/src/styles/landing-theme.css` - Tema landing
- `frontend/src/styles/anclora-animations.css` - Animaciones

### **📄 PÁGINAS:**
- `frontend/src/pages/index.tsx` - Redirección a `/landing`
- `frontend/src/pages/app.tsx` - **WRAPPER DE LA APP** (función AppPage)
- `frontend/src/pages/credits.tsx` - Página de créditos
- `frontend/src/pages/formats.tsx` - Página de formatos
- `frontend/src/pages/history.tsx` - Página de historial
- `frontend/src/pages/ComponentsDemo.tsx` - Demo de componentes
- `frontend/src/pages/UIPlayground.tsx` - Playground UI

### **🔧 SERVICIOS:**
- `frontend/src/services/api.ts` - **CLIENTE API PRINCIPAL**
- `frontend/src/services/ConversionService.ts` - Servicio de conversión
- `frontend/src/services/AIConversionService.ts` - Servicio IA
- `frontend/src/services/authService.ts` - Servicio de autenticación

### **🛠️ UTILIDADES:**
- `frontend/src/utils/cn.ts` - Utilidad className
- `frontend/src/utils/conversionMaps.ts` - Mapas de conversión
- `frontend/src/hooks/useAuth.ts` - Hook de autenticación
- `frontend/src/hooks/useFileConversions.ts` - Hook de conversiones

---

## **🔧 ESTRUCTURA DETALLADA DEL BACKEND:**

### **🚀 SERVIDOR PRINCIPAL:**
- `backend/src/main.py` - **🎯 SERVIDOR PRINCIPAL FASTAPI/FLASK**
- `backend/requirements.txt` - Dependencias Python
- `backend/src/config.py` - **CONFIGURACIÓN CENTRALIZADA**
- `backend/src/common_imports.py` - Imports comunes

### **🛣️ RUTAS (API ENDPOINTS):**
- `backend/src/routes/conversion.py` - **RUTAS DE CONVERSIÓN PRINCIPALES**
- `backend/src/routes/ai_analysis.py` - Rutas de análisis IA
- `backend/src/routes/auth.py` - Rutas de autenticación
- `backend/src/routes/credits.py` - Rutas de créditos
- `backend/src/routes/user.py` - Rutas de usuario

### **⚙️ SERVICIOS BACKEND:**
- `backend/src/services/ai_content_analyzer.py` - **ANALIZADOR DE CONTENIDO IA**
- `backend/src/services/conversion_optimizer.py` - Optimizador de conversiones
- `backend/src/services/intelligent_routing.py` - Enrutamiento inteligente
- `backend/src/services/file_validator.py` - Validador de archivos
- `backend/src/services/credit_system.py` - Sistema de créditos
- `backend/src/services/batch_download_service.py` - Servicio de descarga por lotes

### **🗄️ MODELOS Y BASE DE DATOS:**
- `backend/src/models/user.py` - **MODELO DE USUARIO**
- `backend/src/models/conversion.py` - Modelo de conversión
- `backend/src/models/conversion_history.py` - Historial de conversiones
- `backend/src/models/database/app.db` - **BASE DE DATOS SQLITE**

### **🔌 WEBSOCKETS:**
- `backend/src/ws.py` - **WEBSOCKETS PARA TIEMPO REAL**

---

## **📋 CONFIGURACIÓN Y BUILD:**

### **⚙️ FRONTEND:**
- `frontend/package.json` - **DEPENDENCIAS NODE.JS**
- `frontend/tailwind.config.js` - Configuración Tailwind CSS
- `frontend/vite.config.ts` - Configuración Vite
- `frontend/tsconfig.json` - Configuración TypeScript

### **🐍 BACKEND:**
- `backend/requirements.txt` - **DEPENDENCIAS PYTHON**
- `backend/src/config.py` - Configuración centralizada

### **🔧 RAÍZ DEL PROYECTO:**
- `.gitignore` - Archivos ignorados por Git
- `README.md` - Documentación principal
- `.env` - Variables de entorno

---

## **🎯 COMPONENTES ACTIVOS ACTUALES:**

### **🔥 COMPONENTE PRINCIPAL ACTIVO:**
**`frontend/src/components/SafeConversor.tsx`** - Es el conversor que se está usando actualmente en la aplicación, con:
- Fondo bd4.png aplicado
- Estilos glassmorphism
- Integración completa con el sistema de créditos
- Análisis IA de contenido

### **🎨 LAYOUT ACTIVO:**
**`frontend/src/components/Layout/MainLayout.tsx`** - Layout principal con:
- Fondo bd4.png
- Sidebar colapsible
- Header responsive
- Overlay con backdrop-blur

### **🔐 SISTEMA DE AUTENTICACIÓN ACTIVO:**
**`frontend/src/auth/AuthContext.tsx`** - Context principal de autenticación integrado en toda la app

---

## **📊 FLUJO DE DATOS:**

```
Usuario → LandingPage → MainApp → AppPage → NewApp → MainLayout → SafeConversor
                                                          ↓
Backend API ← ConversionService ← API Client ← SafeConversor
     ↓
Database (SQLite) → Conversion History → Frontend
```

---

## **🔍 ACLARACIONES IMPORTANTES:**

### **📄 Sobre las Páginas:**
- **NO EXISTE** un archivo llamado `AppPage.tsx`
- **SÍ EXISTE** `pages/app.tsx` con una **función** llamada `AppPage()`
- Esta función `AppPage()` simplemente retorna `<NewApp />`
- **`NewApp.tsx`** es la aplicación principal real donde está toda la lógica

### **🎮 Sobre el Controlador Principal:**
- **`MainApp.tsx`** es quien decide si mostrar landing o app
- **`LandingPage.tsx`** está en `components/` y la llama `MainApp.tsx`
- Al hacer clic "Entrar a la App" → `MainApp` cambia a llamar `AppPage`

### **⚙️ Sobre el Conversor Activo:**
- **`SafeConversor.tsx`** es el conversor principal que se usa actualmente
- Todos los demás conversores son alternativos o legacy
- Integra completamente con el sistema de créditos y análisis IA

---

## **🧪 TESTING Y DESARROLLO:**

### **🔬 ANCLORA TESTING SUITE:**
- `anclora-testing-suite/` - **SUITE DE TESTING COMPLETA**
- `anclora-testing-suite/main.py` - Aplicación Streamlit de testing
- `anclora-testing-suite/src/` - Módulos de testing organizados

### **🧪 TESTS FRONTEND:**
- `frontend/src/auth/AuthContext.test.tsx` - Tests de autenticación
- `frontend/src/setupTests.ts` - Configuración de tests
- `frontend/vitest.config.ts` - Configuración Vitest

### **🐍 TESTS BACKEND:**
- `backend/tests/` - Suite de tests Python
- `backend/pytest.ini` - Configuración pytest

---

## **📚 DOCUMENTACIÓN:**

### **📖 DOCUMENTACIÓN TÉCNICA:**
- `docs/ARQUITECTURA_SISTEMA_ANCLORA_NEXUS.md` - Arquitectura completa del sistema
- `docs/BACKEND_ARCHITECTURE_ANCLORA.md` - Arquitectura específica del backend
- `docs/DEPLOYMENT_INSTRUCTIONS.md` - Instrucciones de despliegue
- `docs/ENTREGABLES_FINALES.md` - Documentación de entregables

### **📊 ANÁLISIS DEL PROYECTO:**
- `docs/project-analysis/` - Análisis completos del proyecto
- `docs/technical/` - Documentación técnica detallada
- `docs/specifications/` - Especificaciones del sistema

---

## **🛠️ SCRIPTS Y UTILIDADES:**

### **🔧 SCRIPTS DE MANTENIMIENTO:**
- `scripts/consolidar_carpetas.sh` - Consolidación de estructura
- `scripts/segundo_plan_limpieza.sh` - Limpieza del repositorio
- `scripts/cleanup_backend.py` - Limpieza específica del backend
- `scripts/maintenance/` - Scripts de mantenimiento

---

## **📦 DEPENDENCIAS PRINCIPALES:**

### **🎨 FRONTEND:**
- **React 18** - Framework principal
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **React Router** - Enrutamiento
- **Zustand/Context** - Gestión de estado

### **🐍 BACKEND:**
- **Flask/FastAPI** - Framework web
- **SQLAlchemy** - ORM para base de datos
- **SQLite** - Base de datos
- **Flask-JWT-Extended** - Autenticación JWT
- **Flask-CORS** - Manejo de CORS
- **Prometheus** - Métricas y monitoreo

---

## **🚀 COMANDOS DE DESARROLLO:**

### **💻 FRONTEND:**
```bash
cd frontend
npm install          # Instalar dependencias
npm run dev         # Servidor de desarrollo
npm run build       # Build de producción
npm run test        # Ejecutar tests
```

### **🐍 BACKEND:**
```bash
cd backend
pip install -r requirements.txt  # Instalar dependencias
python src/main.py              # Servidor de desarrollo
pytest                          # Ejecutar tests
```

### **🧪 TESTING SUITE:**
```bash
cd anclora-testing-suite
pip install -r requirements.txt
streamlit run main.py
```

---

## **🌐 PUERTOS Y SERVICIOS:**

- **Frontend (Vite):** `http://localhost:5173`
- **Backend (Flask):** `http://localhost:8000`
- **Testing Suite:** `http://localhost:8501`
- **API Endpoints:** `http://localhost:8000/api/`

---

## **🔄 ESTADO ACTUAL DEL PROYECTO:**

### **✅ COMPLETADO:**
- ✅ Arquitectura base frontend y backend
- ✅ Sistema de autenticación completo
- ✅ Conversor principal (SafeConversor) funcional
- ✅ Sistema de créditos implementado
- ✅ Análisis IA de contenido
- ✅ Layout responsive con glassmorphism
- ✅ Suite de testing completa

### **🔄 EN DESARROLLO:**
- 🔄 Optimización de conversiones
- 🔄 Mejoras en la UI/UX
- 🔄 Expansión de formatos soportados
- 🔄 Sistema de notificaciones

### **📋 PENDIENTE:**
- 📋 Despliegue a producción
- 📋 Documentación de usuario final
- 📋 Optimizaciones de rendimiento
- 📋 Tests de integración completos

---

**📅 Última actualización:** 04 de Septiempre> 2025
**🏗️ Versión de la arquitectura:** 2.0
**🎯 Estado:** Desarrollo activo - Listo para producción
**👥 Mantenido por:** Equipo Anclora Nexus
