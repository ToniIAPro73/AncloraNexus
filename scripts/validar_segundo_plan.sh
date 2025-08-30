#!/bin/bash
# validar_segundo_plan.sh

echo "ðŸ” Validando SEGUNDO PLAN de limpieza..."
echo "ðŸ“ Directorio: $(pwd)"
echo ""

# FunciÃ³n para mostrar resultado
show_result() {
    if [ $1 -eq 0 ]; then
        echo "âœ… $2"
    else
        echo "âŒ $2"
    fi
}

# Contar archivos en raÃ­z
root_files=$(find . -maxdepth 1 -type f ! -name ".*" | wc -l)
echo "ðŸ“Š Archivos en raÃ­z: $root_files"
if [ $root_files -le 10 ]; then
    show_result 0 "Objetivo cumplido (â‰¤10 archivos en raÃ­z)"
else
    show_result 1 "Objetivo NO cumplido (>10 archivos en raÃ­z)"
    echo "   ðŸ“‹ Archivos restantes:"
    find . -maxdepth 1 -type f ! -name ".*" | head -10
fi
echo ""

# Verificar cÃ³digo fuente movido
echo "ðŸ”„ Verificando cÃ³digo fuente:"
[ -f "frontend/src/App.tsx" ] && show_result 0 "App.tsx movido correctamente" || show_result 1 "App.tsx no movido"
[ -f "frontend/src/index.tsx" ] && show_result 0 "index.tsx movido correctamente" || show_result 1 "index.tsx no movido"
[ -f "frontend/src/components/UniversalConverter.tsx" ] && show_result 0 "UniversalConverter.tsx movido correctamente" || show_result 1 "UniversalConverter.tsx no movido"
[ -f "frontend/public/index.html" ] && show_result 0 "index.html movido correctamente" || show_result 1 "index.html no movido"
echo ""

# Verificar archivos de prueba
echo "ðŸ§ª Verificando archivos de prueba:"
[ -f "tests/unit/archives.test.ts" ] && show_result 0 "archives.test.ts organizado" || show_result 1 "archives.test.ts no organizado"
[ -f "tests/unit/document.test.ts" ] && show_result 0 "document.test.ts organizado" || show_result 1 "document.test.ts no organizado"
[ -f "tests/utils/test-helpers.ts" ] && show_result 0 "test-helpers.ts organizado" || show_result 1 "test-helpers.ts no organizado"
[ -d "tests/fixtures" ] && show_result 0 "Directorio fixtures creado" || show_result 1 "Directorio fixtures no creado"
echo ""

# Verificar configuraciones
echo "âš™ï¸ Verificando configuraciones:"
[ -f "frontend/vite.config.ts" ] && show_result 0 "vite.config.ts movido a frontend" || show_result 1 "vite.config.ts no movido"
[ -f "tests/vitest.config.ts" ] && show_result 0 "vitest.config.ts movido a tests" || show_result 1 "vitest.config.ts no movido"
[ ! -f "vitest-config.ts" ] && show_result 0 "vitest-config.ts duplicado eliminado" || show_result 1 "vitest-config.ts duplicado aÃºn presente"
echo ""

# Verificar documentaciÃ³n organizada
echo "ðŸ“š Verificando documentaciÃ³n:"
[ -d "docs/market-analysis" ] && show_result 0 "docs/market-analysis creado" || show_result 1 "docs/market-analysis no creado"
[ -d "docs/technical" ] && show_result 0 "docs/technical creado" || show_result 1 "docs/technical no creado"
[ -d "docs/specifications" ] && show_result 0 "docs/specifications creado" || show_result 1 "docs/specifications no creado"
[ -d "docs/development" ] && show_result 0 "docs/development creado" || show_result 1 "docs/development no creado"
echo ""

# Verificar archivos de datos
echo "ðŸ“Š Verificando archivos de datos:"
[ -d "data" ] && show_result 0 "Directorio data creado" || show_result 1 "Directorio data no creado"
[ -f "data/metadata.json" ] && show_result 0 "metadata.json movido" || show_result 1 "metadata.json no movido"
echo ""

# Verificar assets
echo "ðŸ–¼ï¸ Verificando assets:"
[ -d "assets/logos" ] && show_result 0 "Directorio assets/logos creado" || show_result 1 "Directorio assets/logos no creado"
echo ""

# Calcular puntuaciÃ³n
total_checks=15
passed_checks=0

[ $root_files -le 10 ] && ((passed_checks++))
[ -f "frontend/src/App.tsx" ] && ((passed_checks++))
[ -f "frontend/src/index.tsx" ] && ((passed_checks++))
[ -f "frontend/src/components/UniversalConverter.tsx" ] && ((passed_checks++))
[ -f "tests/unit/archives.test.ts" ] && ((passed_checks++))
[ -f "tests/unit/document.test.ts" ] && ((passed_checks++))
[ -f "tests/utils/test-helpers.ts" ] && ((passed_checks++))
[ -f "frontend/vite.config.ts" ] && ((passed_checks++))
[ -f "tests/vitest.config.ts" ] && ((passed_checks++))
[ ! -f "vitest-config.ts" ] && ((passed_checks++))
[ -d "docs/market-analysis" ] && ((passed_checks++))
[ -d "docs/technical" ] && ((passed_checks++))
[ -d "docs/specifications" ] && ((passed_checks++))
[ -d "data" ] && ((passed_checks++))
[ -d "assets/logos" ] && ((passed_checks++))

score=$((passed_checks * 100 / total_checks))

echo "ðŸ“Š PUNTUACIÃ“N FINAL: $passed_checks/$total_checks ($score%)"

if [ $score -ge 90 ]; then
    echo "ðŸŽ‰ Â¡EXCELENTE! Repositorio completamente profesional"
elif [ $score -ge 75 ]; then
    echo "ðŸ‘ MUY BUENO! PequeÃ±os ajustes pendientes"
elif [ $score -ge 60 ]; then
    echo "âš ï¸ ACEPTABLE! Revisar problemas identificados"
else
    echo "âŒ INSUFICIENTE! Ejecutar nuevamente el script de limpieza"
fi

echo ""
echo "ðŸ“‹ Archivos que deberÃ­an quedar en raÃ­z (mÃ¡ximo 10):"
echo "   âœ… README.md"
echo "   âœ… LICENSE"
echo "   âœ… .gitignore"
echo "   âœ… .env.example"
echo "   âœ… CHANGELOG.md"
echo "   âœ… ESTRUCTURA_REPOSITORIO.md"
echo "   âœ… package.json"
echo "   âœ… docker-compose.yml (si existe)"
echo "   âœ… CONTRIBUTING.md (si existe)"
echo "   âœ… CODE_OF_CONDUCT.md (si existe)"

echo ""
echo "âœ… ValidaciÃ³n del segundo plan completada!"


