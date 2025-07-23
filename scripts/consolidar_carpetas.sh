#!/bin/bash
# consolidar_carpetas.sh

echo "🔄 Iniciando consolidación de carpetas server, services y utils..."
echo "📍 Directorio: $(pwd)"

# Verificar que estamos en el directorio correcto
if [ ! -f "README.md" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Ejecutar desde la raíz del repositorio AncloraMetaform"
    exit 1
fi

# Crear backup
echo "💾 Creando backup..."
git branch backup-consolidacion-$(date +%Y%m%d-%H%M%S) 2>/dev/null || echo "⚠️ No se pudo crear rama de backup"
tar -czf backup-carpetas-$(date +%Y%m%d-%H%M%S).tar.gz server/ services/ utils/ 2>/dev/null

# FASE 1: Verificar duplicados exactos
echo "🔍 Verificando duplicados exactos..."

echo "📊 Comparando server/main.py con backend/src/main.py:"
if diff -q server/main.py backend/src/main.py >/dev/null 2>&1; then
    echo "✅ Archivos idénticos - server/main.py será eliminado"
    REMOVE_SERVER_MAIN=true
else
    echo "⚠️ Archivos diferentes - revisar manualmente"
    REMOVE_SERVER_MAIN=false
fi

echo "📊 Comparando services/conversion.py con backend/src/routes/conversion.py:"
if diff -q services/conversion.py backend/src/routes/conversion.py >/dev/null 2>&1; then
    echo "✅ Archivos idénticos - services/conversion.py será eliminado"
    REMOVE_SERVICES_CONVERSION=true
else
    echo "⚠️ Archivos diferentes - revisar manualmente"
    REMOVE_SERVICES_CONVERSION=false
fi

# FASE 2: Verificar archivos que pueden tener diferencias
echo "🔍 Verificando archivos con posibles diferencias..."

if [ -f "services/credits.py" ] && [ -f "backend/src/routes/credits.py" ]; then
    echo "📊 Comparando services/credits.py con backend/src/routes/credits.py:"
    if diff -q services/credits.py backend/src/routes/credits.py >/dev/null 2>&1; then
        echo "✅ Archivos idénticos"
        CREDITS_ACTION="remove_services"
    else
        echo "⚠️ Archivos diferentes - comparando fechas..."
        SERVICES_DATE=$(stat -c %Y services/credits.py 2>/dev/null)
        BACKEND_DATE=$(stat -c %Y backend/src/routes/credits.py 2>/dev/null)
        
        if [ "$SERVICES_DATE" -gt "$BACKEND_DATE" ]; then
            echo "📅 services/credits.py es más reciente - será copiado"
            CREDITS_ACTION="copy_from_services"
        else
            echo "📅 backend/src/routes/credits.py es más reciente - services será eliminado"
            CREDITS_ACTION="remove_services"
        fi
    fi
elif [ -f "services/credits.py" ]; then
    echo "📊 services/credits.py existe pero no backend/src/routes/credits.py - será movido"
    CREDITS_ACTION="move_from_services"
else
    echo "📊 No se encontró services/credits.py"
    CREDITS_ACTION="none"
fi

# FASE 3: Crear directorios necesarios
echo "📁 Creando directorios necesarios..."
mkdir -p frontend/src/services
mkdir -p data/{conversions,formats}

# FASE 4: Ejecutar consolidación
echo "🔄 Ejecutando consolidación..."

# Eliminar duplicados exactos
if [ "$REMOVE_SERVER_MAIN" = true ]; then
    echo "🗑️ Eliminando server/main.py (duplicado exacto)"
    rm -f server/main.py
fi

if [ "$REMOVE_SERVICES_CONVERSION" = true ]; then
    echo "🗑️ Eliminando services/conversion.py (duplicado exacto)"
    rm -f services/conversion.py
fi

# Manejar credits.py según el análisis
case $CREDITS_ACTION in
    "copy_from_services")
        echo "📋 Copiando services/credits.py a backend/src/routes/"
        cp services/credits.py backend/src/routes/credits.py
        rm -f services/credits.py
        ;;
    "move_from_services")
        echo "📋 Moviendo services/credits.py a backend/src/routes/"
        mv services/credits.py backend/src/routes/credits.py
        ;;
    "remove_services")
        echo "🗑️ Eliminando services/credits.py (backend es más actual)"
        rm -f services/credits.py
        ;;
esac

# Mover servicios TypeScript al frontend
echo "🔄 Moviendo servicios TypeScript al frontend..."
for service in ebookConversionService.ts ebookValidationService.ts geminiService.ts; do
    if [ -f "services/$service" ]; then
        echo "📋 Moviendo services/$service a frontend/src/services/"
        mv "services/$service" "frontend/src/services/"
    fi
done

# Mover archivos de datos
echo "📊 Reorganizando archivos de datos..."
for csv_file in utils/*.csv; do
    if [ -f "$csv_file" ]; then
        filename=$(basename "$csv_file")
        case $filename in
            *conversion*|*secuencial*)
                echo "📋 Moviendo $filename a data/conversions/"
                mv "$csv_file" "data/conversions/"
                ;;
            *format*)
                echo "📋 Moviendo $filename a data/formats/"
                mv "$csv_file" "data/formats/"
                ;;
            *)
                echo "📋 Moviendo $filename a data/conversions/ (por defecto)"
                mv "$csv_file" "data/conversions/"
                ;;
        esac
    fi
done

# Eliminar archivos de caché
echo "🧹 Eliminando archivos de caché..."
rm -rf utils/__pycache__
rm -rf server/__pycache__ 2>/dev/null

# Eliminar bases de datos duplicadas
if [ -f "server/database/app.db" ]; then
    echo "🗑️ Eliminando server/database/app.db (duplicado)"
    rm -f server/database/app.db
fi

# Eliminar archivos obsoletos
if [ -f "server/index.mjs" ]; then
    echo "🗑️ Eliminando server/index.mjs (obsoleto)"
    rm -f server/index.mjs
fi

# FASE 5: Eliminar carpetas vacías
echo "🗂️ Eliminando carpetas vacías..."

# Verificar si las carpetas están vacías antes de eliminar
if [ -d "server/database" ] && [ -z "$(ls -A server/database)" ]; then
    rmdir server/database
    echo "🗑️ Eliminada carpeta vacía: server/database"
fi

if [ -d "server" ] && [ -z "$(ls -A server)" ]; then
    rmdir server
    echo "🗑️ Eliminada carpeta vacía: server"
fi

if [ -d "services" ] && [ -z "$(ls -A services)" ]; then
    rmdir services
    echo "🗑️ Eliminada carpeta vacía: services"
fi

if [ -d "utils" ] && [ -z "$(ls -A utils)" ]; then
    rmdir utils
    echo "🗑️ Eliminada carpeta vacía: utils"
fi

echo ""
echo "✅ CONSOLIDACIÓN COMPLETADA!"
echo ""
echo "📊 Resumen de cambios:"
echo "   🗑️ Eliminados duplicados exactos"
echo "   📋 Consolidados archivos con diferencias"
echo "   🔄 Servicios TypeScript movidos a frontend/src/services/"
echo "   📊 Archivos CSV organizados en data/"
echo "   🗂️ Carpetas vacías eliminadas"
echo ""
echo "📋 Verificar con: ./validar_consolidacion.sh"
echo "🔍 Revisar cambios con: git status"

