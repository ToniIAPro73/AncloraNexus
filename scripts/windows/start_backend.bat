@echo off
ECHO Iniciando servidor Backend de Anclora Metaform...
ECHO (Se abrira una nueva ventana. Para detener el servidor, cierrala o presiona Ctrl+C)

REM Inicia la app como un módulo desde la raíz del proyecto
start "Anclora Backend" cmd /k "cd backend && call venv\Scripts\activate.bat && python -m src.main"