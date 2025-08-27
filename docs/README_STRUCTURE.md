# 📁 Estructura del Proyecto Anclora Nexus

Este documento describe la organización del proyecto después de la limpieza y reorganización.

## 🗂️ Estructura Principal

```
Anclora_Nexus/
├── 📁 backend/                    # Código del servidor
├── 📁 frontend/                   # Código del cliente React
├── 📁 data/                       # Archivos de datos y testing
├── 📁 docs/                       # Documentación organizada
├── 📁 scripts/                    # Scripts organizados
├── 📄 .env.example               # Template de variables de entorno
├── 📄 .gitignore                 # Archivos a ignorar en Git
├── 📄 CHANGELOG.md               # Registro de cambios
├── 📄 CONTRIBUTING.md            # Guía de contribución
├── 📄 LICENSE                    # Licencia del proyecto
└── 📄 README.md                  # Documentación principal
```

## 📚 Documentación (docs/)

### 📊 project-analysis/
Análisis y reportes del estado del proyecto:
- `ANALISIS_COMPLETO_REPOSITORIO.md`
- `FASE_3_COMPLETADA.md`
- `FRONTEND_FIX_SUMMARY.md`
- `REBRANDING_SUMMARY.md`
- `TESTING_SUMMARY.md`
- `GEMINI.md`

### 📖 guides/
Manuales y guías de uso:
- `MANUAL_EJECUCION_Y_PRUEBAS.md`
- `AUTHENTICATION_SETUP.md`

### ⚙️ setup/
Configuración y variables de entorno:
- `.env.example.consolidated`
- `.env.staging`

### 📋 Otras carpetas existentes:
- `market-analysis/` - Análisis de mercado
- `technical/` - Documentación técnica
- `user-guide/` - Manuales de usuario
- `specifications/` - Especificaciones técnicas
- `design/` - Guías de diseño
- `development/` - Recursos de desarrollo

## 🔧 Scripts (scripts/)

### 🚀 deployment/
Scripts de despliegue:
- `docker-compose.staging.yml`

### 🛠️ maintenance/
Scripts de mantenimiento:
- `apply_patch.py`
- `mover-assets.ps1`

### 📋 Otros scripts existentes:
- `test_files/` - Archivos de prueba
- `windows/` - Scripts para Windows
- Varios scripts de automatización y testing

## 💾 Datos (data/)

Archivos de datos y testing:
- `test_conversion.txt`
- `conversions/` - Datos de conversiones
- `formats/` - Información de formatos

## 🎯 Beneficios de esta Organización

1. **📁 Estructura Clara**: Cada tipo de archivo en su lugar apropiado
2. **🔍 Fácil Navegación**: Encontrar documentos por categoría
3. **🧹 Proyecto Limpio**: Solo archivos esenciales en la raíz
4. **👥 Colaboración**: Otros desarrolladores entienden la estructura
5. **📈 Escalabilidad**: Fácil agregar nueva documentación

## 🚀 Próximos Pasos

- Mantener esta estructura al agregar nuevos archivos
- Revisar periódicamente y reorganizar si es necesario
- Actualizar este README al hacer cambios estructurales

---
*Estructura organizada el 27/08/2025 - Anclora Nexus Team*
