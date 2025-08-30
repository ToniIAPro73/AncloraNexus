﻿#!/bin/bash
# cleanup_repository.sh - Script de limpieza automatizada para AncloraNexus

set -e  # Salir si hay errores

echo "ðŸ§¹ Iniciando limpieza del repositorio AncloraNexus..."
echo "ðŸ“ Directorio actual: $(pwd)"

# Verificar que estamos en el directorio correcto
if [ ! -f "README.md" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "âŒ Error: No parece ser el directorio raÃ­z de AncloraNexus"
    echo "   AsegÃºrate de ejecutar este script desde la raÃ­z del repositorio"
    exit 1
fi

# Crear backup
echo "ðŸ’¾ Creando backup..."
git branch backup-pre-cleanup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || echo "âš ï¸ No se pudo crear rama de backup (Â¿no es un repo git?)"

# Crear estructura de directorios
echo "ðŸ“ Creando estructura de directorios..."
mkdir -p docs/{user-guide,api-reference,development,deployment,design,specifications,market-analysis}
mkdir -p docs/development/conversations
mkdir -p tests/{integration,e2e,fixtures,utils}
mkdir -p scripts/{windows,linux,utils}
mkdir -p tools/{linting,formatting,build}
mkdir -p .github/{workflows,ISSUE_TEMPLATE,PULL_REQUEST_TEMPLATE}

# Mover archivos de documentaciÃ³n
echo "ðŸ“š Reorganizando documentaciÃ³n..."
[ -f "Guiabuenaspracticaselaboracionmanualusuario.docx" ] && mv "Guiabuenaspracticaselaboracionmanualusuario.docx" docs/user-guide/
[ -f "guia_buenas_practicas.txt" ] && mv "guia_buenas_practicas.txt" docs/development/
[ -f "guia_de_estilos_anclora.md" ] && mv "guia_de_estilos_anclora.md" docs/design/
[ -f "conversacion_agente_programacion_gemini.docx" ] && mv "conversacion_agente_programacion_gemini.docx" docs/development/conversations/
[ -f "conversacion_agente_programacion_gemini.txt" ] && mv "conversacion_agente_programacion_gemini.txt" docs/development/conversations/

# Mover archivos de matriz y especificaciones
for file in "Matriz Completa"*.*; do
    [ -f "$file" ] && mv "$file" docs/specifications/
done

# Mover archivos de anÃ¡lisis de mercado
for file in "NecesidadesNoCubiertasenPlataformasdeConvers"*.pdf; do
    [ -f "$file" ] && mv "$file" docs/market-analysis/
done

# Mover scripts de Windows
echo "ðŸ”§ Reorganizando scripts..."
for file in *.bat; do
    [ -f "$file" ] && mv "$file" scripts/windows/
done

# Mover archivos de prueba
echo "ðŸ§ª Reorganizando archivos de prueba..."
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
echo "ðŸ—‘ï¸ Eliminando archivos temporales..."
rm -f test.txt test_document.txt
rm -f *.tmp *.temp
rm -f pasted_content.txt
rm -f sandbox.txt

# Eliminar configuraciones duplicadas de vitest
[ -f "vitest-config.ts" ] && rm -f "vitest-config.ts"  # Mantener solo vitest.config.ts

# Consolidar archivos duplicados
echo "ðŸ”„ Consolidando archivos duplicados..."
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
echo "ðŸ“Š Organizando archivos de datos..."
mkdir -p docs/data
for file in *.csv; do
    [ -f "$file" ] && mv "$file" docs/data/
done

# Mover archivos de metadatos
[ -f "metadata.json" ] && mv "metadata.json" docs/data/
[ -f "stripe_backup_code.txt" ] && mv "stripe_backup_code.txt" docs/development/

# Preguntar sobre archivos comprimidos
echo ""
echo "ðŸ“¦ Archivos comprimidos encontrados:"
ls -la *.tar 2>/dev/null || echo "   No se encontraron archivos .tar"

if ls *.tar 1> /dev/null 2>&1; then
    echo ""
    read -p "Â¿Has extraÃ­do el contenido de los archivos .tar y ya no los necesitas? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "ðŸ—‘ï¸ Eliminando archivos comprimidos..."
        rm -f *.tar
        find screenshots -name "*.tar" -delete 2>/dev/null || true
    else
        echo "ðŸ“¦ Moviendo archivos comprimidos a docs/archives/"
        mkdir -p docs/archives
        mv *.tar docs/archives/ 2>/dev/null || true
    fi
fi

# Crear archivo .gitignore mejorado si no existe o estÃ¡ incompleto
echo "âš™ï¸ Actualizando .gitignore..."
if [ ! -f ".gitignore" ] || ! grep -q "node_modules" .gitignore; then
    cat > .gitignore << 'EOF'
# Dependencias
node_modules/
__pycache__/
*.pyc
backend_env_stable/
.venv/
venv/

# Archivos de construcciÃ³n
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

# Archivos especÃ­ficos del proyecto
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
echo "âœ… Limpieza completada!"
echo ""
echo "ðŸ“Š Resumen de cambios:"
echo "   ðŸ“ Estructura de directorios creada"
echo "   ðŸ“š DocumentaciÃ³n reorganizada en /docs/"
echo "   ðŸ§ª Archivos de prueba movidos a /tests/"
echo "   ðŸ”§ Scripts organizados en /scripts/"
echo "   ðŸ—‘ï¸ Archivos temporales eliminados"
echo "   âš™ï¸ .gitignore actualizado"
echo ""
echo "ðŸ“‹ PrÃ³ximos pasos recomendados:"
echo "   1. Revisar los archivos movidos"
echo "   2. Ejecutar: ./validate_cleanup.sh"
echo "   3. Crear commit con los cambios"
echo "   4. Actualizar documentaciÃ³n si es necesario"
echo ""
echo "ðŸŽ‰ Â¡Repositorio limpio y organizado!"


