#!/bin/bash
# consolidar_carpetas.sh

echo "ðŸ”„ Iniciando consolidaciÃ³n de carpetas server, services y utils..."
echo "ðŸ“ Directorio: $(pwd)"

# Verificar que estamos en el directorio correcto
if [ ! -f "README.md" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "âŒ Error: Ejecutar desde la raÃ­z del repositorio AncloraNexus"
    exit 1
fi

# Crear backup
echo "ðŸ’¾ Creando backup..."
git branch backup-consolidacion-$(date +%Y%m%d-%H%M%S) 2>/dev/null || echo "âš ï¸ No se pudo crear rama de backup"
tar -czf backup-carpetas-$(date +%Y%m%d-%H%M%S).tar.gz server/ services/ utils/ 2>/dev/null

# FASE 1: Verificar duplicados exactos
echo "ðŸ” Verificando duplicados exactos..."

echo "ðŸ“Š Comparando server/main.py con backend/src/main.py:"
if diff -q server/main.py backend/src/main.py >/dev/null 2>&1; then
    echo "âœ… Archivos idÃ©nticos - server/main.py serÃ¡ eliminado"
    REMOVE_SERVER_MAIN=true
else
    echo "âš ï¸ Archivos diferentes - revisar manualmente"
    REMOVE_SERVER_MAIN=false
fi

echo "ðŸ“Š Comparando services/conversion.py con backend/src/routes/conversion.py:"
if diff -q services/conversion.py backend/src/routes/conversion.py >/dev/null 2>&1; then
    echo "âœ… Archivos idÃ©nticos - services/conversion.py serÃ¡ eliminado"
    REMOVE_SERVICES_CONVERSION=true
else
    echo "âš ï¸ Archivos diferentes - revisar manualmente"
    REMOVE_SERVICES_CONVERSION=false
fi

# FASE 2: Verificar archivos que pueden tener diferencias
echo "ðŸ” Verificando archivos con posibles diferencias..."

if [ -f "services/credits.py" ] && [ -f "backend/src/routes/credits.py" ]; then
    echo "ðŸ“Š Comparando services/credits.py con backend/src/routes/credits.py:"
    if diff -q services/credits.py backend/src/routes/credits.py >/dev/null 2>&1; then
        echo "âœ… Archivos idÃ©nticos"
        CREDITS_ACTION="remove_services"
    else
        echo "âš ï¸ Archivos diferentes - comparando fechas..."
        SERVICES_DATE=$(stat -c %Y services/credits.py 2>/dev/null)
        BACKEND_DATE=$(stat -c %Y backend/src/routes/credits.py 2>/dev/null)
        
        if [ "$SERVICES_DATE" -gt "$BACKEND_DATE" ]; then
            echo "ðŸ“… services/credits.py es mÃ¡s reciente - serÃ¡ copiado"
            CREDITS_ACTION="copy_from_services"
        else
            echo "ðŸ“… backend/src/routes/credits.py es mÃ¡s reciente - services serÃ¡ eliminado"
            CREDITS_ACTION="remove_services"
        fi
    fi
elif [ -f "services/credits.py" ]; then
    echo "ðŸ“Š services/credits.py existe pero no backend/src/routes/credits.py - serÃ¡ movido"
    CREDITS_ACTION="move_from_services"
else
    echo "ðŸ“Š No se encontrÃ³ services/credits.py"
    CREDITS_ACTION="none"
fi

# FASE 3: Crear directorios necesarios
echo "ðŸ“ Creando directorios necesarios..."
mkdir -p frontend/src/services
mkdir -p data/{conversions,formats}

# FASE 4: Ejecutar consolidaciÃ³n
echo "ðŸ”„ Ejecutando consolidaciÃ³n..."

# Eliminar duplicados exactos
if [ "$REMOVE_SERVER_MAIN" = true ]; then
    echo "ðŸ—‘ï¸ Eliminando server/main.py (duplicado exacto)"
    rm -f server/main.py
fi

if [ "$REMOVE_SERVICES_CONVERSION" = true ]; then
    echo "ðŸ—‘ï¸ Eliminando services/conversion.py (duplicado exacto)"
    rm -f services/conversion.py
fi

# Manejar credits.py segÃºn el anÃ¡lisis
case $CREDITS_ACTION in
    "copy_from_services")
        echo "ðŸ“‹ Copiando services/credits.py a backend/src/routes/"
        cp services/credits.py backend/src/routes/credits.py
        rm -f services/credits.py
        ;;
    "move_from_services")
        echo "ðŸ“‹ Moviendo services/credits.py a backend/src/routes/"
        mv services/credits.py backend/src/routes/credits.py
        ;;
    "remove_services")
        echo "ðŸ—‘ï¸ Eliminando services/credits.py (backend es mÃ¡s actual)"
        rm -f services/credits.py
        ;;
esac

# Mover servicios TypeScript al frontend
echo "ðŸ”„ Moviendo servicios TypeScript al frontend..."
for service in ebookConversionService.ts ebookValidationService.ts geminiService.ts; do
    if [ -f "services/$service" ]; then
        echo "ðŸ“‹ Moviendo services/$service a frontend/src/services/"
        mv "services/$service" "frontend/src/services/"
    fi
done

# Mover archivos de datos
echo "ðŸ“Š Reorganizando archivos de datos..."
for csv_file in utils/*.csv; do
    if [ -f "$csv_file" ]; then
        filename=$(basename "$csv_file")
        case $filename in
            *conversion*|*secuencial*)
                echo "ðŸ“‹ Moviendo $filename a data/conversions/"
                mv "$csv_file" "data/conversions/"
                ;;
            *format*)
                echo "ðŸ“‹ Moviendo $filename a data/formats/"
                mv "$csv_file" "data/formats/"
                ;;
            *)
                echo "ðŸ“‹ Moviendo $filename a data/conversions/ (por defecto)"
                mv "$csv_file" "data/conversions/"
                ;;
        esac
    fi
done

# Eliminar archivos de cachÃ©
echo "ðŸ§¹ Eliminando archivos de cachÃ©..."
rm -rf utils/__pycache__
rm -rf server/__pycache__ 2>/dev/null

# Eliminar bases de datos duplicadas
if [ -f "server/database/app.db" ]; then
    echo "ðŸ—‘ï¸ Eliminando server/database/app.db (duplicado)"
    rm -f server/database/app.db
fi

# Eliminar archivos obsoletos
if [ -f "server/index.mjs" ]; then
    echo "ðŸ—‘ï¸ Eliminando server/index.mjs (obsoleto)"
    rm -f server/index.mjs
fi

# FASE 5: Eliminar carpetas vacÃ­as
echo "ðŸ—‚ï¸ Eliminando carpetas vacÃ­as..."

# Verificar si las carpetas estÃ¡n vacÃ­as antes de eliminar
if [ -d "server/database" ] && [ -z "$(ls -A server/database)" ]; then
    rmdir server/database
    echo "ðŸ—‘ï¸ Eliminada carpeta vacÃ­a: server/database"
fi

if [ -d "server" ] && [ -z "$(ls -A server)" ]; then
    rmdir server
    echo "ðŸ—‘ï¸ Eliminada carpeta vacÃ­a: server"
fi

if [ -d "services" ] && [ -z "$(ls -A services)" ]; then
    rmdir services
    echo "ðŸ—‘ï¸ Eliminada carpeta vacÃ­a: services"
fi

if [ -d "utils" ] && [ -z "$(ls -A utils)" ]; then
    rmdir utils
    echo "ðŸ—‘ï¸ Eliminada carpeta vacÃ­a: utils"
fi

echo ""
echo "âœ… CONSOLIDACIÃ“N COMPLETADA!"
echo ""
echo "ðŸ“Š Resumen de cambios:"
echo "   ðŸ—‘ï¸ Eliminados duplicados exactos"
echo "   ðŸ“‹ Consolidados archivos con diferencias"
echo "   ðŸ”„ Servicios TypeScript movidos a frontend/src/services/"
echo "   ðŸ“Š Archivos CSV organizados en data/"
echo "   ðŸ—‚ï¸ Carpetas vacÃ­as eliminadas"
echo ""
echo "ðŸ“‹ Verificar con: ./validar_consolidacion.sh"
echo "ðŸ” Revisar cambios con: git status"


