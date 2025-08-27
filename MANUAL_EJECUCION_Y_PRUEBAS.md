# 📖 Manual de Ejecución y Pruebas - Anclora Nexus

## 🎯 ¿Qué es este manual?

Este manual te enseñará paso a paso cómo ejecutar y probar la aplicación **Anclora Nexus**, una plataforma integral de transformación de contenido que incluye:

### 🔄 **Núcleo de Conversión**: 
Conversor de archivos que puede transformar documentos de un formato a otro (por ejemplo, de Word a PDF, de texto a PDF, etc.).

### 📚 **Anclora Press** (Módulo Opcional):
Herramienta avanzada para la creación y publicación de libros digitales, que permite importar documentos, editarlos para crear libros tanto digitales como físicos, y publicarlos en múltiples formatos.

La aplicación tiene dos partes:
- **Backend** (servidor): La parte que hace las conversiones
- **Frontend** (interfaz): La página web donde los usuarios suben archivos

## 🛠️ Requisitos Previos

Antes de empezar, necesitas tener instalado en tu computadora:

### ✅ Software Necesario
1. **Python 3.12** o superior
2. **Node.js 18** o superior  
3. **Visual Studio Code** (VS Code)
4. **Git** (para descargar el código)

### 🔍 Verificar si ya tienes todo instalado

Abre la **Terminal** (PowerShell en Windows) y ejecuta estos comandos uno por uno:

```powershell
# Verificar Python
python --version

# Verificar Node.js
node --version

# Verificar Git
git --version
```

Si alguno no está instalado, descárgalo desde:
- Python: https://www.python.org/downloads/
- Node.js: https://nodejs.org/
- Git: https://git-scm.com/downloads

---

## 📂 Paso 1: Preparar el Proyecto

### 1.1 Abrir VS Code
1. Abre **Visual Studio Code**
2. Ve a `Archivo` → `Abrir Carpeta`
3. Navega hasta: `C:\Users\Usuario\Workspace\01_Proyectos\Anclora_Nexus`
4. Haz clic en **Seleccionar carpeta**

### 1.2 Abrir la Terminal en VS Code
1. En VS Code, presiona `Ctrl + Shift + ñ` (o ve a `Terminal` → `Nuevo Terminal`)
2. Se abrirá una terminal en la parte inferior de VS Code

---

## 🐍 Paso 2: Preparar el Backend (Servidor)

### 2.1 Navegar al directorio del backend
En la terminal de VS Code, escribe:

```powershell
cd backend
```

### 2.2 Verificar que existe el entorno virtual
Escribe este comando para ver si ya tienes el entorno virtual:

```powershell
Test-Path .venv
```

**Si aparece `True`**: ✅ Ya tienes el entorno virtual, continúa al paso 2.3
**Si aparece `False`**: ❌ Necesitas crear el entorno virtual:

```powershell
python -m venv .venv
```

### 2.3 Activar el entorno virtual
```powershell
.\.venv\Scripts\Activate.ps1
```

**Importante**: Verás que aparece `(.venv)` al principio de la línea en la terminal. Esto significa que el entorno virtual está activo.

### 2.4 Instalar las dependencias del backend
```powershell
pip install -r requirements.txt
```

Este comando instalará todas las librerías que necesita el backend para funcionar.

### 2.5 Verificar las variables de entorno
```powershell
Get-Content .env
```

Debes ver algo como:
```
SECRET_KEY=tu_clave_secreta_aqui
JWT_SECRET_KEY=tu_clave_jwt_aqui
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

## 🌐 Paso 3: Preparar el Frontend (Interfaz Web)

### 3.1 Abrir una nueva terminal
1. En VS Code, haz clic en el `+` al lado de la terminal actual
2. Se abrirá una nueva terminal

### 3.2 Navegar al directorio del frontend
```powershell
cd frontend
```

### 3.3 Instalar las dependencias del frontend
```powershell
npm install
```

Este comando descargará todas las librerías que necesita la interfaz web.

---

## 🚀 Paso 4: Ejecutar la Aplicación

### 4.1 Ejecutar el Backend

**En la primera terminal** (la que está en la carpeta `backend`):

```powershell
# Asegúrate de estar en el directorio backend
cd C:\Users\Usuario\Workspace\01_Proyectos\Anclora_Nexus\backend

# Activar entorno virtual si no está activo
.\.venv\Scripts\Activate.ps1

# Ejecutar el servidor
python src\main.py
```

**¿Qué verás?**
```
Iniciando Anclora Nexus API...
API disponible en: http://localhost:8000/api
Información del API: http://localhost:8000/api/info
Verificación de salud: http://localhost:8000/api/health
==================================================
 * Serving Flask app 'main'
 * Debug mode: on
```

✅ **¡Perfecto!** El backend está funcionando cuando veas estos mensajes.

### 4.2 Ejecutar el Frontend

**En la segunda terminal** (la que está en la carpeta `frontend`):

```powershell
# Asegúrate de estar en el directorio frontend
cd C:\Users\Usuario\Workspace\01_Proyectos\Anclora_Nexus\frontend

# Ejecutar la interfaz web
npm run dev
```

**¿Qué verás?**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

✅ **¡Perfecto!** El frontend está funcionando cuando veas estos mensajes.

---

## 🧪 Paso 5: Verificar que Todo Funciona

### 5.1 Probar el Backend

**En una tercera terminal nueva**:

```powershell
# Probar el endpoint de salud
curl "http://localhost:8000/api/health"
```

**Respuesta esperada**:
```json
{
  "message": "API funcionando correctamente",
  "service": "Anclora Nexus API", 
  "status": "healthy",
  "version": "1.0.0"
}
```

### 5.2 Probar el Frontend

1. Abre tu navegador web (Chrome, Firefox, Edge, etc.)
2. Ve a: `http://localhost:5173`
3. Deberías ver la página principal de Anclora Nexus

---

## 🎮 Paso 6: Realizar Pruebas de Conversión

### 6.1 Prueba desde el Navegador (Más Fácil)

1. Ve a `http://localhost:5173` en tu navegador
2. Busca el área para subir archivos
3. Selecciona un archivo de texto (.txt) desde tu computadora
4. Elige "PDF" como formato de salida
5. Haz clic en "Convertir"
6. El archivo PDF se descargará automáticamente

### 6.2 Prueba desde la Terminal (Más Técnica)

Para probar una conversión desde la terminal:

```powershell
# Crear un archivo de prueba
"Hola mundo. Esta es una prueba de conversión." | Out-File -FilePath "prueba.txt" -Encoding utf8

# Probar conversión TXT a PDF
curl -X POST "http://localhost:8000/api/convert" `
  -H "Content-Type: application/json" `
  -d '{"input_format": "txt", "output_format": "pdf", "content": "Texto de prueba para conversión a PDF"}'
```

---

## 🔧 Paso 7: Tipos de Conversiones Disponibles

La aplicación puede convertir entre estos formatos:

### 📄 Formatos de Entrada Soportados:
- **TXT**: Archivos de texto plano
- **MD**: Archivos Markdown
- **DOCX**: Documentos de Microsoft Word
- **HTML**: Páginas web
- **CSV**: Hojas de cálculo
- **JSON**: Datos estructurados

### 📄 Formatos de Salida Soportados:
- **PDF**: Documentos portátiles
- **DOCX**: Documentos de Word
- **HTML**: Páginas web
- **TXT**: Texto plano
- **MD**: Markdown

### 🧪 Ejemplos de Pruebas que Puedes Hacer:

1. **TXT → PDF**: Convierte un archivo de texto a PDF
2. **DOCX → PDF**: Convierte un documento Word a PDF
3. **MD → HTML**: Convierte Markdown a página web
4. **CSV → PDF**: Convierte una tabla a PDF
5. **HTML → PDF**: Convierte una página web a PDF

---

## ❌ Resolución de Problemas Comunes

### Problema: "No se puede encontrar Python"
**Solución**:
```powershell
# Verificar instalación
python --version
# Si no funciona, reinstalar Python desde python.org
```

### Problema: "No se puede activar entorno virtual"
**Solución**:
```powershell
# Habilitar scripts en PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problema: "Puerto ya está en uso"
**Solución**:
```powershell
# Verificar qué proceso usa el puerto 8000
netstat -ano | findstr :8000
# Matar el proceso si es necesario
taskkill /PID [número_de_proceso] /F
```

### Problema: "Error al instalar dependencias"
**Solución**:
```powershell
# Actualizar pip
python -m pip install --upgrade pip
# Reinstalar dependencias
pip install -r requirements.txt --force-reinstall
```

### Problema: "La página web no carga"
**Solución**:
1. Verificar que el frontend esté ejecutándose (`npm run dev`)
2. Verificar que no hay errores en la terminal del frontend
3. Probar abrir en modo incógnito del navegador
4. Limpiar caché del navegador

---

## 🎯 Paso 8: Cómo Detener la Aplicación

### Para Detener el Backend:
1. En la terminal donde ejecutas `python src\main.py`
2. Presiona `Ctrl + C`

### Para Detener el Frontend:
1. En la terminal donde ejecutas `npm run dev`  
2. Presiona `Ctrl + C`

### Para Desactivar el Entorno Virtual:
```powershell
deactivate
```

---

## 📊 Paso 9: Monitoreo y Logs

### Ver Logs del Backend:
Los mensajes aparecen directamente en la terminal donde ejecutas el backend.

### Ver Logs del Frontend:
Los mensajes aparecen en la terminal donde ejecutas `npm run dev`.

### Verificar Estado de los Servicios:
```powershell
# Backend
curl "http://localhost:8000/api/health"

# Frontend (en navegador)
# http://localhost:5173
```

---

## 🆘 ¿Necesitas Ayuda?

### Archivos de Configuración Importantes:
- `backend/.env`: Variables de entorno
- `backend/requirements.txt`: Dependencias de Python
- `frontend/package.json`: Dependencias de Node.js
- `backend/src/config.py`: Configuración del servidor

### Comandos de Diagnóstico:
```powershell
# Verificar versiones
python --version
node --version
npm --version

# Verificar procesos
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# Verificar entorno virtual
where python
pip list
```

---

## ✅ Lista de Verificación Final

Antes de usar la aplicación, verifica que:

- [ ] Python 3.12+ está instalado
- [ ] Node.js 18+ está instalado  
- [ ] VS Code está abierto con el proyecto
- [ ] Entorno virtual está activo (ves `(.venv)` en la terminal)
- [ ] Backend ejecutándose en puerto 8000
- [ ] Frontend ejecutándose en puerto 5173
- [ ] Ambos servicios responden correctamente
- [ ] Puedes acceder a http://localhost:5173 en el navegador

**¡Listo! Ya puedes usar Anclora Nexus para convertir archivos. 🎉**

---

**Fecha de creación**: 27 de Agosto, 2025  
**Versión del manual**: 2.0 - Anclora Nexus
**Compatibilidad**: Windows PowerShell + VS Code
