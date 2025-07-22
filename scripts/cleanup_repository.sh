#!/bin/bash
# cleanup_repository.sh - Script de limpieza automatizada para AncloraMetaform

set -e  # Salir si hay errores

echo "🧹 Iniciando limpieza del repositorio AncloraMetaform..."
echo "📍 Directorio actual: $(pwd)"

# Verificar que estamos en el directorio correcto
if [ ! -f "README.md" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: No parece ser el directorio raíz de AncloraMetaform"
    echo "   Asegúrate de ejecutar este script desde la raíz del repositorio"
    exit 1
fi

# Crear backup
echo "💾 Creando backup..."
git branch backup-pre-cleanup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || echo "⚠️ No se pudo crear rama de backup (¿no es un repo git?)"

# Crear estructura de directorios
echo "📁 Creando estructura de directorios..."
mkdir -p docs/{user-guide,api-reference,development,deployment,design,specifications,market-analysis}
mkdir -p docs/development/conversations
mkdir -p tests/{integration,e2e,fixtures,utils}
mkdir -p scripts/{windows,linux,utils}
mkdir -p tools/{linting,formatting,build}
mkdir -p .github/{workflows,ISSUE_TEMPLATE,PULL_REQUEST_TEMPLATE}

# Mover archivos de documentación
echo "📚 Reorganizando documentación..."
[ -f "Guiabuenaspracticaselaboracionmanualusuario.docx" ] && mv "Guiabuenaspracticaselaboracionmanualusuario.docx" docs/user-guide/
[ -f "guia_buenas_practicas.txt" ] && mv "guia_buenas_practicas.txt" docs/development/
[ -f "guia_de_estilos_anclora.md" ] && mv "guia_de_estilos_anclora.md" docs/design/
[ -f "conversacion_agente_programacion_gemini.docx" ] && mv "conversacion_agente_programacion_gemini.docx" docs/development/conversations/
[ -f "conversacion_agente_programacion_gemini.txt" ] && mv "conversacion_agente_programacion_gemini.txt" docs/development/conversations/

# Mover archivos de matriz y especificaciones
for file in "Matriz Completa"*.*; do
    [ -f "$file" ] && mv "$file" docs/specifications/
done

# Mover archivos de análisis de mercado
for file in "NecesidadesNoCubiertasenPlataformasdeConvers"*.pdf; do
    [ -f "$file" ] && mv "$file" docs/market-analysis/
done

# Mover scripts de Windows
echo "🔧 Reorganizando scripts..."
for file in *.bat; do
    [ -f "$file" ] && mv "$file" scripts/windows/
done

# Mover archivos de prueba
echo "🧪 Reorganizando archivos de prueba..."
for file in *-test.ts *-tests.ts; do
    [ -f "$file" ] && mv "$file" tests/integration/
done

for file in test_*.html; do
    [ -f "$file" ] && mv "$file" tests/fixtures/
done

for file in integration_*.html; do
    [ -f "$file" ] && mv "$file" tests/integration/
done

# Mover archivos de desarrollo
[ -f "test-helpers.ts" ] && mv "test-helpers.ts" tests/utils/
[ -f "prompt_convertido.html" ] && mv "prompt_convertido.html" docs/development/
[ -f "Promptmejoraretratoenflux-prokontext.html" ] && mv "Promptmejoraretratoenflux-prokontext.html" docs/development/
[ -f "Promptmejoraretratoenflux-prokontext.txt" ] && mv "Promptmejoraretratoenflux-prokontext.txt" docs/development/

# Eliminar archivos temporales
echo "🗑️ Eliminando archivos temporales..."
rm -f test.txt test_document.txt
rm -f *.tmp *.temp
rm -f pasted_content.txt
rm -f sandbox.txt

# Eliminar configuraciones duplicadas de vitest
[ -f "vitest-config.ts" ] && rm -f "vitest-config.ts"  # Mantener solo vitest.config.ts

# Consolidar archivos duplicados
echo "🔄 Consolidando archivos duplicados..."
if [ -f "Tareaarealizar.md" ] && [ -f "Tareasarealizar.md" ]; then
    echo "# Tareas a Realizar" > docs/development/tasks.md
    echo "" >> docs/development/tasks.md
    echo "## Archivo 1:" >> docs/development/tasks.md
    cat "Tareaarealizar.md" >> docs/development/tasks.md
    echo "" >> docs/development/tasks.md
    echo "## Archivo 2:" >> docs/development/tasks.md
    cat "Tareasarealizar.md" >> docs/development/tasks.md
    rm -f "Tareaarealizar.md" "Tareasarealizar.md"
fi

# Mover archivos CSV de datos
echo "📊 Organizando archivos de datos..."
mkdir -p docs/data
for file in *.csv; do
    [ -f "$file" ] && mv "$file" docs/data/
done

# Mover archivos de metadatos
[ -f "metadata.json" ] && mv "metadata.json" docs/data/
[ -f "stripe_backup_code.txt" ] && mv "stripe_backup_code.txt" docs/development/

# Preguntar sobre archivos comprimidos
echo ""
echo "📦 Archivos comprimidos encontrados:"
ls -la *.tar 2>/dev/null || echo "   No se encontraron archivos .tar"

if ls *.tar 1> /dev/null 2>&1; then
    echo ""
    read -p "¿Has extraído el contenido de los archivos .tar y ya no los necesitas? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️ Eliminando archivos comprimidos..."
        rm -f *.tar
        find screenshots -name "*.tar" -delete 2>/dev/null || true
    else
        echo "📦 Moviendo archivos comprimidos a docs/archives/"
        mkdir -p docs/archives
        mv *.tar docs/archives/ 2>/dev/null || true
    fi
fi

# Crear archivo .gitignore mejorado si no existe o está incompleto
echo "⚙️ Actualizando .gitignore..."
if [ ! -f ".gitignore" ] || ! grep -q "node_modules" .gitignore; then
    cat > .gitignore << 'EOF'
# Dependencias
node_modules/
__pycache__/
*.pyc
backend_env_stable/
.venv/
venv/

# Archivos de construcción
dist/
build/
.next/
.nuxt/
out/

# Archivos de entorno
.env
.env.local
.env.production
.env.development

# Archivos temporales
*.tmp
*.temp
*.log
*.cache
.DS_Store
Thumbs.db
*.swp
*.swo

# Archivos de prueba
coverage/
.nyc_output/
test-results/
.vitest/

# Archivos del editor
.vscode/
.idea/
*.sublime-*

# Archivos específicos del proyecto
screenshots/
uploads/
temp/
backup/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
EOF
fi

# Mostrar resumen
echo ""
echo "✅ Limpieza completada!"
echo ""
echo "📊 Resumen de cambios:"
echo "   📁 Estructura de directorios creada"
echo "   📚 Documentación reorganizada en /docs/"
echo "   🧪 Archivos de prueba movidos a /tests/"
echo "   🔧 Scripts organizados en /scripts/"
echo "   🗑️ Archivos temporales eliminados"
echo "   ⚙️ .gitignore actualizado"
echo ""
echo "📋 Próximos pasos recomendados:"
echo "   1. Revisar los archivos movidos"
echo "   2. Ejecutar: ./validate_cleanup.sh"
echo "   3. Crear commit con los cambios"
echo "   4. Actualizar documentación si es necesario"
echo ""
echo "🎉 ¡Repositorio limpio y organizado!"

