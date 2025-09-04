# 🏗️ GUÍA COMPLETA DE INSTALACIÓN Y DESPLIEGUE
# Anclora Nexus Testing Suite

## 📋 TABLA DE CONTENIDOS
1. [Preparación del Entorno](#1-preparación-del-entorno)
2. [Instalación de Dependencias](#2-instalación-de-dependencias) 
3. [Configuración Base](#3-configuración-base)
4. [Implementación de Suites](#4-implementación-de-suites)
5. [Generación de Fixtures](#5-generación-de-fixtures)
6. [Ejecución y Validación](#6-ejecución-y-validación)
7. [Integración CI/CD](#7-integración-cicd)
8. [Controles de Calidad](#8-controles-de-calidad)

---

## 1. PREPARACIÓN DEL ENTORNO

### 1.1 Requisitos del Sistema

**✅ REQUISITOS OBLIGATORIOS**
- **Python 3.11+** (verificado y funcionando)
- **Git** para control de versiones
- **Anclora Nexus** ejecutándose en puerto 5000
- **8GB RAM mínimo** (16GB recomendado)
- **10GB espacio libre** para fixtures y reportes

**✅ VERIFICACIÓN INICIAL**
```bash
# Verificar Python
python --version  # Debe ser >= 3.11

# Verificar Anclora Nexus funcionando
curl -s http://localhost:5000/api/health | grep -o "healthy"

# Verificar espacio en disco
df -h | grep -E "/$|/home"

# Verificar memoria
free -h
```

**🔧 COMANDO DE VERIFICACIÓN AUTOMATIZADA**
```bash
#!/bin/bash
# verify_environment.sh

echo "🔍 Verificando entorno para Anclora Testing Suite..."

# Python version
PYTHON_VERSION=$(python --version 2>&1 | grep -oP '\d+\.\d+')
if (( $(echo "$PYTHON_VERSION >= 3.11" | bc -l) )); then
    echo "✅ Python $PYTHON_VERSION - OK"
else
    echo "❌ Python $PYTHON_VERSION - REQUIERE 3.11+"
    exit 1
fi

# Anclora Nexus
if curl -s http://localhost:5000/api/health >/dev/null; then
    echo "✅ Anclora Nexus - CONECTADO"
else
    echo "❌ Anclora Nexus - NO DISPONIBLE"
    echo "   Inicia Anclora Nexus antes de continuar"
    exit 1
fi

# Espacio en disco
AVAILABLE=$(df / | tail -1 | awk '{print $4}')
if [ $AVAILABLE -gt 10485760 ]; then  # 10GB en KB
    echo "✅ Espacio en disco - SUFICIENTE"
else
    echo "⚠️ Espacio en disco - LIMITADO (necesario: 10GB)"
fi

echo "🎉 Entorno verificado correctamente"
```

### 1.2 Backup de Seguridad

**⚠️ IMPORTANTE: Crear backup antes de instalar**
```bash
# Backup de Anclora Nexus (si existe)
cp -r /path/to/anclora-nexus /path/to/anclora-nexus-backup-$(date +%Y%m%d)

# Backup de base de datos existente
if [ -f "anclora_nexus.db" ]; then
    cp anclora_nexus.db anclora_nexus_backup_$(date +%Y%m%d).db
fi

echo "✅ Backup completado"
```

---

## 2. INSTALACIÓN DE DEPENDENCIAS

### 2.1 Framework de Testing y Core

**📦 INSTALACIÓN PASO A PASO**
```bash
# 1. Crear entorno virtual (RECOMENDADO)
python -m venv anclora-testing-env
source anclora-testing-env/bin/activate  # Linux/Mac
# anclora-testing-env\Scripts\activate  # Windows

# 2. Actualizar pip
pip install --upgrade pip setuptools wheel

# 3. Instalar dependencias core
pip install pytest==8.3.3
pip install pytest-asyncio==0.23.8
pip install pytest-xdist==3.6.0
pip install pytest-html==4.1.1
pip install pytest-benchmark==4.0.0

# 4. API testing y HTTP
pip install requests==2.32.3
pip install httpx==0.27.0
pip install aiohttp==3.9.1

echo "✅ Framework de testing instalado"
```

### 2.2 Librerías de Manipulación de Archivos

```bash
# Detección y manipulación de archivos
pip install filetype==1.2.0
pip install python-magic==0.4.27

# Imágenes
pip install Pillow==11.0.0

# Documentos
pip install python-docx==1.1.2
pip install pypdf==5.9.0
pip install openpyxl==3.1.2

# Datos
pip install pandas==2.2.2
pip install numpy==2.0.1

echo "✅ Librerías de archivos instaladas"
```

### 2.3 Base de Datos y ORM

```bash
# SQLAlchemy para métricas
pip install SQLAlchemy==2.0.36
pip install alembic==1.13.2

echo "✅ Sistema de base de datos instalado"
```

### 2.4 Interfaz de Usuario y Reportes

```bash
# UI y visualización
pip install streamlit==1.28.2
pip install plotly==5.17.0
pip install matplotlib==3.8.4

# Reportes
pip install rich==13.7.1
pip install jinja2==3.1.4
pip install markdown==3.8.2

# Progreso visual
pip install tqdm==4.66.4

echo "✅ Interfaz y reportes instalados"
```

### 2.5 Configuración y Utilidades

```bash
# Configuración
pip install python-dotenv==1.0.1
pip install pydantic==2.8.2
pip install click==8.1.7

# Validación de paths
pip install pathvalidate==3.2.0

echo "✅ Utilidades instaladas"
```

### 2.6 Verificación de Instalación

**🔧 COMANDO DE VERIFICACIÓN**
```bash
#!/bin/bash
# verify_installation.sh

echo "🔍 Verificando instalación de dependencias..."

# Lista de paquetes críticos
PACKAGES=(
    "pytest"
    "streamlit" 
    "requests"
    "pandas"
    "Pillow"
    "python-docx"
    "SQLAlchemy"
    "plotly"
)

for package in "${PACKAGES[@]}"; do
    if python -c "import $package" 2>/dev/null; then
        VERSION=$(python -c "import $package; print($package.__version__)" 2>/dev/null)
        echo "✅ $package $VERSION"
    else
        echo "❌ $package - NO INSTALADO"
        exit 1
    fi
done

echo "🎉 Todas las dependencias instaladas correctamente"
```

---

## 3. CONFIGURACIÓN BASE

### 3.1 Archivos de Configuración

**📄 CREAR .env**
```bash
cat > .env << 'EOF'
# Anclora Nexus Connection
ANCLORA_API_URL=http://localhost:5000
ANCLORA_API_KEY=
ANCLORA_TEST_USER=test@ancloranexus.com
ANCLORA_TEST_PASSWORD=testing_password

# Testing Configuration
TESTING_PARALLEL_WORKERS=4
TESTING_TIMEOUT_SECONDS=300
TESTING_RETRY_ATTEMPTS=3
TESTING_FIXTURES_PATH=./fixtures
TESTING_REPORTS_PATH=./reports
TESTING_LOGS_PATH=./logs

# Database
DATABASE_URL=sqlite:///testing_metrics.db

# Reporting
EXPORT_FORMATS=markdown,html,json
REPORT_LEVEL=detailed
MIN_SUCCESS_RATE=0.85

# UI Configuration
UI_HOST=localhost
UI_PORT=8501
UI_THEME=light
EOF

echo "✅ Archivo .env creado"
```

### 3.2 Configuración de Logs

**📊 CREAR CONFIGURACIÓN DE LOGGING**
```bash
mkdir -p logs

cat > src/utils/logger.py << 'EOF'
import logging
import logging.handlers
from pathlib import Path
from datetime import datetime

def setup_logging(level: str = "INFO", logs_path: Path = Path("./logs")):
    """Configurar sistema de logging"""
    logs_path.mkdir(parents=True, exist_ok=True)
    
    # Configurar formato
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Handler para archivo
    log_file = logs_path / f"anclora_testing_{datetime.now().strftime('%Y%m%d')}.log"
    file_handler = logging.handlers.RotatingFileHandler(
        log_file, maxBytes=50*1024*1024, backupCount=5
    )
    file_handler.setFormatter(formatter)
    
    # Handler para consola
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    
    # Configurar root logger
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        handlers=[file_handler, console_handler],
        force=True
    )
    
    return logging.getLogger("anclora_testing")
EOF

echo "✅ Sistema de logging configurado"
```

### 3.3 Base de Datos

**🗄️ INICIALIZAR BASE DE DATOS**
```bash
cat > scripts/init_database.py << 'EOF'
#!/usr/bin/env python3
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.models import create_database
from src.config import config

def main():
    print("🗄️ Inicializando base de datos...")
    
    try:
        engine, Session = create_database(config.DATABASE_URL)
        print(f"✅ Base de datos creada: {config.DATABASE_URL}")
        
        # Crear sesión de prueba
        session = Session()
        session.close()
        print("✅ Conexión verificada")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
EOF

python scripts/init_database.py
echo "✅ Base de datos inicializada"
```

### 3.4 Verificación de Configuración

**🔧 COMANDO DE VERIFICACIÓN**
```bash
#!/bin/bash
# verify_configuration.sh

echo "🔍 Verificando configuración..."

# Verificar archivos de configuración
if [ -f ".env" ]; then
    echo "✅ .env existe"
else
    echo "❌ .env no encontrado"
    exit 1
fi

# Verificar directorios
DIRS=("fixtures" "reports" "logs" "src")
for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ Directorio $dir existe"
    else
        echo "⚠️ Creando directorio $dir"
        mkdir -p "$dir"
    fi
done

# Verificar base de datos
if python -c "from src.models import create_database; from src.config import config; create_database(config.DATABASE_URL)" 2>/dev/null; then
    echo "✅ Base de datos accesible"
else
    echo "❌ Problema con base de datos"
    exit 1
fi

echo "🎉 Configuración verificada"
```

---

## 4. IMPLEMENTACIÓN DE SUITES

### 4.1 Suite Documents (290 tests)

**📄 CREAR FACTORY DE SUITES**
```bash
mkdir -p src/suites

cat > src/suites/test_suite_factory.py << 'EOF'
from pathlib import Path
from typing import List, Dict, Any
import random

from src.models import TestCase, SequentialTestCase, TestPriority
from src.config import SUPPORTED_CONVERSIONS, TEST_SUITES_CONFIG

class TestSuiteFactory:
    """Factory para generar casos de test por suite"""
    
    def __init__(self, fixtures_path: Path):
        self.fixtures_path = fixtures_path
    
    def generate_test_cases_for_suite(self, suite_name: str) -> List[TestCase]:
        """Generar casos de test para una suite específica"""
        if suite_name == "documents":
            return self._generate_documents_tests()
        elif suite_name == "images":
            return self._generate_images_tests()
        elif suite_name == "data":
            return self._generate_data_tests()
        elif suite_name == "sequential":
            return self._generate_sequential_tests()
        elif suite_name == "integration":
            return self._generate_integration_tests()
        else:
            return []
    
    def _generate_documents_tests(self) -> List[TestCase]:
        """Generar tests para documentos (290 casos)"""
        test_cases = []
        documents_path = self.fixtures_path / "documents"
        
        if not documents_path.exists():
            return test_cases
        
        # Buscar archivos de documentos
        for file_path in documents_path.glob("*"):
            if file_path.is_file() and file_path.suffix.lower() in ['.txt', '.docx', '.html', '.md']:
                source_format = file_path.suffix.lower().lstrip('.')
                
                # Generar conversiones soportadas para este formato
                targets = SUPPORTED_CONVERSIONS.get(source_format, [])
                for target_format in targets:
                    test_case = TestCase(
                        name=f"{source_format}_to_{target_format}_{file_path.stem}",
                        description=f"Convert {file_path.name} from {source_format} to {target_format}",
                        source_format=source_format,
                        target_format=target_format,
                        input_file_path=file_path,
                        category="documents",
                        priority=TestPriority.HIGH,
                        timeout=120,
                        validate_quality=True
                    )
                    test_cases.append(test_case)
        
        return test_cases[:290]  # Limitar a 290 casos
EOF

echo "✅ Factory de suites creado"
```

### 4.2 Implementación Completa de Suites

**🧪 COMPLETAR TODAS LAS SUITES**
```bash
# El archivo ya tiene la estructura base
# Agregar métodos para el resto de suites

cat >> src/suites/test_suite_factory.py << 'EOF'
    
    def _generate_images_tests(self) -> List[TestCase]:
        """Generar tests para imágenes (190 casos)"""
        test_cases = []
        images_path = self.fixtures_path / "images"
        
        if not images_path.exists():
            return test_cases
        
        for file_path in images_path.glob("*"):
            if file_path.is_file() and file_path.suffix.lower() in ['.png', '.jpg', '.gif', '.svg']:
                source_format = file_path.suffix.lower().lstrip('.')
                if source_format == 'jpeg':
                    source_format = 'jpg'
                
                targets = SUPPORTED_CONVERSIONS.get(source_format, [])
                for target_format in targets:
                    test_case = TestCase(
                        name=f"{source_format}_to_{target_format}_{file_path.stem}",
                        description=f"Convert image {file_path.name}",
                        source_format=source_format,
                        target_format=target_format,
                        input_file_path=file_path,
                        category="images",
                        priority=TestPriority.HIGH,
                        timeout=60
                    )
                    test_cases.append(test_case)
        
        return test_cases[:190]
    
    def _generate_sequential_tests(self) -> List[TestCase]:
        """Generar tests de secuencias (115 casos)"""
        test_cases = []
        sequential_path = self.fixtures_path / "sequential"
        
        if not sequential_path.exists():
            return test_cases
        
        # Secuencias innovadoras basadas en análisis competitivo
        innovative_sequences = [
            [("json", "csv"), ("csv", "xlsx"), ("xlsx", "pdf")],  # 3 pasos
            [("csv", "json"), ("json", "html"), ("html", "pdf")],  # 3 pasos
            [("md", "html"), ("html", "pdf"), ("pdf", "docx")],    # 3 pasos
            [("svg", "png"), ("png", "pdf")],                     # 2 pasos
            [("html", "md"), ("md", "docx")]                      # 2 pasos
        ]
        
        for i, steps in enumerate(innovative_sequences):
            for j in range(23):  # 23 tests por secuencia
                source_format = steps[0][0]
                input_file = sequential_path / f"seq_test_{source_format}_{i}_{j}.{source_format}"
                
                if input_file.exists():
                    test_case = SequentialTestCase(
                        name=f"sequence_{i}_{j}",
                        description=f"Sequential conversion: {' → '.join([f'{s}->{t}' for s,t in steps])}",
                        conversion_steps=steps,
                        input_file_path=input_file,
                        priority=TestPriority.CRITICAL,
                        timeout=600,
                        validate_each_step=True
                    )
                    test_cases.append(test_case)
        
        return test_cases
EOF

echo "✅ Implementación de suites completada"
```

---

## 5. GENERACIÓN DE FIXTURES

### 5.1 Generación Masiva Automática

**🏭 EJECUTAR GENERACIÓN COMPLETA**
```bash
echo "🏭 Iniciando generación masiva de fixtures..."

# Ejecutar generador
python -c "
from src.fixtures.generator import FixtureGenerator
from src.config import config
from pathlib import Path
import json

generator = FixtureGenerator(config.FIXTURES_PATH)
result = generator.generate_all_fixtures()

print(f'✅ Generación completada:')
print(f'  Exitosos: {result[\"stats\"][\"successful\"]:,}')
print(f'  Fallidos: {result[\"stats\"][\"failed\"]:,}')
print(f'  Duración: {(result[\"stats\"][\"end_time\"] - result[\"stats\"][\"start_time\"]).total_seconds():.1f}s')

# Guardar reporte de generación
with open('fixtures_generation_report.json', 'w') as f:
    json.dump(result, f, indent=2, default=str)
    
print(f'📋 Reporte guardado: fixtures_generation_report.json')
"

echo "✅ Fixtures generados"
```

### 5.2 Verificación de Fixtures

**🔍 VERIFICAR CALIDAD DE FIXTURES**
```bash
cat > scripts/verify_fixtures.py << 'EOF'
#!/usr/bin/env python3
import json
from pathlib import Path
from collections import defaultdict

def verify_fixtures():
    fixtures_path = Path("./fixtures")
    manifest_path = fixtures_path / "manifest.json"
    
    print("🔍 Verificando fixtures generados...")
    
    # Cargar manifiesto
    if not manifest_path.exists():
        print("❌ Manifiesto no encontrado")
        return False
    
    with open(manifest_path) as f:
        manifest = json.load(f)
    
    # Verificar categorías esperadas
    expected_categories = {
        "documents": 290,
        "images": 190, 
        "data": 45,
        "media": 30,
        "corrupted": 50,
        "sequential": 115
    }
    
    total_expected = sum(expected_categories.values())
    total_actual = manifest["summary"]["total_files"]
    
    print(f"📊 Archivos: {total_actual:,} / {total_expected:,} esperados")
    
    # Verificar por categoría
    issues = []
    for category, expected_count in expected_categories.items():
        actual_count = len(manifest["categories"].get(category, {}).get("files", []))
        percentage = (actual_count / expected_count) * 100 if expected_count > 0 else 0
        
        status = "✅" if percentage >= 90 else "⚠️" if percentage >= 50 else "❌"
        print(f"  {status} {category}: {actual_count} / {expected_count} ({percentage:.0f}%)")
        
        if percentage < 90:
            issues.append(f"{category}: {actual_count}/{expected_count}")
    
    if issues:
        print(f"\n⚠️ Problemas encontrados:")
        for issue in issues:
            print(f"  - {issue}")
        return False
    else:
        print(f"\n✅ Todos los fixtures generados correctamente")
        return True

if __name__ == "__main__":
    success = verify_fixtures()
    exit(0 if success else 1)
EOF

python scripts/verify_fixtures.py
```

### 5.3 Rollback de Fixtures (si es necesario)

**🔄 PROCEDIMIENTO DE ROLLBACK**
```bash
cat > scripts/rollback_fixtures.sh << 'EOF'
#!/bin/bash
# rollback_fixtures.sh

echo "🔄 Iniciando rollback de fixtures..."

# Backup actual
if [ -d "fixtures" ]; then
    echo "📦 Creando backup de fixtures actuales..."
    mv fixtures fixtures_backup_$(date +%Y%m%d_%H%M%S)
fi

# Limpiar directorio
rm -rf fixtures/
mkdir -p fixtures

echo "✅ Fixtures eliminados - Ejecutar generación nuevamente"
EOF

chmod +x scripts/rollback_fixtures.sh
echo "✅ Script de rollback creado"
```

---

## 6. EJECUCIÓN Y VALIDACIÓN

### 6.1 Test de Validación del Sistema

**🧪 EJECUTAR VALIDACIÓN COMPLETA**
```bash
echo "🧪 Ejecutando validación completa del sistema..."

# 1. Verificar salud del sistema
python main.py --check-health
if [ $? -ne 0 ]; then
    echo "❌ Sistema no saludable"
    exit 1
fi

# 2. Test rápido para validación básica
echo "🚀 Ejecutando test rápido..."
python main.py --quick-test --formats json
if [ $? -ne 0 ]; then
    echo "❌ Test rápido falló"
    exit 1
fi

# 3. Suite de documentos (la más importante)
echo "📄 Ejecutando suite de documentos..."
python main.py --suite documents --formats markdown,json
if [ $? -ne 0 ]; then
    echo "⚠️ Suite de documentos falló - revisar"
fi

# 4. Test de secuencias innovadoras
echo "🔄 Ejecutando test de secuencias..."
python main.py --suite sequential --formats markdown
if [ $? -ne 0 ]; then
    echo "⚠️ Secuencias fallaron - revisar"
fi

echo "✅ Validación del sistema completada"
```

### 6.2 Criterios de Finalización Obligatorios

**✅ VALIDACIÓN DE CRITERIOS**
```bash
cat > scripts/validate_completion.py << 'EOF'
#!/usr/bin/env python3
import json
from pathlib import Path
import sys

def validate_completion():
    """Validar criterios de finalización obligatorios"""
    print("✅ Validando criterios de finalización...")
    
    issues = []
    
    # 1. Verificar fixtures mínimos
    fixtures_manifest = Path("fixtures/manifest.json")
    if fixtures_manifest.exists():
        with open(fixtures_manifest) as f:
            manifest = json.load(f)
            total_fixtures = manifest["summary"]["total_files"]
            if total_fixtures < 600:
                issues.append(f"Fixtures insuficientes: {total_fixtures}/600+")
            else:
                print(f"  ✅ Fixtures: {total_fixtures:,}")
    else:
        issues.append("Manifiesto de fixtures no encontrado")
    
    # 2. Verificar reportes de test
    reports_path = Path("reports")
    if reports_path.exists():
        recent_reports = list(reports_path.glob("test_report_*.json"))
        if recent_reports:
            # Cargar reporte más reciente
            latest_report = max(recent_reports, key=lambda p: p.stat().st_mtime)
            with open(latest_report) as f:
                report = json.load(f)
                success_rate = report["overall_stats"]["overall_success_rate"]
                if success_rate < 0.85:
                    issues.append(f"Tasa de éxito baja: {success_rate:.1%}/85%+")
                else:
                    print(f"  ✅ Tasa de éxito: {success_rate:.1%}")
        else:
            issues.append("No hay reportes de test disponibles")
    else:
        issues.append("Directorio de reportes no encontrado")
    
    # 3. Verificar conectividad con Anclora Nexus
    try:
        import requests
        response = requests.get("http://localhost:5000/api/health", timeout=10)
        if response.status_code == 200:
            print("  ✅ Anclora Nexus: Conectado")
        else:
            issues.append(f"Anclora Nexus: HTTP {response.status_code}")
    except Exception as e:
        issues.append(f"Anclora Nexus: {e}")
    
    # 4. Verificar base de datos
    try:
        from src.models import create_database
        from src.config import config
        engine, Session = create_database(config.DATABASE_URL)
        session = Session()
        session.close()
        print("  ✅ Base de datos: Funcional")
    except Exception as e:
        issues.append(f"Base de datos: {e}")
    
    # Resultado final
    if issues:
        print(f"\n❌ CRITERIOS NO CUMPLIDOS:")
        for issue in issues:
            print(f"  - {issue}")
        return False
    else:
        print(f"\n🎉 TODOS LOS CRITERIOS CUMPLIDOS")
        print(f"✅ Sistema listo para producción")
        return True

if __name__ == "__main__":
    success = validate_completion()
    sys.exit(0 if success else 1)
EOF

python scripts/validate_completion.py
```

---

## 7. INTEGRACIÓN CI/CD

### 7.1 GitHub Actions Workflow

**🔄 CREAR WORKFLOW AUTOMATIZADO**
```bash
mkdir -p .github/workflows

cat > .github/workflows/anclora-testing.yml << 'EOF'
name: 🧪 Anclora Nexus Testing Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    # Ejecutar diariamente a las 2 AM UTC
    - cron: '0 2 * * *'

jobs:
  test:
    name: 🚀 Run Testing Suite
    runs-on: ubuntu-latest
    timeout-minutes: 60
    
    strategy:
      matrix:
        python-version: [3.11, 3.12]
        suite: [documents, images, data, sequential]
    
    steps:
    - name: 📥 Checkout code
      uses: actions/checkout@v4
    
    - name: 🐍 Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}
    
    - name: 📦 Cache dependencies
      uses: actions/cache@v3
      with:
        path: ~/.cache/pip
        key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
        restore-keys: |
          ${{ runner.os }}-pip-
    
    - name: 🔧 Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    
    - name: 🏭 Generate fixtures
      run: |
        python main.py --generate-fixtures
      timeout-minutes: 10
    
    - name: 🧪 Run test suite
      run: |
        python main.py --suite ${{ matrix.suite }} --formats json --workers 2
      timeout-minutes: 30
    
    - name: 📊 Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results-${{ matrix.suite }}-py${{ matrix.python-version }}
        path: reports/
    
    - name: 📈 Update metrics
      if: matrix.suite == 'documents' && matrix.python-version == '3.11'
      run: |
        # Actualizar métricas en base de datos o servicio externo
        echo "Actualizando métricas..."
    
  validate:
    name: ✅ Validate System Health
    runs-on: ubuntu-latest
    needs: test
    if: always()
    
    steps:
    - name: 📥 Checkout code
      uses: actions/checkout@v4
    
    - name: 🐍 Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: 3.11
    
    - name: 🔧 Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    
    - name: ✅ Validate completion
      run: |
        python scripts/validate_completion.py
    
    - name: 📝 Generate summary report
      run: |
        python -c "
        import json
        from pathlib import Path
        print('## 📊 Test Results Summary')
        print('| Suite | Status |')
        print('|-------|--------|')
        for report in Path('reports').glob('test_report_*.json'):
            with open(report) as f:
                data = json.load(f)
                success_rate = data['overall_stats']['overall_success_rate']
                status = '✅ Pass' if success_rate >= 0.85 else '❌ Fail'
                print(f'| Suite | {status} ({success_rate:.1%}) |')
        " >> $GITHUB_STEP_SUMMARY
EOF

echo "✅ GitHub Actions workflow creado"
```

### 7.2 Pre-commit Hooks

**🪝 CONFIGURAR HOOKS DE PRE-COMMIT**
```bash
cat > .pre-commit-config.yaml << 'EOF'
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: check-merge-conflict
      - id: debug-statements
  
  - repo: local
    hooks:
      - id: anclora-quick-test
        name: 🧪 Anclora Quick Test
        entry: python main.py --quick-test
        language: system
        pass_filenames: false
        always_run: true
        
      - id: fixtures-validation
        name: 🏭 Fixtures Validation
        entry: python scripts/verify_fixtures.py
        language: system
        pass_filenames: false
        files: ^fixtures/
EOF

# Instalar pre-commit
pip install pre-commit
pre-commit install

echo "✅ Pre-commit hooks configurados"
```

---

## 8. CONTROLES DE CALIDAD

### 8.1 Métricas Objetivo

**🎯 DEFINIR MÉTRICAS CLARAS**
```bash
cat > quality_metrics.json << 'EOF'
{
  "quality_metrics": {
    "success_rate": {
      "minimum": 0.85,
      "target": 0.92,
      "critical": 0.70
    },
    "execution_time": {
      "maximum_seconds": 1800,
      "target_seconds": 900,
      "critical_seconds": 3600
    },
    "fixtures_count": {
      "minimum": 600,
      "target": 800,
      "critical": 400
    },
    "test_coverage": {
      "minimum": 0.95,
      "target": 1.0,
      "critical": 0.85
    }
  },
  "completion_criteria": {
    "mandatory": [
      "success_rate >= 0.85",
      "fixtures_count >= 600",
      "anclora_connection == true",
      "database_functional == true"
    ],
    "recommended": [
      "execution_time <= 1800",
      "test_coverage >= 0.95",
      "ci_cd_integration == true"
    ]
  }
}
EOF

echo "✅ Métricas de calidad definidas"
```

### 8.2 Script de Validación Final

**✅ VALIDACIÓN FINAL COMPLETA**
```bash
cat > scripts/final_validation.sh << 'EOF'
#!/bin/bash
# final_validation.sh - Validación final completa

echo "🎯 INICIANDO VALIDACIÓN FINAL DEL SISTEMA"
echo "========================================"

ERRORS=0
WARNINGS=0

# 1. Verificar instalación
echo "1️⃣ Verificando instalación..."
if python scripts/verify_installation.sh; then
    echo "   ✅ Instalación correcta"
else
    echo "   ❌ Problemas de instalación"
    ((ERRORS++))
fi

# 2. Verificar configuración
echo "2️⃣ Verificando configuración..."
if bash scripts/verify_configuration.sh; then
    echo "   ✅ Configuración correcta"
else
    echo "   ❌ Problemas de configuración"
    ((ERRORS++))
fi

# 3. Verificar fixtures
echo "3️⃣ Verificando fixtures..."
if python scripts/verify_fixtures.py; then
    echo "   ✅ Fixtures correctos"
else
    echo "   ⚠️ Problemas con fixtures"
    ((WARNINGS++))
fi

# 4. Test funcional
echo "4️⃣ Ejecutando test funcional..."
if python main.py --quick-test; then
    echo "   ✅ Test funcional exitoso"
else
    echo "   ❌ Test funcional falló"
    ((ERRORS++))
fi

# 5. Verificar criterios de finalización
echo "5️⃣ Verificando criterios de finalización..."
if python scripts/validate_completion.py; then
    echo "   ✅ Todos los criterios cumplidos"
else
    echo "   ❌ Criterios no cumplidos"
    ((ERRORS++))
fi

# 6. Test de interfaz web
echo "6️⃣ Verificando interfaz web..."
if timeout 10s python -c "import streamlit; print('Streamlit disponible')"; then
    echo "   ✅ Interfaz web disponible"
else
    echo "   ⚠️ Problemas con interfaz web"
    ((WARNINGS++))
fi

# Resultado final
echo ""
echo "📊 RESUMEN DE VALIDACIÓN"
echo "======================="
echo "❌ Errores críticos: $ERRORS"
echo "⚠️ Advertencias: $WARNINGS"

if [ $ERRORS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo "🎉 SISTEMA COMPLETAMENTE FUNCIONAL"
        echo "✅ Listo para producción"
        exit 0
    else
        echo "⚠️ Sistema funcional con advertencias"
        echo "💡 Revisar advertencias pero puede continuar"
        exit 0
    fi
else
    echo "❌ SISTEMA NO FUNCIONAL"
    echo "🛠️ Corregir errores antes de continuar"
    exit 1
fi
EOF

chmod +x scripts/final_validation.sh

# Ejecutar validación final
bash scripts/final_validation.sh
```

---

## 🎉 RESUMEN DE INSTALACIÓN

### ✅ Checklist Final

- [ ] **Entorno preparado** (Python 3.11+, Anclora Nexus funcionando)
- [ ] **Dependencias instaladas** (pytest, streamlit, pandas, etc.)
- [ ] **Configuración base** (.env, logging, base de datos)
- [ ] **Suites implementadas** (documents, images, data, sequential)
- [ ] **Fixtures generados** (600+ archivos de prueba)
- [ ] **Validación ejecutada** (tests funcionando correctamente)
- [ ] **CI/CD configurado** (GitHub Actions, pre-commit hooks)
- [ ] **Controles de calidad** (métricas, validación final)

### 🚀 Comandos de Inicio Rápido

```bash
# Después de completar toda la instalación:

# 1. Verificar sistema completo
bash scripts/final_validation.sh

# 2. Iniciar interfaz web
python main.py

# 3. O ejecutar desde CLI
python main.py --all-suites
```

### 📞 Soporte

Si encuentras problemas durante la instalación:

1. **Revisar logs**: `tail -f logs/anclora_testing_*.log`
2. **Ejecutar diagnósticos**: `python main.py --check-health --verbose`
3. **Validar paso a paso**: Ejecutar cada script de verificación individualmente
4. **Consultar documentación**: README.md y wiki del proyecto

---

**🎯 ¡Tu sistema Anclora Nexus Testing Suite está listo para validar más de 600 casos de prueba y mantener la calidad de las conversiones!** 🚀