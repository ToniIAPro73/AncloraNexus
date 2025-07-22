#!/bin/bash
# validate_cleanup.sh - Script de validación post-limpieza

echo "🔍 Validando limpieza del repositorio AncloraMetaform..."
echo "📍 Directorio actual: $(pwd)"
echo ""

# Función para mostrar resultado con emoji
show_result() {
    if [ $1 -eq 0 ]; then
        echo "✅ $2"
    else
        echo "❌ $2"
    fi
}

# Contar archivos en raíz (excluyendo directorios y archivos ocultos)
root_files=$(find . -maxdepth 1 -type f ! -name ".*" | wc -l)
echo "📊 Análisis de archivos en raíz:"
echo "   Archivos encontrados: $root_files"
if [ $root_files -le 15 ]; then
    echo "   ✅ Objetivo cumplido (≤15 archivos)"
else
    echo "   ⚠️ Objetivo no cumplido (>15 archivos)"
    echo "   📋 Archivos en raíz:"
    find . -maxdepth 1 -type f ! -name ".*" | head -10
fi
echo ""

# Verificar estructura de directorios requerida
echo "📁 Verificando estructura de directorios:"
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
echo "📂 Verificando subdirectorios importantes:"
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

# Verificar archivos de configuración críticos
echo "⚙️ Verificando archivos de configuración:"
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
echo "📚 Verificando migración de documentación:"
doc_files_moved=0
if [ -f "docs/design/guia_de_estilos_anclora.md" ]; then
    show_result 0 "Guía de estilos movida"
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
echo "🔍 Buscando archivos temporales restantes:"
temp_patterns=("*.tmp" "*.temp" "*test*.html" "test.txt" "test_document.txt")
temp_found=0

for pattern in "${temp_patterns[@]}"; do
    if ls $pattern 1> /dev/null 2>&1; then
        echo "⚠️ Archivos temporales encontrados: $pattern"
        ls $pattern | head -3
        ((temp_found++))
    fi
done

if [ $temp_found -eq 0 ]; then
    show_result 0 "No se encontraron archivos temporales"
fi
echo ""

# Verificar archivos duplicados
echo "🔄 Verificando eliminación de duplicados:"
if [ ! -f "Tareaarealizar.md" ] && [ ! -f "Tareasarealizar.md" ]; then
    show_result 0 "Archivos de tareas duplicados eliminados"
else
    show_result 1 "Archivos de tareas duplicados aún presentes"
fi

if [ ! -f "vitest-config.ts" ] && [ -f "vitest.config.ts" ]; then
    show_result 0 "Configuración de vitest consolidada"
else
    show_result 1 "Configuración de vitest duplicada"
fi
echo ""

# Verificar .gitignore
echo "📝 Verificando .gitignore:"
if [ -f ".gitignore" ]; then
    if grep -q "node_modules" .gitignore && grep -q "__pycache__" .gitignore; then
        show_result 0 ".gitignore contiene reglas básicas"
    else
        show_result 1 ".gitignore incompleto"
    fi
else
    show_result 1 ".gitignore no existe"
fi
echo ""

# Calcular puntuación general
echo "📊 Resumen de validación:"
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

echo "   Puntuación: $passed_checks/$total_checks ($score%)"

if [ $score -ge 80 ]; then
    echo "   🎉 ¡Excelente! Limpieza exitosa"
elif [ $score -ge 60 ]; then
    echo "   👍 Buena limpieza, algunas mejoras pendientes"
else
    echo "   ⚠️ Limpieza incompleta, revisar problemas"
fi

echo ""
echo "📋 Recomendaciones finales:"

if [ $root_files -gt 15 ]; then
    echo "   • Mover más archivos de la raíz a subdirectorios apropiados"
fi

if [ $missing_dirs -gt 0 ]; then
    echo "   • Crear directorios faltantes para completar la estructura"
fi

if [ $temp_found -gt 0 ]; then
    echo "   • Eliminar archivos temporales restantes"
fi

if [ ! -f "CONTRIBUTING.md" ]; then
    echo "   • Crear archivo CONTRIBUTING.md"
fi

if [ ! -f "CHANGELOG.md" ]; then
    echo "   • Crear archivo CHANGELOG.md"
fi

echo ""
echo "🎯 Próximos pasos sugeridos:"
echo "   1. Corregir problemas identificados"
echo "   2. Crear archivos de configuración faltantes"
echo "   3. Actualizar documentación"
echo "   4. Hacer commit de los cambios"
echo "   5. Configurar CI/CD si es necesario"

echo ""
echo "✅ Validación completada!"

