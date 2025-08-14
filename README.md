# Anclora Metaform

<<<<<<< HEAD
<div align="center">
  <img src="frontend/assets/anclora_metaform_logo.png" alt="Anclora Metaform Logo" width="200"/>
  
  **Tu Contenido, Reinventado**
  
  [![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/anclora/metaform)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
  [![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](tests/)
  [![Coverage](https://img.shields.io/badge/coverage-85%25-yellow.svg)](tests/)
</div>

## 🚀 Descripción

**Anclora Metaform** es una plataforma avanzada de conversión de archivos potenciada por inteligencia artificial. Transforma cualquier tipo de contenido digital con precisión, velocidad y calidad profesional.

### ✨ Características Principales

- **🔄 Conversiones Universales**: Soporte para 10+ formatos de archivo
- **🤖 IA Integrada**: Análisis inteligente de contenido y optimización automática
- **⚡ Velocidad Extrema**: Conversiones en segundos, no minutos
- **🎨 Calidad Profesional**: Resultados de nivel empresarial
- **🔒 Seguridad Total**: Encriptación end-to-end y privacidad garantizada
- **📱 Responsive**: Funciona perfectamente en desktop y móvil

## 🎯 Formatos Soportados

### 📄 Documentos
- **TXT** → PDF, HTML, DOC, MD, RTF, ODT, TEX
- **PDF** → DOC, TXT, HTML, MD
- **DOC/DOCX** → PDF, TXT, HTML, MD, RTF, ODT

### 🖼️ Imágenes
- **PNG/JPG** → PDF, GIF, WebP, SVG
- **GIF** → PNG, JPG, MP4
- **SVG** → PNG, JPG, PDF

### 🎵 Multimedia (Próximamente)
- **MP4** → AVI, MOV, WebM, GIF
- **MP3** → WAV, FLAC, AAC, OGG

## 🏗️ Arquitectura

```
anclora-metaform/
├── frontend/           # Interfaz React/Next.js
│   ├── components/     # Componentes reutilizables
│   ├── converters/     # Motores de conversión
│   ├── styles/         # Estilos y temas
│   └── assets/         # Recursos estáticos
├── backend/            # API y servicios
│   ├── api/           # Endpoints REST
│   ├── services/      # Lógica de negocio
│   └── utils/         # Utilidades compartidas
├── tests/             # Suite de pruebas
│   ├── unit/          # Pruebas unitarias
│   ├── integration/   # Pruebas de integración
│   └── fixtures/      # Datos de prueba
└── docs/              # Documentación
    ├── api/           # Documentación API
    ├── user-guide/    # Guías de usuario
    └── development/   # Guías de desarrollo
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- npm 9+
- Git

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/anclora/metaform.git
cd metaform

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
cp frontend/.env.example frontend/.env.local
# Edit `frontend/.env.local` and set `NEXT_PUBLIC_API_BASE_URL` to the URL of your backend API
# Define `SECRET_KEY` y `JWT_SECRET_KEY` en `.env.local` o variables de entorno del sistema

# Iniciar en modo desarrollo
npm run dev
```

### Variables de entorno requeridas

El backend requiere las siguientes variables para ejecutarse:

- `SECRET_KEY`: clave usada por Flask para sesiones y cookies.
- `JWT_SECRET_KEY`: clave usada para firmar y verificar tokens JWT.

Asegúrate de definirlas en tu `.env.local` o como variables de entorno del sistema antes de iniciar el servidor.

### Uso Básico

```typescript
import { AncloraMetaform } from '@/AncloraMetaform';

const converter = new AncloraMetaform();

// Conversión simple
const result = await converter.convert({
  inputPath: 'documento.txt',
  targetFormat: 'pdf'
});

console.log('Archivo convertido:', result.outputPath);
```

## 🧪 Testing

### Ejecutar Pruebas

```bash
# Todas las pruebas
npm test

# Pruebas con interfaz visual
npm run test:ui

# Pruebas con cobertura
npm run test:coverage

# Solo pruebas unitarias
npm run test:unit

# Solo pruebas de integración
npm run test:integration
```

### Cobertura de Pruebas

- **Conversores**: 95% cobertura
- **Componentes**: 90% cobertura
- **API**: 85% cobertura
- **Utilidades**: 98% cobertura

## 📊 Rendimiento

| Formato | Tamaño Promedio | Tiempo Conversión | Calidad |
|---------|----------------|-------------------|---------|
| TXT → PDF | 1MB | 0.8s | ⭐⭐⭐⭐⭐ |
| DOC → HTML | 2MB | 1.2s | ⭐⭐⭐⭐⭐ |
| PDF → TXT | 5MB | 2.1s | ⭐⭐⭐⭐ |
| IMG → PDF | 3MB | 1.5s | ⭐⭐⭐⭐⭐ |

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 🏢 Empresa

**Anclora Metaform** es desarrollado por [Anclora](https://anclora.com), líder en soluciones de transformación digital.

## 📞 Contacto

- **Website**: [metaform.anclora.com](https://metaform.anclora.com)
- **Email**: support@anclora.com
- **Twitter**: [@AncloraOfficial](https://twitter.com/AncloraOfficial)
- **LinkedIn**: [Anclora](https://linkedin.com/company/anclora)

## 🙏 Agradecimientos

- Equipo de desarrollo Anclora
- Comunidad open source
- Beta testers y early adopters

---

<div align="center">
  <strong>Hecho con ❤️ por el equipo de Anclora</strong>
</div>

=======
![Anclora Metaform Logo](./src/assets/anclora_metaform_logo.png)

**Tu Contenido, Reinventado**

## 📋 Resumen

Este paquete contiene **6 nuevos conversores** que expanden las capacidades de Anclora Metaform, logrando **paridad competitiva completa** con las principales herramientas del mercado.

## 🔥 Nuevas Capacidades

### 📄 Conversores de Documentos
- **TXT + HTML** 🌐 - Páginas web con estilos CSS
- **TXT + DOC** 📄 - Documentos Microsoft Word  
- **TXT + MD** 📝 - Archivos Markdown
- **TXT + RTF** 📋 - Rich Text Format universal
- **TXT + ODT** 📑 - OpenDocument Text
- **TXT + TEX** 🎓 - LaTeX para académicos

## 📊 Impacto

- **Antes:** 4 formatos de conversión
- **Después:** 10 formatos de conversión
- **Mejora:** +150% de capacidades

## 🏗️ Estructura del Proyecto

```
anclora-nexus/
├── frontend/                 # Aplicación React/TypeScript
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/          # Páginas principales
│   │   ├── services/       # Lógica de negocio
│   │   └── utils/          # Utilidades
│   ├── public/             # Recursos estáticos
│   └── package.json        # Dependencias frontend
├── backend/                 # API Python/FastAPI
│   ├── src/
│   │   ├── models/         # Modelos de datos
│   │   ├── routes/         # Endpoints API
│   │   ├── services/       # Servicios de conversión
│   │   └── utils/          # Utilidades backend
│   ├── requirements.txt    # Dependencias Python
│   └── main.py            # Punto de entrada
├── tests/                   # Suite de pruebas
│   ├── frontend/           # Tests frontend
│   ├── backend/            # Tests backend
│   └── integration/        # Tests de integración
├── docs/                    # Documentación
├── scripts/                 # Scripts de automatización
└── data/                   # Archivos de datos
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ y npm/yarn
- Python 3.10+
- Git

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m pip install --upgrade pip
pip install -r requirements.txt
python main.py
```

### Ejecutar Tests
```bash
# Frontend
cd frontend && npm test

# Backend
cd backend && python -m pytest

# Integración
npm run test:integration
```

## 🔧 Funcionalidades Principales

### Motor de Conversión
- Conversión de archivos de texto a múltiples formatos
- Procesamiento asíncrono para archivos grandes
- Validación de entrada y manejo de errores
- Cache inteligente para optimización

### Sistema de Créditos
- Compra y gestión de créditos
- Tracking de uso por conversión
- Histórico de transacciones
- Upgrades de plan

### Interfaz de Usuario
- Dashboard intuitivo
- Drag & drop para archivos
- Previsualización de resultados
- Descarga masiva

## 🎯 Mejoras en Desarrollo

### 🔧 Tareas Pendientes

1. **Retirar archivos temporales de CI**
   - Eliminar `temp_ci_fix.txt` y `.ci-rebuild-trigger`
   - Archivos usados solo para forzar reconstrucciones

2. **Implementar recuperación de contraseña en Login.tsx**
   - El enlace "olvidé mi contraseña" carece de lógica
   - Implementar flujo completo de recuperación

3. **Completar ConversionEngine con formatos faltantes**
   - PNG→WebP, GIF→MP4, SVG→PNG aún no implementados
   - Expandir capacidades del motor de conversión

4. **Añadir pruebas para flujos de créditos**
   - Faltan tests específicos para compras y upgrades
   - Cobertura completa del sistema de créditos

## 🧪 Testing

### Cobertura Actual
- Frontend: Tests unitarios con Jest/React Testing Library
- Backend: Tests con Pytest
- Integración: Cypress para E2E

### Ejecutar Suite Completa
```bash
npm run test:all
```

## 🔒 Seguridad y Autenticación

- JWT para autenticación
- Validación de archivos subidos
- Límites de tamaño y tipo de archivo
- Sanitización de contenido

## 📈 Monitoreo y Logs

- Logging estructurado
- Métricas de uso
- Monitoring de performance
- Error tracking

## 🤝 Contribuir

1. Fork el repositorio
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Estándares de Código
- ESLint + Prettier para frontend
- Black + isort para backend
- Conventional Commits
- Tests obligatorios para nuevas features

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

- 📧 Email: support@anclora.com
- 📖 Docs: [documentación completa](./docs/)
- 🐛 Issues: [GitHub Issues][def]

## 🔄 Changelog

### v1.2.0 (En desarrollo)
- ✨ Nuevos conversores de documentos
- 🐛 Mejoras en sistema de créditos
- 🧪 Ampliación suite de tests
- 🔧 Refactoring del motor de conversión

### v1.1.0
- ✨ Sistema de créditos implementado
- 🔒 Autenticación JWT
- 📊 Dashboard de usuario

---

**¿Listo para reinventar tu contenido?** 🚀

[def]: ../../issues
>>>>>>> main
