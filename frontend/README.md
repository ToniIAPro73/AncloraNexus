# Anclora Converter - Universal File Converter

## 🚀 Nueva Funcionalidad: Conversor Especializado de E-books

Anclora Converter ahora incluye un **conversor especializado de e-books** con funcionalidades avanzadas para la conversión entre diferentes formatos de libros electrónicos.

### ✨ Características Destacadas

- **🎯 Conversor Especializado**: Interfaz dedicada para e-books con validación automática
- **📚 Múltiples Formatos**: Soporte para PDF, EPUB, MOBI, AZW, AZW3, DOC, DOCX, HTML, RTF, TXT
- **🔍 Análisis de Metadatos**: Extracción y edición de información del libro (título, autor, etc.)
- **⚙️ Opciones Avanzadas**: Configuración de calidad, optimización por dispositivo
- **🎨 Diseño Anclora**: Siguiendo tokens de diseño oficiales para experiencia coherente

---

## 📋 Tabla de Contenidos

1. [Instalación Rápida](#instalación-rápida)
2. [Funcionalidades](#funcionalidades)
3. [Guía de Uso](#guía-de-uso)
4. [Documentación](#documentación)
5. [Desarrollo](#desarrollo)
6. [Contribuir](#contribuir)

---

## 🚀 Instalación Rápida

```bash
# Clonar repositorio
git clone https://github.com/ToniIAPro73/Anclora_Converter_Original.git

# Instalar dependencias
cd Anclora_Converter_Original
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus claves: SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_API_KEY

# Iniciar servidor backend
npm run start

# Iniciar desarrollo
npm run dev
```

**Accede a**: `http://localhost:5173`

📖 **Guía completa**: [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)

---

## 🎯 Funcionalidades

### Conversor Universal (Existente)
- ✅ Conversión de imágenes, videos, audio y documentos
- ✅ Drag & drop para carga de archivos
- ✅ Interfaz intuitiva y responsive
- ✅ Integración con Gemini API

### 🆕 Conversor de E-books (Nuevo)
- ✅ **Interfaz especializada** con navegación dedicada
- ✅ **Validación automática** de archivos y metadatos
- ✅ **Selector inteligente** de formatos con recomendaciones
- ✅ **Editor de metadatos** en línea
- ✅ **Opciones avanzadas** para conversión personalizada
- ✅ **Seguimiento en tiempo real** del progreso

### Formatos de E-books Soportados

| Entrada | Salida | Descripción |
|---------|--------|-------------|
| PDF | EPUB, MOBI, AZW3, TXT | Documentos con formato fijo |
| EPUB | PDF, MOBI, AZW3, TXT | Estándar de e-books |
| MOBI | EPUB, PDF, AZW3, TXT | Formato Kindle clásico |
| AZW/AZW3 | EPUB, PDF, MOBI, TXT | Formatos Amazon |
| DOC/DOCX | EPUB, PDF, MOBI, TXT | Documentos Word |
| HTML | EPUB, PDF, MOBI, TXT | Páginas web |
| RTF | EPUB, PDF, MOBI, TXT | Rich Text Format |
| TXT | EPUB, PDF, MOBI | Texto plano |

---

## 📖 Guía de Uso

### Acceso al Conversor de E-books

1. **Desde la página principal**: Haz clic en "Conversor especializado de E-books"
2. **Carga tu archivo**: Arrastra y suelta o usa el selector de archivos
3. **Revisa metadatos**: Verifica y edita la información del libro
4. **Selecciona formato**: Elige el formato de salida con recomendaciones
5. **Configura opciones**: Ajusta calidad y optimizaciones (opcional)
6. **Convierte**: Inicia el proceso y descarga el resultado

### Opciones Avanzadas

- **Calidad**: Baja (archivo pequeño) | Media (recomendado) | Alta (mejor calidad)
- **Dispositivo**: Genérico | Kindle | Kobo
- **Configuraciones**: Preservar metadatos, embebido de fuentes, compresión

---

## 📚 Documentación

### Guías de Usuario
- 📖 [**Guía de Funcionalidad de E-books**](./EBOOK_FUNCTIONALITY_GUIDE.md) - Uso completo de la nueva funcionalidad
- 🔧 [**Guía de Instalación**](./INSTALLATION_GUIDE.md) - Instalación paso a paso
- 📋 [**Changelog**](./CHANGELOG.md) - Historial de cambios

### Documentación Técnica
- 🏗️ [**Documentación Técnica**](./TECHNICAL_DOCUMENTATION.md) - Arquitectura y especificaciones
- 🎨 [**Tokens de Diseño Anclora**](./guia_de_estilos_anclora.md) - Guía de estilos

---

## 🛠️ Desarrollo

### Tecnologías Utilizadas

- **Frontend**: React 19.1.0, TypeScript, Vite
- **Estilos**: CSS Variables (Tokens Anclora), Responsive Design
- **Backend**: Supabase, Gemini API
- **Librerías**: JSZip, PDF-lib
- **Testing**: Vitest, Testing Library

### Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
npm run start    # Servidor backend
npm run test     # Ejecutar tests
```

### Estructura del Proyecto

```
Anclora_Converter_Original/
├── components/           # Componentes React
│   ├── EbookConverter.tsx
│   ├── EbookFormatSelector.tsx
│   ├── EbookMetadataViewer.tsx
│   └── EbookConverterPage.tsx
├── services/            # Servicios backend
│   ├── ebookConversionService.ts
│   ├── ebookValidationService.ts
│   └── ebookFormatService.ts
├── types/               # Definiciones TypeScript
│   └── ebook.ts
├── utils/               # Utilidades
│   ├── ebookConversionMaps.ts
│   ├── ebookConversionEngine.ts
│   └── ebookMetadataExtractor.ts
├── server/              # Servidor backend
└── [archivos principales]
```

---

## 🤝 Contribuir

### Cómo Contribuir

1. **Fork** el repositorio
2. **Crea** una rama: `git checkout -b feature/nueva-funcionalidad`
3. **Commit** cambios: `git commit -am 'Agregar nueva funcionalidad'`
4. **Push**: `git push origin feature/nueva-funcionalidad`
5. **Pull Request**: Crea un PR con descripción detallada

### Convenciones

- **Commits**: Usar [Conventional Commits](https://www.conventionalcommits.org/)
- **Código**: Seguir tokens de diseño Anclora
- **Tests**: Incluir tests para nuevas funcionalidades
- **Documentación**: Actualizar documentación relevante

---

## 🐛 Reportar Issues

¿Encontraste un bug o tienes una sugerencia?

- **GitHub Issues**: [Crear nuevo issue](https://github.com/ToniIAPro73/Anclora_Converter_Original/issues)
- **Incluye**: Descripción detallada, pasos para reproducir, capturas de pantalla

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

---

## 🙏 Agradecimientos

- **Equipo Anclora** por los tokens de diseño y guía de estilos
- **Comunidad Open Source** por las librerías utilizadas
- **Contribuidores** que han mejorado el proyecto

---

## 📞 Contacto

- **Repositorio**: https://github.com/ToniIAPro73/Anclora_Converter_Original
- **Issues**: Para bugs y solicitudes de funcionalidades
- **Documentación**: Consulta las guías en este repositorio

---

**¡Convierte tus e-books fácilmente con Anclora Converter!** 📚✨

