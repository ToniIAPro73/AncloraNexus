@echo off
ECHO Iniciando todos los servicios de Anclora Metaform...

REM Llama a los otros dos scripts para iniciar cada servicio en su propia ventana
call start_backend.bat
call start_frontend.bat

ECHO.
ECHO Los servidores del Backend y Frontend se estan iniciando en sus propias ventanas.