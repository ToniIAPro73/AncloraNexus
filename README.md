# Anclora Converter - Aplicación Completa

**Versión:** 1.0.0  
**Fecha:** 14 de Julio, 2025  
**Desarrollado por:** Manus AI  

## Descripción

Anclora Converter es una aplicación completa de conversión de archivos que incluye un frontend React moderno y un backend Flask robusto. La aplicación soporta 144 tipos de conversiones diferentes, sistema de usuarios, pagos por conversión, y un programa avanzado de recompensas.

## Estructura del Proyecto

```
anclora_converter_complete/
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── auth/           # Sistema de autenticación
│   │   ├── services/       # Servicios API
│   │   ├── utils/          # Utilidades
│   │   └── types/          # Tipos TypeScript
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/                 # API Flask
│   ├── src/
│   │   ├── models/         # Modelos de base de datos
│   │   ├── routes/         # Endpoints de la API
│   │   ├── services/       # Lógica de negocio
│   │   ├── tasks/          # Tareas programadas
│   │   └── utils/          # Utilidades
│   ├── requirements.txt
│   └── gunicorn.conf.py
├── docs/                   # Documentación
├── scripts/                # Scripts de utilidad
└── README.md              # Este archivo
```

## Características Principales

### 🎯 **Frontend React**
- **Interfaz moderna** con Tailwind CSS
- **144 conversiones** soportadas
- **Sistema de autenticación** integrado
- **Dashboard de usuario** completo
- **Sistema de créditos** y pagos
- **Responsive design** para móvil y desktop

### ⚙️ **Backend Flask**
- **API RESTful** completa con 144 endpoints
- **Sistema de usuarios** con 4 niveles de suscripción
- **Pagos por conversión** con Stripe
- **Sistema de recompensas** y gamificación
- **Retención temporal** de archivos
- **Arquitectura escalable** y modular

### 💰 **Modelo de Negocio**
- **Planes de suscripción:** Gratuito, Básico, Pro, Enterprise
- **Pagos individuales:** Por conversión sin suscripción
- **Sistema de créditos:** Flexibilidad adicional
- **Programa de recompensas:** 10 niveles, 15 logros, desafíos semanales

## Instalación y Configuración

### Prerrequisitos

- **Node.js** 18+ y npm/yarn
- **Python** 3.11+
- **PostgreSQL** 14+ (o SQLite para desarrollo)
- **Redis** 6+ (opcional, para caching)

### 1. Configuración del Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tu configuración
# VITE_API_BASE_URL=http://localhost:5000/api
# VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

### 2. Configuración del Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tu configuración
# DATABASE_URL=postgresql://user:pass@localhost/anclora_db
# JWT_SECRET_KEY=tu-clave-secreta
# STRIPE_SECRET_KEY=sk_test_...

# Crear base de datos (PostgreSQL)
createdb anclora_db

# Inicializar base de datos
python -c "
from src.main import create_app
app = create_app()
with app.app_context():
    from src.models import db
    db.create_all()
    print('Base de datos inicializada')
"

# Iniciar servidor de desarrollo
python src/main.py
```

El backend estará disponible en `http://localhost:5000`

### 3. Configuración Completa

Una vez que ambos servidores estén ejecutándose:

1. **Frontend:** `http://localhost:3000`
2. **Backend API:** `http://localhost:5000`
3. **Documentación API:** `http://localhost:5000/api/health`

## Variables de Entorno

### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_APP_ENV=development
VITE_ENABLE_DEBUG=true
```

### Backend (.env)
```bash
# Base de datos
DATABASE_URL=postgresql://user:pass@localhost/anclora_db

# JWT
JWT_SECRET_KEY=clave-super-secreta

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
MAX_CONTENT_LENGTH=524288000  # 500MB

# Redis (opcional)
REDIS_URL=redis://localhost:6379/0
```

## Scripts Disponibles

### Frontend
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build
npm run lint         # Linting del código
```

### Backend
```bash
python src/main.py                    # Servidor de desarrollo
python backend_testing_suite.py      # Ejecutar tests
gunicorn -c gunicorn.conf.py "src.main:create_app()"  # Servidor de producción
```

## API Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login de usuario
- `GET /api/auth/me` - Información del usuario

### Conversiones
- `GET /api/conversion/supported-formats` - Formatos soportados
- `POST /api/conversion/convert` - Realizar conversión
- `GET /api/conversion/queue/status` - Estado de la cola

### Pagos
- `POST /api/payments/estimate` - Estimar precio
- `POST /api/payments/create-payment-intent` - Crear pago
- `GET /api/payments/transactions` - Historial de pagos

### Recompensas
- `GET /api/rewards/profile` - Perfil de recompensas
- `GET /api/rewards/leaderboard` - Tabla de líderes
- `POST /api/rewards/redeem-credits` - Canjear puntos

## Funcionalidades Implementadas

### ✅ **Sistema de Usuarios**
- Registro y autenticación JWT
- 4 niveles de suscripción
- Perfiles de usuario completos
- Gestión de sesiones

### ✅ **Motor de Conversión**
- 144 conversiones soportadas
- Estimación de tiempos
- Cola de procesamiento
- Estados en tiempo real

### ✅ **Sistema de Pagos**
- Precios dinámicos
- Integración con Stripe
- Transacciones completas
- Reembolsos automatizados

### ✅ **Gamificación**
- 10 niveles de usuario
- 15 logros desbloqueables
- Desafíos semanales
- Tabla de líderes
- Sistema de puntos

### ✅ **Gestión de Archivos**
- Retención temporal inteligente
- Limpieza automática
- Organización por fechas
- Extensión con créditos

## Testing

### Ejecutar Tests del Backend
```bash
cd backend
python backend_testing_suite.py
```

### Resultados Esperados
- ✅ Health Check: API funcionando
- ✅ Formatos: 144 conversiones disponibles
- ✅ Precios: Estimación dinámica
- ✅ Autenticación: JWT protegido

## Despliegue en Producción

Para despliegue en producción, consultar:
- `docs/GUIA_DESPLIEGUE_PRODUCCION.md` - Guía completa de despliegue
- `docs/DOCUMENTACION_TECNICA_BACKEND.md` - Documentación técnica

### Resumen de Despliegue

1. **Configurar servidor** (Ubuntu 22.04 recomendado)
2. **Instalar dependencias** (PostgreSQL, Redis, Nginx)
3. **Configurar variables de entorno** de producción
4. **Build del frontend** (`npm run build`)
5. **Configurar Gunicorn** para el backend
6. **Configurar Nginx** como proxy reverso
7. **Configurar SSL** con Let's Encrypt

## Documentación Adicional

- `docs/DOCUMENTACION_TECNICA_BACKEND.md` - Documentación técnica completa (50+ páginas)
- `docs/GUIA_DESPLIEGUE_PRODUCCION.md` - Manual de despliegue (40+ páginas)
- `docs/BACKEND_ARCHITECTURE_ANCLORA.md` - Arquitectura del sistema
- `docs/RESUMEN_EJECUTIVO_BACKEND_ANCLORA.md` - Resumen ejecutivo

## Soporte y Contribución

### Reportar Problemas
1. Verificar que el problema no esté ya reportado
2. Incluir información del entorno (OS, versiones)
3. Proporcionar pasos para reproducir
4. Incluir logs relevantes

### Desarrollo
1. Fork del repositorio
2. Crear rama para la feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

- **Email:** support@anclora.com
- **Website:** https://anclora.com
- **Documentación:** https://docs.anclora.com

---

**Desarrollado con ❤️ por Manus AI**

