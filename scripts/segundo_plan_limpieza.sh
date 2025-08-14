#!/bin/bash
# segundo_plan_limpieza.sh

echo "🧹 Ejecutando SEGUNDO PLAN de limpieza para AncloraMetaform..."
echo "📍 Directorio: $(pwd)"

# Verificar que estamos en el directorio correcto
if [ ! -f "README.md" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Ejecutar desde la raíz del repositorio AncloraMetaform"
    exit 1
fi

# Crear backup del estado actual
echo "💾 Creando backup del estado actual..."
git branch backup-segundo-plan-$(date +%Y%m%d-%H%M%S) 2>/dev/null || echo "⚠️ No se pudo crear rama de backup"

# FASE 1: Crear estructura de directorios faltante
echo "📁 Creando estructura de directorios completa..."
mkdir -p {data/{conversions,formats},assets/{images,logos}}
mkdir -p docs/{technical,specifications,development/{testing,prompts}}
mkdir -p tests/{unit,integration/{html},fixtures/{html},utils}
mkdir -p frontend/{public,src/{components,pages,styles,utils,types}}

# FASE 2: Mover código fuente a frontend/src
echo "🔄 Moviendo código fuente a frontend/src..."
[ -f "App.tsx" ] && mv "App.tsx" "frontend/src/"
[ -f "index.tsx" ] && mv "index.tsx" "frontend/src/"
[ -f "index.css" ] && mv "index.css" "frontend/src/"
[ -f "UniversalConverter.tsx" ] && mv "UniversalConverter.tsx" "frontend/src/components/"
[ -f "index.html" ] && mv "index.html" "frontend/public/"

# FASE 3: Reorganizar archivos de prueba
echo "🧪 Reorganizando archivos de prueba..."
[ -f "archives-test.ts" ] && mv "archives-test.ts" "tests/unit/archives.test.ts"
[ -f "document-tests.ts" ] && mv "document-tests.ts" "tests/unit/document.test.ts"
[ -f "images-test.ts" ] && mv "images-test.ts" "tests/unit/images.test.ts"
[ -f "media-tests.ts" ] && mv "media-tests.ts" "tests/unit/media.test.ts"
[ -f "sequential-conversions-test.ts" ] && mv "sequential-conversions-test.ts" "tests/integration/"
[ -f "test-helpers.ts" ] && mv "test-helpers.ts" "tests/utils/"

# Mover fixtures
[ -f "archive-fixtures.md" ] && mv "archive-fixtures.md" "tests/fixtures/"
[ -f "document-fixtures.md" ] && mv "document-fixtures.md" "tests/fixtures/"
[ -f "image-fixtures.md" ] && mv "image-fixtures.md" "tests/fixtures/"
[ -f "media-fixtures.md" ] && mv "media-fixtures.md" "tests/fixtures/"

# Mover archivos HTML de prueba
for file in test_output_*.html; do
    [ -f "$file" ] && mv "$file" "tests/fixtures/html/"
done

for file in integration_*.html; do
    [ -f "$file" ] && mv "$file" "tests/integration/html/"
done

# FASE 4: Mover configuraciones
echo "⚙️ Reorganizando configuraciones..."
[ -f "vitest.config.ts" ] && mv "vitest.config.ts" "tests/"
[ -f "vitest.setup.ts" ] && mv "vitest.setup.ts" "tests/"
[ -f "vite.config.ts" ] && mv "vite.config.ts" "frontend/"

# Consolidar tsconfig.json
if [ -f "tsconfig.json" ] && [ -f "frontend/tsconfig.json" ]; then
    echo "🔄 Consolidando tsconfig.json..."
    # Mover el de raíz al frontend (generalmente más completo)
    mv "tsconfig.json" "frontend/"
fi

# FASE 5: Organizar documentación por categorías
echo "📚 Organizando documentación por categorías..."

# Análisis de mercado
mv "Empresas Líderes Mundiales en el Mercado de Conver.md" "docs/market-analysis/" 2>/dev/null
mv "Comparativa de Precios y Políticas de los principales conversores.md" "docs/market-analysis/" 2>/dev/null
mv "Fuentes Académicas sobre el Mercado de Conversione.pdf" "docs/market-analysis/" 2>/dev/null

# Documentación técnica
mv "AnálisisdeSecuenciasdeConversiónconMúltiples.md" "docs/technical/conversion-sequences.md" 2>/dev/null
mv "DiseñodeArquitecturaparaFuncionalidaddeConversióndeE-books.md" "docs/technical/ebook-architecture.md" 2>/dev/null
mv "BeneficiosdeIncluirunAgentedeInteligenciaAr.md" "docs/technical/ai-agent-benefits.md" 2>/dev/null

# Especificaciones
mv "Matriz Completa de Casos de Uso de Conversiones de archivos.docx" "docs/specifications/" 2>/dev/null
mv "Matriz Completa de Casos de Uso de Conversiones de.md" "docs/specifications/" 2>/dev/null
mv "Matriz Completa de Conversiones de Archivos_ Conve.docx" "docs/specifications/" 2>/dev/null

# Documentación de desarrollo
mv "Batería de Pruebas Exhaustiva para Aplicación de Conversión.docx" "docs/development/testing/" 2>/dev/null
mv "Batería de Pruebas Vitest para Anclora Metaform (Extendida).js" "docs/development/testing/" 2>/dev/null
mv "CómoAmpliarelCatálogodeConversionessinCompl(1).docx" "docs/development/expansion-guide.docx" 2>/dev/null

# Guías de usuario y diseño
mv "Guiabuenaspracticaselaboracionmanualusuario.docx" "docs/user-guide/manual-best-practices.docx" 2>/dev/null
mv "guia_de_estilos_anclora.md" "docs/design/style-guide.md" 2>/dev/null

# Prompts y desarrollo
mv "Promptmejoraretratoenflux-prokontext.html" "docs/development/prompts/" 2>/dev/null
mv "prompt_convertido.html" "docs/development/prompts/" 2>/dev/null

# FASE 6: Organizar archivos de datos
echo "📊 Organizando archivos de datos..."
[ -f "metadata.json" ] && mv "metadata.json" "data/"
[ -f "catalogo_conversiones.txt" ] && mv "catalogo_conversiones.txt" "data/conversion-catalog.txt"
[ -f "document_formats_reference.csv" ] && mv "document_formats_reference.csv" "data/formats/"
[ -f "matriz_conversiones_completa.csv" ] && mv "matriz_conversiones_completa.csv" "data/conversions/"

for file in conversiones_*.csv; do
    [ -f "$file" ] && mv "$file" "data/conversions/"
done

# FASE 7: Consolidar archivos duplicados
echo "🔄 Consolidando archivos duplicados..."
if [ -f "Tareaarealizar.md" ] || [ -f "Tareasarealizar.md" ]; then
    echo "# Tareas a Realizar - Consolidado" > "docs/development/tasks.md"
    echo "" >> "docs/development/tasks.md"
    [ -f "Tareaarealizar.md" ] && cat "Tareaarealizar.md" >> "docs/development/tasks.md" && rm "Tareaarealizar.md"
    [ -f "Tareasarealizar.md" ] && echo -e "\n---\n" >> "docs/development/tasks.md" && cat "Tareasarealizar.md" >> "docs/development/tasks.md" && rm "Tareasarealizar.md"
fi

# FASE 8: Eliminar archivos temporales y duplicados
echo "🗑️ Eliminando archivos temporales..."
rm -f test.txt test_document.txt pasted_content.txt sandbox.txt
rm -f vitest-config.ts  # Mantener solo vitest.config.ts
rm -f conversacion_agente_programacion_gemini.txt  # Mantener solo .docx

# FASE 9: Mover assets
echo "🖼️ Organizando assets..."
[ -f "Gemini_Generated_logo_Anclora_Metaform_2.png" ] && mv "Gemini_Generated_logo_Anclora_Metaform_2.png" "assets/logos/"

# FASE 10: Crear package.json raíz si no existe
if [ ! -f "package.json" ]; then
    echo "📦 Creando package.json raíz..."
    cat > package.json << 'EOF'
{
  "name": "anclora-metaform",
  "version": "1.0.0",
  "description": "Plataforma avanzada de conversión de archivos potenciada por IA",
  "private": true,
  "workspaces": [
    "frontend"
  ],
  "scripts": {
    "dev": "cd frontend && npm run dev",
    "build": "cd frontend && npm run build",
    "test": "cd tests && npm test",
    "lint": "cd frontend && npm run lint",
    "clean": "rm -rf node_modules frontend/node_modules"
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
EOF
fi

echo ""
echo "✅ SEGUNDO PLAN DE LIMPIEZA COMPLETADO!"
echo ""
echo "📊 Resumen de cambios:"
echo "   🔄 Código fuente movido a frontend/src/"
echo "   🧪 Archivos de prueba organizados en tests/"
echo "   ⚙️ Configuraciones consolidadas"
echo "   📚 Documentación categorizada en docs/"
echo "   📊 Archivos de datos organizados en data/"
echo "   🖼️ Assets organizados en assets/"
echo "   🗑️ Archivos temporales eliminados"
echo ""
echo "📋 Verificar con: ./validar_segundo_plan.sh"

