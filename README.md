# Anclora Nexus

![Anclora Nexus Logo](./frontend/public/images/logos/logo-anclora-nexus.png)

**Tu Contenido, Reinventado**

## ðŸ“‹ Resumen

**Anclora Nexus** es una plataforma integral de transformaciÃ³n de contenido que incluye dos mÃ³dulos principales:

### ðŸ”„ **NÃºcleo de ConversiÃ³n**: 
Este paquete contiene **6 nuevos conversores** que expanden las capacidades de conversiÃ³n, logrando **paridad competitiva completa** con las principales herramientas del mercado.

### ðŸ“š **Anclora Press** (MÃ³dulo Opcional):
Herramienta avanzada para la **creaciÃ³n y publicaciÃ³n de libros digitales**, que permite importar documentos (.txt, .md, .doc, .docx, .pdf), editarlos para crear libros tanto digitales como fÃ­sicos, exportarlos a los formatos mÃ¡s relevantes del mercado, e incluso publicarlos.

## ðŸ”¥ Nuevas Capacidades

### ðŸ“„ Conversores de Documentos
- **TXT + HTML** ðŸŒ - PÃ¡ginas web con estilos CSS
- **TXT + DOC** ðŸ“„ - Documentos Microsoft Word  
- **TXT + MD** ðŸ“ - Archivos Markdown
- **TXT + RTF** ðŸ“‹ - Rich Text Format universal
- **TXT + ODT** ðŸ“‘ - OpenDocument Text
- **TXT + TEX** ðŸŽ“ - LaTeX para acadÃ©micos

## ðŸ“Š Impacto

- **Antes:** 4 formatos de conversiÃ³n
- **DespuÃ©s:** 10 formatos de conversiÃ³n
- **Mejora:** +150% de capacidades

## ðŸ—ï¸ Estructura del Proyecto

```
anclora-nexus/
â”œâ”€â”€ frontend/                 # AplicaciÃ³n React/TypeScript
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ components/      # Componentes reutilizables
â”‚   â”‚   â”œâ”€â”€ pages/          # PÃ¡ginas principales
â”‚   â”‚   â”œâ”€â”€ services/       # LÃ³gica de negocio
â”‚   â”‚   â””â”€â”€ utils/          # Utilidades
â”‚   â”œâ”€â”€ public/             # Recursos estÃ¡ticos
â”‚   â””â”€â”€ package.json        # Dependencias frontend
â”œâ”€â”€ backend/                 # API Python/FastAPI
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ models/         # Modelos de datos
â”‚   â”‚   â”œâ”€â”€ routes/         # Endpoints API
â”‚   â”‚   â”œâ”€â”€ services/       # Servicios de conversiÃ³n
â”‚   â”‚   â””â”€â”€ utils/          # Utilidades backend
â”‚   â”œâ”€â”€ tests/              # Suite de pruebas backend
â”‚   â”‚   â”œâ”€â”€ unit/           # Tests unitarios
â”‚   â”‚   â”œâ”€â”€ integration/    # Tests de integraciÃ³n
â”‚   â”‚   â””â”€â”€ utils/          # Utilidades de testing
â”‚   â”œâ”€â”€ requirements.txt    # Dependencias Python
â”‚   â””â”€â”€ main.py            # Punto de entrada
â”œâ”€â”€ docs/                    # DocumentaciÃ³n
â”œâ”€â”€ scripts/                 # Scripts de automatizaciÃ³n
â””â”€â”€ data/                   # Archivos de datos
```

## ðŸš€ InstalaciÃ³n y ConfiguraciÃ³n

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

La API expondrÃ¡ un endpoint de mÃ©tricas en `http://localhost:${PORT:-8000}/metrics` y mostrarÃ¡ logs segÃºn el nivel definido. El puerto puede configurarse mediante la variable de entorno `PORT` (por defecto `8000`).
```

### Variables de entorno (Backend)

Antes de ejecutar el backend, configura las siguientes variables de entorno:

- `SECRET_KEY`: clave usada por Flask para sesiones.
- `JWT_SECRET_KEY`: clave para firmar tokens JWT.
- `ALLOWED_ORIGINS`: lista separada por comas de orÃ­genes permitidos para CORS (ej. `http://localhost:3000,http://localhost:5173`). El comodÃ­n `*` se ignora por seguridad.
- `FLASK_DEBUG`: establece `true` para habilitar el modo debug (opcional).
- `LOG_LEVEL`: nivel de logs (`DEBUG`, `INFO`, `WARNING`, etc.). Opcional, por defecto `INFO`.

### Ejecutar Tests
```bash
# Frontend
cd frontend && npm test

# Backend
cd backend && python -m pytest tests/

# Ejecutar tests especÃ­ficos
cd backend && python -m pytest tests/unit/ -v
cd backend && python -m pytest tests/integration/ -v

# Frontend (Vitest)
cd frontend && npx vitest run

# Frontend (Vitest con cobertura)
cd frontend && npx vitest run --coverage
```

## ðŸ”§ Funcionalidades Principales

### Motor de ConversiÃ³n
- ConversiÃ³n de archivos de texto a mÃºltiples formatos
- Procesamiento asÃ­ncrono para archivos grandes
- ValidaciÃ³n de entrada y manejo de errores
- Cache inteligente para optimizaciÃ³n
- NormalizaciÃ³n de codificaciÃ³n a UTF-8 previa a la conversiÃ³n ([detalle](./docs/encoding_normalization.md))

### ðŸ“š Anclora Press (MÃ³dulo Opcional)
- **ImportaciÃ³n**: Soporta .txt, .md, .doc, .docx, .pdf
- **Editor Avanzado**: Herramientas profesionales para creaciÃ³n de libros
- **ExportaciÃ³n MÃºltiple**: Formatos estÃ¡ndar de la industria editorial
- **PublicaciÃ³n Directa**: IntegraciÃ³n con plataformas de publicaciÃ³n
- **Libros Digitales y FÃ­sicos**: Formatos optimizados para ambos medios

### Sistema de CrÃ©ditos
- Compra y gestiÃ³n de crÃ©ditos
- Tracking de uso por conversiÃ³n
- HistÃ³rico de transacciones
- Upgrades de plan

### Interfaz de Usuario
- Dashboard intuitivo
- Drag & drop para archivos
- PrevisualizaciÃ³n de resultados
- Descarga masiva

## ðŸŽ¯ Mejoras en Desarrollo

### ðŸ”§ Tareas Pendientes

1. **Retirar archivos temporales de CI**
   - Eliminar `temp_ci_fix.txt` y `.ci-rebuild-trigger`
   - Archivos usados solo para forzar reconstrucciones

2. **Implementar recuperaciÃ³n de contraseÃ±a en Login.tsx**
   - El enlace "olvidÃ© mi contraseÃ±a" carece de lÃ³gica
   - Implementar flujo completo de recuperaciÃ³n

3. **Completar ConversionEngine con formatos faltantes**
   - PNGâ†’WebP, GIFâ†’MP4, SVGâ†’PNG aÃºn no implementados
   - Expandir capacidades del motor de conversiÃ³n

4. **AÃ±adir pruebas para flujos de crÃ©ditos**
   - Faltan tests especÃ­ficos para compras y upgrades
   - Cobertura completa del sistema de crÃ©ditos

## ðŸ§ª Testing

### Cobertura Actual
- Frontend: Tests unitarios con Jest/React Testing Library
- Backend: Tests con Pytest
- IntegraciÃ³n: Cypress para E2E

### Ejecutar Suite Completa
```bash
npm run test:all
```

## ðŸ”’ Seguridad y AutenticaciÃ³n

- JWT para autenticaciÃ³n
- ValidaciÃ³n de archivos subidos
- LÃ­mites de tamaÃ±o y tipo de archivo
- SanitizaciÃ³n de contenido

## ðŸ“ˆ Monitoreo y Logs

- Logging estructurado
- MÃ©tricas de uso expuestas en `/metrics`
- Monitoring de performance
- Error tracking

## ðŸ¤ Contribuir

1. Fork el repositorio
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### EstÃ¡ndares de CÃ³digo
- ESLint + Prettier para frontend
- Black + isort para backend
- Conventional Commits
- Tests obligatorios para nuevas features

## ðŸ“„ Licencia

Este proyecto estÃ¡ bajo la Licencia MIT. Ver `LICENSE` para mÃ¡s detalles.

## ðŸ†˜ Soporte

- ðŸ“§ Email: support@anclora.com
- ðŸ“– Docs: [documentaciÃ³n completa](./docs/)
- ðŸ› Issues: [GitHub Issues][def]

## ðŸ”„ Changelog

### v2.0.0 (En desarrollo) - Anclora Nexus
- âœ¨ **Rebrand**: Anclora Nexus â†’ Anclora Nexus
- ðŸ“š **Nuevo**: MÃ³dulo Anclora Press para creaciÃ³n de libros
- âœ¨ Nuevos conversores de documentos
- ðŸ› Mejoras en sistema de crÃ©ditos
- ðŸ§ª AmpliaciÃ³n suite de tests
- ðŸ”§ Refactoring del motor de conversiÃ³n

### v1.1.0 - Anclora Nexus
- âœ¨ Sistema de crÃ©ditos implementado
- ðŸ”’ AutenticaciÃ³n JWT
- ðŸ“Š Dashboard de usuario

---

**Â¿Listo para reinventar tu contenido?** ðŸš€

[def]: ../../issues
