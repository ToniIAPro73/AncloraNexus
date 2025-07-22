@echo off
ECHO Iniciando servidor Backend de Anclora Metaform...
ECHO (Se abrira una nueva ventana. Para detener el servidor, cierrala o presiona Ctrl+C)

REM Inicia una nueva ventana de terminal, activa el entorno virtual y ejecuta el servidor de Python
start "Anclora Backend" cmd /k "cd backend && call venv\Scripts\activate.bat && python src\main.py"