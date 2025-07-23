@echo off
ECHO Iniciando servidor Frontend de Anclora Metaform...
ECHO (Se abrira una nueva ventana. Para detener el servidor, cierrala o presiona Ctrl+C)

REM Inicia una nueva ventana de terminal, navega a la carpeta del frontend y ejecuta el servidor de desarrollo
start "Anclora Frontend" cmd /k "cd frontend && npm run dev"