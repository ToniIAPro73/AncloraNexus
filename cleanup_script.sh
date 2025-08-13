#!/bin/bash

echo "=== LIMPIEZA DE ARCHIVOS DEL AGENTE ==="
echo "Ejecutando desde: $(git branch --show-current)"

# Verificar rama main
if [ "$(git branch --show-current)" != "main" ]; then
    echo "❌ DEBE ejecutarse desde rama main"
    exit 1
fi

# Crear backup de seguridad
git tag backup-$(date +%Y%m%d-%H%M%S)

# Eliminar archivos del índice de Git
echo "Eliminando archivos problemáticos del índice..."
git rm --cached pytest.ini 2>/dev/null || echo "pytest.ini no encontrado en índice"
git rm --cached requirements.txt 2>/dev/null || echo "requirements.txt no encontrado en índice"
git rm --cached package.json 2>/dev/null || echo "package.json no encontrado en índice"

# Eliminar archivos físicos si existen
rm -f pytest.ini requirements.txt package.json

# Limpiar del historial completo
echo "Limpiando historial de Git..."
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch pytest.ini requirements.txt package.json' \
  --prune-empty --tag-name-filter cat -- --all

# Limpieza de referencias
echo "Limpiando referencias..."
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Crear .gitignore actualizado
echo "Actualizando .gitignore..."
cat >> .gitignore << 'EOF'

# Archivos generados por agentes
pytest.ini
requirements.txt
package.json
package-lock.json

# Python testing
.pytest_cache/
__pycache__/
*.pyc

# Node modules (si aplica)
node_modules/
EOF

# Commit de limpieza
git add .gitignore
git commit -m "chore: remove agent-generated files and update gitignore"

echo "✅ Limpieza completada localmente"
echo "Ejecuta: git push origin main --force"
