# 🛠️ Anclora Metaform - Backend

## Requisitos
- Python 3.10+
- pip

## Dependencias clave
- Flask y extensiones (`Flask-CORS`, `Flask-JWT-Extended`, `Flask-SQLAlchemy`)
- Librerías de documentos (`python-docx`, `fpdf2`, `pypdf`, `lxml`)
- `prometheus-flask-exporter` para métricas

## Instalación
```bash
cd backend
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## Uso
```bash
python src/main.py
```
El servicio quedará disponible en `http://localhost:${PORT:-8000}/api` con métricas en `http://localhost:${PORT:-8000}/metrics`.
Puedes cambiar el puerto estableciendo la variable de entorno `PORT` antes de iniciar el servicio.

## Pruebas
```bash
python -m pytest tests/
```
