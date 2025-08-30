#!/bin/bash

# Script de configuraciÃ³n automÃ¡tica para Anclora Converter
# VersiÃ³n: 1.0.0
# Fecha: 14 de Julio, 2025

set -e

echo "ðŸš€ Configurando Anclora Converter..."
echo "=================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# FunciÃ³n para imprimir mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar prerrequisitos
check_prerequisites() {
    print_status "Verificando prerrequisitos..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js no estÃ¡ instalado. Por favor instala Node.js 18+ desde https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js versiÃ³n 18+ requerida. VersiÃ³n actual: $(node --version)"
        exit 1
    fi
    print_success "Node.js $(node --version) âœ“"
    
    # Verificar Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 no estÃ¡ instalado. Por favor instala Python 3.11+"
        exit 1
    fi
    
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1-2)
    print_success "Python $(python3 --version) âœ“"
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        print_error "npm no estÃ¡ instalado. Por favor instala npm"
        exit 1
    fi
    print_success "npm $(npm --version) âœ“"
    
    # Verificar pip
    if ! command -v pip3 &> /dev/null; then
        print_error "pip3 no estÃ¡ instalado. Por favor instala pip3"
        exit 1
    fi
    print_success "pip3 $(pip3 --version | cut -d' ' -f2) âœ“"
}

# Configurar frontend
setup_frontend() {
    print_status "Configurando frontend React..."
    
    cd frontend
    
    # Instalar dependencias
    print_status "Instalando dependencias del frontend..."
    npm install
    
    # Configurar variables de entorno
    if [ ! -f .env ]; then
        print_status "Creando archivo .env para frontend..."
        cp .env.example .env
        print_warning "Por favor edita frontend/.env con tu configuraciÃ³n"
    else
        print_success "Archivo .env ya existe"
    fi
    
    cd ..
    print_success "Frontend configurado âœ“"
}

# Configurar backend
setup_backend() {
    print_status "Configurando backend Flask..."
    
    cd backend
    
    # Crear entorno virtual
    if [ ! -d "venv" ]; then
        print_status "Creando entorno virtual..."
        python3 -m venv venv
    else
        print_success "Entorno virtual ya existe"
    fi
    
    # Activar entorno virtual
    source venv/bin/activate
    
    # Actualizar pip
    print_status "Actualizando pip..."
    pip install --upgrade pip
    
    # Instalar dependencias
    print_status "Instalando dependencias del backend..."
    pip install -r requirements.txt
    
    # Configurar variables de entorno
    if [ ! -f .env ]; then
        print_status "Creando archivo .env para backend..."
        cp .env.example .env
        print_warning "Por favor edita backend/.env con tu configuraciÃ³n"
    else
        print_success "Archivo .env ya existe"
    fi
    
    cd ..
    print_success "Backend configurado âœ“"
}

# Configurar base de datos
setup_database() {
    print_status "Configurando base de datos..."
    
    cd backend
    source venv/bin/activate
    
    # Verificar si PostgreSQL estÃ¡ disponible
    if command -v psql &> /dev/null; then
        print_status "PostgreSQL detectado"
        print_warning "AsegÃºrate de crear la base de datos: createdb anclora_db"
    else
        print_warning "PostgreSQL no detectado. Usando SQLite para desarrollo."
        # Configurar SQLite en .env si no existe PostgreSQL
        if grep -q "postgresql://" .env 2>/dev/null; then
            sed -i 's|postgresql://.*|sqlite:///anclora.db|' .env
        fi
    fi
    
    # Inicializar base de datos
    print_status "Inicializando base de datos..."
    python3 -c "
from src.main import create_app
app = create_app()
with app.app_context():
    from src.models import db
    db.create_all()
    print('Base de datos inicializada correctamente')
" || print_warning "Error al inicializar base de datos. Verifica la configuraciÃ³n."
    
    cd ..
    print_success "Base de datos configurada âœ“"
}

# Crear scripts de inicio
create_start_scripts() {
    print_status "Creando scripts de inicio..."
    
    # Script para iniciar frontend
    cat > start_frontend.sh << 'EOF'
#!/bin/bash
echo "ðŸŽ¨ Iniciando frontend React..."
cd frontend
npm run dev
EOF
    chmod +x start_frontend.sh
    
    # Script para iniciar backend
    cat > start_backend.sh << 'EOF'
#!/bin/bash
echo "âš™ï¸ Iniciando backend Flask..."
cd backend
source venv/bin/activate
python src/main.py
EOF
    chmod +x start_backend.sh
    
    # Script para iniciar ambos
    cat > start_all.sh << 'EOF'
#!/bin/bash
echo "ðŸš€ Iniciando Anclora Converter completo..."

# FunciÃ³n para manejar Ctrl+C
cleanup() {
    echo "ðŸ›‘ Deteniendo servicios..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT

# Iniciar backend en background
echo "âš™ï¸ Iniciando backend..."
cd backend
source venv/bin/activate
python src/main.py &
BACKEND_PID=$!
cd ..

# Esperar un poco para que el backend inicie
sleep 3

# Iniciar frontend en background
echo "ðŸŽ¨ Iniciando frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "âœ… Servicios iniciados:"
echo "   - Backend: http://localhost:5000"
echo "   - Frontend: http://localhost:3000"
echo ""
echo "Presiona Ctrl+C para detener todos los servicios"

# Esperar a que terminen los procesos
wait $BACKEND_PID $FRONTEND_PID
EOF
    chmod +x start_all.sh
    
    print_success "Scripts de inicio creados âœ“"
}

# FunciÃ³n principal
main() {
    echo "ðŸŽ¯ Anclora Converter - Setup AutomÃ¡tico"
    echo "======================================"
    echo ""
    
    check_prerequisites
    echo ""
    
    setup_frontend
    echo ""
    
    setup_backend
    echo ""
    
    setup_database
    echo ""
    
    create_start_scripts
    echo ""
    
    print_success "ðŸŽ‰ Â¡ConfiguraciÃ³n completada!"
    echo ""
    echo "ðŸ“‹ PrÃ³ximos pasos:"
    echo "1. Edita las variables de entorno:"
    echo "   - frontend/.env"
    echo "   - backend/.env"
    echo ""
    echo "2. Si usas PostgreSQL, crea la base de datos:"
    echo "   createdb anclora_db"
    echo ""
    echo "3. Inicia la aplicaciÃ³n:"
    echo "   ./start_all.sh    # Inicia frontend y backend"
    echo "   ./start_frontend.sh  # Solo frontend"
    echo "   ./start_backend.sh   # Solo backend"
    echo ""
    echo "4. Accede a la aplicaciÃ³n:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:5000"
    echo ""
    echo "ðŸ“š DocumentaciÃ³n disponible en docs/"
    echo ""
    print_success "Â¡Disfruta desarrollando con Anclora Converter! ðŸš€"
}

# Ejecutar funciÃ³n principal
main "$@"


