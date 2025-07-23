#!/bin/bash
# validar_consolidacion.sh

echo "🔍 Validando consolidación de carpetas..."
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

# Verificar que las carpetas fueron eliminadas
echo "🗂️ Verificando eliminación de carpetas:"
[ ! -d "server" ] && show_result 0 "Carpeta server eliminada" || show_result 1 "Carpeta server aún existe"
[ ! -d "services" ] && show_result 0 "Carpeta services eliminada" || show_result 1 "Carpeta services aún existe"
[ ! -d "utils" ] && show_result 0 "Carpeta utils eliminada" || show_result 1 "Carpeta utils aún existe"
echo ""

# Verificar que los servicios TypeScript fueron movidos
echo "🔄 Verificando servicios TypeScript en frontend:"
[ -f "frontend/src/services/ebookConversionService.ts" ] && show_result 0 "ebookConversionService.ts movido" || show_result 1 "ebookConversionService.ts no encontrado"
[ -f "frontend/src/services/ebookValidationService.ts" ] && show_result 0 "ebookValidationService.ts movido" || show_result 1 "ebookValidationService.ts no encontrado"
[ -f "frontend/src/services/geminiService.ts" ] && show_result 0 "geminiService.ts movido" || show_result 1 "geminiService.ts no encontrado"
echo ""

# Verificar que los archivos de datos fueron movidos
echo "📊 Verificando archivos de datos:"
[ -d "data/conversions" ] && show_result 0 "Directorio data/conversions creado" || show_result 1 "Directorio data/conversions no existe"
[ -d "data/formats" ] && show_result 0 "Directorio data/formats creado" || show_result 1 "Directorio data/formats no existe"

csv_count=$(find data/ -name "*.csv" 2>/dev/null | wc -l)
if [ $csv_count -gt 0 ]; then
    show_result 0 "Archivos CSV movidos a data/ ($csv_count archivos)"
else
    show_result 1 "No se encontraron archivos CSV en data/"
fi
echo ""

# Verificar que no hay duplicados
echo "🔍 Verificando eliminación de duplicados:"
[ ! -f "server/main.py" ] && show_result 0 "server/main.py eliminado" || show_result 1 "server/main.py aún existe"
[ ! -f "services/conversion.py" ] && show_result 0 "services/conversion.py eliminado" || show_result 1 "services/conversion.py aún existe"
echo ""

# Verificar integridad del backend
echo "🔧 Verificando integridad del backend:"
[ -f "backend/src/main.py" ] && show_result 0 "backend/src/main.py existe" || show_result 1 "backend/src/main.py no encontrado"
[ -f "backend/src/routes/conversion.py" ] && show_result 0 "backend/src/routes/conversion.py existe" || show_result 1 "backend/src/routes/conversion.py no encontrado"
[ -f "backend/src/routes/credits.py" ] && show_result 0 "backend/src/routes/credits.py existe" || show_result 1 "backend/src/routes/credits.py no encontrado"
echo ""

# Calcular puntuación
total_checks=10
passed_checks=0

[ ! -d "server" ] && ((passed_checks++))
[ ! -d "services" ] && ((passed_checks++))
[ ! -d "utils" ] && ((passed_checks++))
[ -f "frontend/src/services/ebookConversionService.ts" ] && ((passed_checks++))
[ -f "frontend/src/services/ebookValidationService.ts" ] && ((passed_checks++))
[ -f "frontend/src/services/geminiService.ts" ] && ((passed_checks++))
[ -d "data/conversions" ] && ((passed_checks++))
[ -d "data/formats" ] && ((passed_checks++))
[ -f "backend/src/main.py" ] && ((passed_checks++))
[ -f "backend/src/routes/conversion.py" ] && ((passed_checks++))

score=$((passed_checks * 100 / total_checks))

echo "📊 PUNTUACIÓN FINAL: $passed_checks/$total_checks ($score%)"

if [ $score -ge 90 ]; then
    echo "🎉 ¡EXCELENTE! Consolidación completamente exitosa"
elif [ $score -ge 75 ]; then
    echo "👍 MUY BUENO! Pequeños ajustes pendientes"
elif [ $score -ge 60 ]; then
    echo "⚠️ ACEPTABLE! Revisar problemas identificados"
else
    echo "❌ PROBLEMAS! Revisar y ejecutar nuevamente"
fi

echo ""
echo "📋 Próximos pasos recomendados:"
echo "   1. Verificar que la aplicación funciona: cd frontend && npm run dev"
echo "   2. Verificar que el backend funciona: cd backend && python src/main.py"
echo "   3. Ejecutar pruebas: npm test"
echo "   4. Hacer commit de los cambios: git add . && git commit -m 'Consolidar carpetas server, services y utils'"

echo ""
echo "✅ Validación de consolidación completada!"

