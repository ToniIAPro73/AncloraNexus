#!/bin/bash
# validate_cleanup.sh - Script de validaciÃ³n post-limpieza

echo "ðŸ” Validando limpieza del repositorio AncloraNexus..."
echo "ðŸ“ Directorio actual: $(pwd)"
echo ""

# FunciÃ³n para mostrar resultado con emoji
show_result() {
    if [ $1 -eq 0 ]; then
        echo "âœ… $2"
    else
        echo "âŒ $2"
    fi
}

# Contar archivos en raÃ­z (excluyendo directorios y archivos ocultos)
root_files=$(find . -maxdepth 1 -type f ! -name ".*" | wc -l)
echo "ðŸ“Š AnÃ¡lisis de archivos en raÃ­z:"
echo "   Archivos encontrados: $root_files"
if [ $root_files -le 15 ]; then
    echo "   âœ… Objetivo cumplido (â‰¤15 archivos)"
else
    echo "   âš ï¸ Objetivo no cumplido (>15 archivos)"
    echo "   ðŸ“‹ Archivos en raÃ­z:"
    find . -maxdepth 1 -type f ! -name ".*" | head -10
fi
echo ""

# Verificar estructura de directorios requerida
echo "ðŸ“ Verificando estructura de directorios:"
required_dirs=("docs" "tests" "scripts" "tools" ".github" "frontend" "backend")
missing_dirs=0

for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        show_result 0 "$dir/ existe"
    else
        show_result 1 "$dir/ falta"
        ((missing_dirs++))
    fi
done
echo ""

# Verificar subdirectorios importantes
echo "ðŸ“‚ Verificando subdirectorios importantes:"
important_subdirs=(
    "docs/user-guide"
    "docs/development" 
    "docs/api-reference"
    "tests/integration"
    "scripts/windows"
    ".github/workflows"
)

for subdir in "${important_subdirs[@]}"; do
    if [ -d "$subdir" ]; then
        show_result 0 "$subdir/ existe"
    else
        show_result 1 "$subdir/ falta"
    fi
done
echo ""

# Verificar archivos de configuraciÃ³n crÃ­ticos
echo "âš™ï¸ Verificando archivos de configuraciÃ³n:"
config_files=(".gitignore" "README.md" "LICENSE")
missing_configs=0

for file in "${config_files[@]}"; do
    if [ -f "$file" ]; then
        show_result 0 "$file existe"
    else
        show_result 1 "$file falta"
        ((missing_configs++))
    fi
done
echo ""

# Verificar que archivos fueron movidos correctamente
echo "ðŸ“š Verificando migraciÃ³n de documentaciÃ³n:"
doc_files_moved=0
if [ -f "docs/design/guia_de_estilos_anclora.md" ]; then
    show_result 0 "GuÃ­a de estilos movida"
    ((doc_files_moved++))
fi

if [ -d "docs/development/conversations" ] && [ "$(ls -A docs/development/conversations 2>/dev/null)" ]; then
    show_result 0 "Conversaciones de desarrollo movidas"
    ((doc_files_moved++))
fi

if [ -d "docs/specifications" ] && [ "$(ls -A docs/specifications 2>/dev/null)" ]; then
    show_result 0 "Especificaciones movidas"
    ((doc_files_moved++))
fi
echo ""

# Buscar archivos temporales restantes
echo "ðŸ” Buscando archivos temporales restantes:"
temp_patterns=("*.tmp" "*.temp" "*test*.html" "test.txt" "test_document.txt")
temp_found=0

for pattern in "${temp_patterns[@]}"; do
    if ls $pattern 1> /dev/null 2>&1; then
        echo "âš ï¸ Archivos temporales encontrados: $pattern"
        ls $pattern | head -3
        ((temp_found++))
    fi
done

if [ $temp_found -eq 0 ]; then
    show_result 0 "No se encontraron archivos temporales"
fi
echo ""

# Verificar archivos duplicados
echo "ðŸ”„ Verificando eliminaciÃ³n de duplicados:"
if [ ! -f "Tareaarealizar.md" ] && [ ! -f "Tareasarealizar.md" ]; then
    show_result 0 "Archivos de tareas duplicados eliminados"
else
    show_result 1 "Archivos de tareas duplicados aÃºn presentes"
fi

if [ ! -f "vitest-config.ts" ] && [ -f "vitest.config.ts" ]; then
    show_result 0 "ConfiguraciÃ³n de vitest consolidada"
else
    show_result 1 "ConfiguraciÃ³n de vitest duplicada"
fi
echo ""

# Verificar .gitignore
echo "ðŸ“ Verificando .gitignore:"
if [ -f ".gitignore" ]; then
    if grep -q "node_modules" .gitignore && grep -q "__pycache__" .gitignore; then
        show_result 0 ".gitignore contiene reglas bÃ¡sicas"
    else
        show_result 1 ".gitignore incompleto"
    fi
else
    show_result 1 ".gitignore no existe"
fi
echo ""

# Calcular puntuaciÃ³n general
echo "ðŸ“Š Resumen de validaciÃ³n:"
total_checks=10
passed_checks=0

[ $root_files -le 15 ] && ((passed_checks++))
[ $missing_dirs -eq 0 ] && ((passed_checks++))
[ $missing_configs -eq 0 ] && ((passed_checks++))
[ $doc_files_moved -ge 2 ] && ((passed_checks++))
[ $temp_found -eq 0 ] && ((passed_checks++))
[ ! -f "Tareaarealizar.md" ] && [ ! -f "Tareasarealizar.md" ] && ((passed_checks++))
[ ! -f "vitest-config.ts" ] && [ -f "vitest.config.ts" ] && ((passed_checks++))
[ -f ".gitignore" ] && ((passed_checks++))
[ -d "docs" ] && ((passed_checks++))
[ -d "tests" ] && ((passed_checks++))

score=$((passed_checks * 100 / total_checks))

echo "   PuntuaciÃ³n: $passed_checks/$total_checks ($score%)"

if [ $score -ge 80 ]; then
    echo "   ðŸŽ‰ Â¡Excelente! Limpieza exitosa"
elif [ $score -ge 60 ]; then
    echo "   ðŸ‘ Buena limpieza, algunas mejoras pendientes"
else
    echo "   âš ï¸ Limpieza incompleta, revisar problemas"
fi

echo ""
echo "ðŸ“‹ Recomendaciones finales:"

if [ $root_files -gt 15 ]; then
    echo "   â€¢ Mover mÃ¡s archivos de la raÃ­z a subdirectorios apropiados"
fi

if [ $missing_dirs -gt 0 ]; then
    echo "   â€¢ Crear directorios faltantes para completar la estructura"
fi

if [ $temp_found -gt 0 ]; then
    echo "   â€¢ Eliminar archivos temporales restantes"
fi

if [ ! -f "CONTRIBUTING.md" ]; then
    echo "   â€¢ Crear archivo CONTRIBUTING.md"
fi

if [ ! -f "CHANGELOG.md" ]; then
    echo "   â€¢ Crear archivo CHANGELOG.md"
fi

echo ""
echo "ðŸŽ¯ PrÃ³ximos pasos sugeridos:"
echo "   1. Corregir problemas identificados"
echo "   2. Crear archivos de configuraciÃ³n faltantes"
echo "   3. Actualizar documentaciÃ³n"
echo "   4. Hacer commit de los cambios"
echo "   5. Configurar CI/CD si es necesario"

echo ""
echo "âœ… ValidaciÃ³n completada!"


