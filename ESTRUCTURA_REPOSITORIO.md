# Estructura del Repositorio - Anclora Converter

## Qué Incluir en el Repositorio

### ✅ **ARCHIVOS ESENCIALES PARA EL REPOSITORIO:**

#### **📁 Frontend (React)**
```
frontend/
├── src/                     # ✅ Código fuente React
├── public/                  # ✅ Archivos públicos
├── package.json            # ✅ Dependencias y scripts
├── vite.config.ts          # ✅ Configuración de Vite
├── tailwind.config.js      # ✅ Configuración de Tailwind
├── tsconfig.json           # ✅ Configuración de TypeScript
├── postcss.config.js       # ✅ Configuración de PostCSS
├── .env.example            # ✅ Variables de entorno de ejemplo
└── README.md               # ✅ Documentación del frontend
```

#### **📁 Backend (Flask)**
```
backend/
├── src/                    # ✅ Código fuente Python
│   ├── models/            # ✅ Modelos de base de datos
│   ├── routes/            # ✅ Endpoints de la API
│   ├── services/          # ✅ Lógica de negocio
│   ├── tasks/             # ✅ Tareas programadas
│   ├── utils/             # ✅ Utilidades
│   └── main.py            # ✅ Aplicación principal
├── requirements.txt        # ✅ Dependencias Python
├── gunicorn.conf.py       # ✅ Configuración de Gunicorn
├── .env.example           # ✅ Variables de entorno de ejemplo
└── test_server.py         # ✅ Script de testing
```

#### **📁 Documentación**
```
docs/
├── DOCUMENTACION_TECNICA_BACKEND.md     # ✅ Documentación técnica
├── GUIA_DESPLIEGUE_PRODUCCION.md       # ✅ Guía de despliegue
├── BACKEND_ARCHITECTURE_ANCLORA.md     # ✅ Arquitectura del sistema
└── RESUMEN_EJECUTIVO_BACKEND_ANCLORA.md # ✅ Resumen ejecutivo
```

#### **📁 Scripts**
```
scripts/
├── setup.sh               # ✅ Script de configuración automática
├── start_frontend.sh      # ✅ Script para iniciar frontend
├── start_backend.sh       # ✅ Script para iniciar backend
└── start_all.sh           # ✅ Script para iniciar todo
```

#### **📄 Archivos Raíz**
```
├── README.md              # ✅ Documentación principal
├── .gitignore             # ✅ Archivos a ignorar en Git
├── LICENSE                # ✅ Licencia del proyecto
└── ESTRUCTURA_REPOSITORIO.md # ✅ Esta guía
```

### ❌ **ARCHIVOS QUE NO DEBEN IR EN EL REPOSITORIO:**

#### **🚫 Variables de Entorno Reales**
```
❌ frontend/.env           # Contiene claves reales
❌ backend/.env            # Contiene claves reales
✅ frontend/.env.example   # Plantilla sin claves
✅ backend/.env.example    # Plantilla sin claves
```

#### **🚫 Dependencias y Build**
```
❌ frontend/node_modules/  # Dependencias de Node.js
❌ frontend/dist/          # Build de producción
❌ backend/venv/           # Entorno virtual Python
❌ backend/__pycache__/    # Cache de Python
```

#### **🚫 Archivos de Usuario**
```
❌ uploads/                # Archivos subidos por usuarios
❌ logs/                   # Logs de la aplicación
❌ *.db                    # Bases de datos locales
❌ *.sqlite                # Bases de datos SQLite
```

#### **🚫 Configuración Local**
```
❌ .vscode/                # Configuración de VS Code
❌ .idea/                  # Configuración de IntelliJ
❌ *.local                 # Archivos de configuración local
```

## Estructura Recomendada Final

```
anclora_converter_complete/
├── 📁 frontend/                    # Aplicación React
│   ├── 📁 src/
│   │   ├── 📁 components/         # Componentes React
│   │   ├── 📁 auth/              # Sistema de autenticación
│   │   ├── 📁 services/          # Servicios API
│   │   ├── 📁 utils/             # Utilidades
│   │   ├── 📁 types/             # Tipos TypeScript
│   │   ├── 📁 hooks/             # Custom hooks
│   │   ├── 📁 pages/             # Páginas de la aplicación
│   │   ├── 📄 main.tsx           # Punto de entrada
│   │   ├── 📄 App.tsx            # Componente principal
│   │   └── 📄 index.css          # Estilos principales
│   ├── 📁 public/                # Archivos públicos
│   ├── 📄 package.json           # Dependencias y scripts
│   ├── 📄 vite.config.ts         # Configuración de Vite
│   ├── 📄 tailwind.config.js     # Configuración de Tailwind
│   ├── 📄 tsconfig.json          # Configuración de TypeScript
│   ├── 📄 postcss.config.js      # Configuración de PostCSS
│   └── 📄 .env.example           # Variables de entorno ejemplo
├── 📁 backend/                    # API Flask
│   ├── 📁 src/
│   │   ├── 📁 models/            # Modelos de base de datos
│   │   ├── 📁 routes/            # Endpoints de la API
│   │   ├── 📁 services/          # Lógica de negocio
│   │   ├── 📁 tasks/             # Tareas programadas
│   │   ├── 📁 utils/             # Utilidades
│   │   ├── 📄 main.py            # Aplicación principal
│   │   └── 📄 config.py          # Configuración
│   ├── 📄 requirements.txt       # Dependencias Python
│   ├── 📄 gunicorn.conf.py      # Configuración de Gunicorn
│   ├── 📄 .env.example          # Variables de entorno ejemplo
│   └── 📄 test_server.py        # Script de testing
├── 📁 docs/                      # Documentación
│   ├── 📄 DOCUMENTACION_TECNICA_BACKEND.md
│   ├── 📄 GUIA_DESPLIEGUE_PRODUCCION.md
│   ├── 📄 BACKEND_ARCHITECTURE_ANCLORA.md
│   └── 📄 RESUMEN_EJECUTIVO_BACKEND_ANCLORA.md
├── 📁 scripts/                   # Scripts de utilidad
│   ├── 📄 setup.sh              # Configuración automática
│   ├── 📄 start_frontend.sh     # Iniciar frontend
│   ├── 📄 start_backend.sh      # Iniciar backend
│   └── 📄 start_all.sh          # Iniciar todo
├── 📄 README.md                  # Documentación principal
├── 📄 .gitignore                 # Archivos a ignorar
├── 📄 LICENSE                    # Licencia del proyecto
└── 📄 ESTRUCTURA_REPOSITORIO.md  # Esta guía
```

## Comandos para Configurar el Repositorio

### 1. Clonar/Inicializar
```bash
# Si es un repositorio nuevo
git init
git add .
git commit -m "Initial commit: Anclora Converter v1.0.0"

# Si es un repositorio existente
git clone <tu-repositorio>
cd anclora-converter
```

### 2. Configuración Automática
```bash
# Ejecutar script de setup
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 3. Configuración Manual

#### Frontend:
```bash
cd frontend
npm install
cp .env.example .env
# Editar .env con tu configuración
npm run dev
```

#### Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Editar .env con tu configuración
python src/main.py
```

## Variables de Entorno Necesarias

### Frontend (.env.example)
```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_APP_ENV=development
VITE_ENABLE_DEBUG=true
```

### Backend (.env.example)
```bash
# Base de datos
DATABASE_URL=postgresql://user:pass@localhost/anclora_db

# JWT
JWT_SECRET_KEY=clave-super-secreta-cambiar-en-produccion

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-app-password

# Almacenamiento
UPLOAD_FOLDER=./uploads
MAX_CONTENT_LENGTH=524288000

# Redis (opcional)
REDIS_URL=redis://localhost:6379/0
```

## Flujo de Desarrollo

### 1. Desarrollo Local
```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
python src/main.py

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 2. Testing
```bash
# Backend
cd backend
python backend_testing_suite.py

# Frontend
cd frontend
npm run lint
npm run build
```

### 3. Despliegue
```bash
# Build de producción
cd frontend
npm run build

# Configurar servidor según docs/GUIA_DESPLIEGUE_PRODUCCION.md
```

## Tamaño del Repositorio

### Estimación de Archivos:
- **Código fuente:** ~50 archivos, ~5MB
- **Documentación:** ~10 archivos, ~2MB
- **Configuración:** ~15 archivos, ~1MB
- **Total repositorio:** ~75 archivos, ~8MB

### Archivos Excluidos (.gitignore):
- **node_modules/:** ~300MB
- **venv/:** ~100MB
- **dist/build/:** ~20MB
- **uploads/logs/:** Variable

## Recomendaciones

### ✅ **Incluir en el Repositorio:**
1. Todo el código fuente
2. Archivos de configuración (.example)
3. Documentación esencial
4. Scripts de automatización
5. Tests y ejemplos

### ❌ **NO Incluir en el Repositorio:**
1. Variables de entorno reales
2. Dependencias (node_modules, venv)
3. Archivos de build/dist
4. Archivos de usuario (uploads)
5. Logs y bases de datos locales
6. Configuración de IDEs

### 🔧 **Configuración Recomendada:**
1. Usar .env.example para plantillas
2. Documentar todas las variables necesarias
3. Incluir scripts de setup automático
4. Mantener README.md actualizado
5. Usar .gitignore completo

Esta estructura garantiza que el repositorio sea limpio, profesional y fácil de configurar para cualquier desarrollador.

