@echo off
ECHO Forzando el cierre de los servidores de Anclora Metaform...

REM Busca el proceso que usa el puerto 3000 (Frontend) y lo detiene
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    ECHO Deteniendo proceso con PID %%a en el puerto 3000...
    taskkill /PID %%a /F
)

REM Busca el proceso que usa el puerto 8000 (Backend) y lo detiene
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    ECHO Deteniendo proceso con PID %%a en el puerto 8000...
    taskkill /PID %%a /F
)

ECHO.
ECHO Proceso de cierre finalizado.
pause