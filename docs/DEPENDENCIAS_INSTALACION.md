# 📦 Dependencias e Instalación

Este documento resume las dependencias clave, pasos de instalación y ejemplos de uso para los módulos principales de **Anclora Metaform**.

## 🖥️ Frontend

### Dependencias principales
- Node.js 18+
- [open-cli](https://github.com/sindresorhus/open-cli) para abrir el navegador automáticamente
- [Vitest](https://vitest.dev/) para pruebas
- Librerías de conversión: `docx`, `jszip`

### Instalación
```bash
cd frontend
npm install
npm run dev
```

### Ejemplo de uso
Visita `http://localhost:5173`, carga un archivo de texto y selecciona el formato de salida (HTML, DOC, MD, RTF, ODT o TEX).

## 🛠️ Backend

### Dependencias principales
- Python 3.10+
- [Flask](https://flask.palletsprojects.com/) y extensiones: `Flask-CORS`, `Flask-JWT-Extended`, `Flask-SQLAlchemy`
- Librerías de documentos: `python-docx`, `fpdf2`, `pypdf`, `lxml`
- Observabilidad: `prometheus-flask-exporter`

### Instalación
```bash
cd backend
python -m pip install --upgrade pip
pip install -r requirements.txt
python src/main.py
```

### Ejemplo de uso
Envía un `POST` a `http://localhost:8000/api/conversion` con un archivo TXT y recibe el documento convertido en el formato solicitado.

