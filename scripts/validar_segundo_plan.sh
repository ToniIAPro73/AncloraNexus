#!/bin/bash
# validar_segundo_plan.sh

echo "🔍 Validando SEGUNDO PLAN de limpieza..."
echo "📍 Directorio: $(pwd)"
echo ""

# Función para mostrar resultado
show_result() {
    if [ $1 -eq 0 ]; then
        echo "✅ $2"
    else
        echo "❌ $2"
    fi
}

# Contar archivos en raíz
root_files=$(find . -maxdepth 1 -type f ! -name ".*" | wc -l)
echo "📊 Archivos en raíz: $root_files"
if [ $root_files -le 10 ]; then
    show_result 0 "Objetivo cumplido (≤10 archivos en raíz)"
else
    show_result 1 "Objetivo NO cumplido (>10 archivos en raíz)"
    echo "   📋 Archivos restantes:"
    find . -maxdepth 1 -type f ! -name ".*" | head -10
fi
echo ""

# Verificar código fuente movido
echo "🔄 Verificando código fuente:"
[ -f "frontend/src/App.tsx" ] && show_result 0 "App.tsx movido correctamente" || show_result 1 "App.tsx no movido"
[ -f "frontend/src/index.tsx" ] && show_result 0 "index.tsx movido correctamente" || show_result 1 "index.tsx no movido"
[ -f "frontend/src/components/UniversalConverter.tsx" ] && show_result 0 "UniversalConverter.tsx movido correctamente" || show_result 1 "UniversalConverter.tsx no movido"
[ -f "frontend/public/index.html" ] && show_result 0 "index.html movido correctamente" || show_result 1 "index.html no movido"
echo ""

# Verificar archivos de prueba
echo "🧪 Verificando archivos de prueba:"
[ -f "tests/unit/archives.test.ts" ] && show_result 0 "archives.test.ts organizado" || show_result 1 "archives.test.ts no organizado"
[ -f "tests/unit/document.test.ts" ] && show_result 0 "document.test.ts organizado" || show_result 1 "document.test.ts no organizado"
[ -f "tests/utils/test-helpers.ts" ] && show_result 0 "test-helpers.ts organizado" || show_result 1 "test-helpers.ts no organizado"
[ -d "tests/fixtures" ] && show_result 0 "Directorio fixtures creado" || show_result 1 "Directorio fixtures no creado"
echo ""

# Verificar configuraciones
echo "⚙️ Verificando configuraciones:"
[ -f "frontend/vite.config.ts" ] && show_result 0 "vite.config.ts movido a frontend" || show_result 1 "vite.config.ts no movido"
[ -f "tests/vitest.config.ts" ] && show_result 0 "vitest.config.ts movido a tests" || show_result 1 "vitest.config.ts no movido"
[ ! -f "vitest-config.ts" ] && show_result 0 "vitest-config.ts duplicado eliminado" || show_result 1 "vitest-config.ts duplicado aún presente"
echo ""

# Verificar documentación organizada
echo "📚 Verificando documentación:"
[ -d "docs/market-analysis" ] && show_result 0 "docs/market-analysis creado" || show_result 1 "docs/market-analysis no creado"
[ -d "docs/technical" ] && show_result 0 "docs/technical creado" || show_result 1 "docs/technical no creado"
[ -d "docs/specifications" ] && show_result 0 "docs/specifications creado" || show_result 1 "docs/specifications no creado"
[ -d "docs/development" ] && show_result 0 "docs/development creado" || show_result 1 "docs/development no creado"
echo ""

# Verificar archivos de datos
echo "📊 Verificando archivos de datos:"
[ -d "data" ] && show_result 0 "Directorio data creado" || show_result 1 "Directorio data no creado"
[ -f "data/metadata.json" ] && show_result 0 "metadata.json movido" || show_result 1 "metadata.json no movido"
echo ""

# Verificar assets
echo "🖼️ Verificando assets:"
[ -d "assets/logos" ] && show_result 0 "Directorio assets/logos creado" || show_result 1 "Directorio assets/logos no creado"
echo ""

# Calcular puntuación
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

echo "📊 PUNTUACIÓN FINAL: $passed_checks/$total_checks ($score%)"

if [ $score -ge 90 ]; then
    echo "🎉 ¡EXCELENTE! Repositorio completamente profesional"
elif [ $score -ge 75 ]; then
    echo "👍 MUY BUENO! Pequeños ajustes pendientes"
elif [ $score -ge 60 ]; then
    echo "⚠️ ACEPTABLE! Revisar problemas identificados"
else
    echo "❌ INSUFICIENTE! Ejecutar nuevamente el script de limpieza"
fi

echo ""
echo "📋 Archivos que deberían quedar en raíz (máximo 10):"
echo "   ✅ README.md"
echo "   ✅ LICENSE"
echo "   ✅ .gitignore"
echo "   ✅ .env.example"
echo "   ✅ CHANGELOG.md"
echo "   ✅ ESTRUCTURA_REPOSITORIO.md"
echo "   ✅ package.json"
echo "   ✅ docker-compose.yml (si existe)"
echo "   ✅ CONTRIBUTING.md (si existe)"
echo "   ✅ CODE_OF_CONDUCT.md (si existe)"

echo ""
echo "✅ Validación del segundo plan completada!"

