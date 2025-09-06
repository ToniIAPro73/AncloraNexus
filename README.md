# Anclora Nexus

![Anclora Nexus Logo](./frontend/public/images/logos/logo-anclora-nexus.png)

**Tu Contenido, Reinventado**

## 📹 Resumen

**Anclora Nexus** es una plataforma integral de transformación de contenido que incluye dos módulos principales:

### 🔄 **Núcleo de Conversión**: 
Este paquete contiene **6 nuevos conversores** que expanden las capacidades de conversión, logrando **paridad competitiva completa** con las principales herramientas del mercado.

### 📚 **Anclora Press** (Módulo Opcional):
Herramienta avanzada para la **creación y publicación de libros digitales**, que permite importar documentos (.txt, .md, .doc, .docx, .pdf), editarlos para crear libros tanto digitales como físicos, exportarlos a los formatos más relevantes del mercado, e incluso publicarlos.

## 🔥 Nuevas Capacidades

### 📄 Conversores de Documentos
- **TXT + HTML** 🌐 - Páginas web con estilos CSS
- **TXT + DOC** 📄 - Documentos Microsoft Word  
- **TXT + MD** 📝 - Archivos Markdown
- **TXT + RTF** 📹 - Rich Text Format universal
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
│   ├── tests/              # Suite de pruebas backend
│   │   ├── unit/           # Tests unitarios
│   │   ├── integration/    # Tests de integración
│   │   └── utils/          # Utilidades de testing
│   ├── requirements.txt    # Dependencias Python
│   └── main.py            # Punto de entrada
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

La API expondrá un endpoint de métricas en `http://localhost:${PORT:-8000}/metrics` y mostrará logs según el nivel definido. El puerto puede configurarse mediante la variable de entorno `PORT` (por defecto `8000`).
```

### Variables de entorno (Backend)

Antes de ejecutar el backend, configura las siguientes variables de entorno:

- `SECRET_KEY`: clave usada por Flask para sesiones.
- `JWT_SECRET_KEY`: clave para firmar tokens JWT.
- `ALLOWED_ORIGINS`: lista separada por comas de orígenes permitidos para CORS (ej. `http://localhost:3000,http://localhost:5173`). El comodín `*` se ignora por seguridad.
- `FLASK_DEBUG`: establece `true` para habilitar el modo debug (opcional).
- `LOG_LEVEL`: nivel de logs (`DEBUG`, `INFO`, `WARNING`, etc.). Opcional, por defecto `INFO`.

### Ejecutar Tests
```bash
# Frontend
cd frontend && npm test

# Backend
cd backend && python -m pytest tests/

# Ejecutar tests específicos
cd backend && python -m pytest tests/unit/ -v
cd backend && python -m pytest tests/integration/ -v

# Frontend (Vitest)
cd frontend && npx vitest run

# Frontend (Vitest con cobertura)
cd frontend && npx vitest run --coverage
```

## 🔧 Funcionalidades Principales

### Motor de Conversión
- Conversión de archivos de texto a múltiples formatos
- Procesamiento asíncrono para archivos grandes
- Validación de entrada y manejo de errores
- Cache inteligente para optimización
- Normalización de codificación a UTF-8 previa a la conversión ([detalle](./docs/encoding_normalization.md))

### 📚 Anclora Press (Módulo Opcional)
- **Importación**: Soporta .txt, .md, .doc, .docx, .pdf
- **Editor Avanzado**: Herramientas profesionales para creación de libros
- **Exportación Múltiple**: Formatos estándar de la industria editorial
- **Publicación Directa**: Integración con plataformas de publicación
- **Libros Digitales y Físicos**: Formatos optimizados para ambos medios

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
- Métricas de uso expuestas en `/metrics`
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

## 🙘 Soporte

- 📧 Email: support@anclora.com
- 📖 Docs: [documentación completa](./docs/)
- 🐛 Issues: [GitHub Issues][def]

## 🔄 Changelog

### v2.0.0 (En desarrollo) - Anclora Nexus
- ✨ **Rebrand**: Anclora Nexus → Anclora Nexus
- 📚 **Nuevo**: Módulo Anclora Press para creación de libros
- ✨ Nuevos conversores de documentos
- 🐛 Mejoras en sistema de créditos
- 🧪 Ampliación suite de tests
- 🔧 Refactoring del motor de conversión

### v1.1.0 - Anclora Nexus
- ✨ Sistema de créditos implementado
- 🔒 Autenticación JWT
- 📊 Dashboard de usuario

---

**¿Listo para reinventar tu contenido?** 🚀

[def]: ../../issues

## Documento de Mejora
- Informe: [MEJORA_ANCLORA_NEXUS.md](./docs/MEJORA_ANCLORA_NEXUS.md)
