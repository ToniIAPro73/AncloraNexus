@echo off
ECHO Iniciando servidor Frontend de Anclora Metaform...

REM Calculamos la ruta a la raíz del proyecto
SET "ROOT_PATH=%~dp0..\..\"

REM Inicia una nueva ventana y ejecuta los comandos desde la raíz
start "Anclora Frontend" cmd /k "cd /d %ROOT_PATH%\frontend && npm run dev"