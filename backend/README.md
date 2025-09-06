# ðŸ› ï¸ Anclora Nexus - Backend

## Requisitos
- Python 3.10+
- pip

## Dependencias clave
- Flask y extensiones (`Flask-CORS`, `Flask-JWT-Extended`, `Flask-SQLAlchemy`)
- LibrerÃ­as de documentos (`python-docx`, `fpdf2`, `pypdf`, `lxml`)
- `prometheus-flask-exporter` para mÃ©tricas

## InstalaciÃ³n

### Para producción/CI/CD:
```bash
cd backend
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Para desarrollo local:
```bash
cd backend
python -m pip install --upgrade pip
pip install -r requirements-dev.txt
```

### Para testing:
```bash
cd backend
python -m pip install --upgrade pip
pip install -r requirements-test.txt
```

> **Nota:** `python-magic-bin` se instala automáticamente solo en Windows para desarrollo local. En Linux/macOS y CI/CD, se usa detección de tipos MIME nativa.

## Uso
```bash
python src/main.py
```
El servicio quedarÃ¡ disponible en `http://localhost:${PORT:-8000}/api` con mÃ©tricas en `http://localhost:${PORT:-8000}/metrics`.
Puedes cambiar el puerto estableciendo la variable de entorno `PORT` antes de iniciar el servicio.

## Pruebas
```bash
python -m pytest tests/
```

