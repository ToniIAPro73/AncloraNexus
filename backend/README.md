# ðŸ› ï¸ Anclora Nexus - Backend

## Requisitos
- Python 3.10+
- pip

## Dependencias clave
- Flask y extensiones (`Flask-CORS`, `Flask-JWT-Extended`, `Flask-SQLAlchemy`)
- LibrerÃ­as de documentos (`python-docx`, `fpdf2`, `pypdf`, `lxml`)
- `prometheus-flask-exporter` para mÃ©tricas

## InstalaciÃ³n
```bash
cd backend
python -m pip install --upgrade pip
pip install -r requirements.txt
```

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

