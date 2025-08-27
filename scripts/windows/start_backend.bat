@echo off
ECHO Iniciando servidor Backend de Anclora Nexus...

REM %~dp0 se expande a la ruta de la carpeta 'scripts/windows/'
REM ..\.. sube dos niveles para llegar a la raíz del proyecto
SET "ROOT_PATH=%~dp0..\..\"

REM Inicia una nueva ventana y ejecuta los comandos desde la raíz
start "Anclora Backend" cmd /k "cd /d %ROOT_PATH% && call backend\venv\Scripts\activate.bat && python -m backend.src.main"