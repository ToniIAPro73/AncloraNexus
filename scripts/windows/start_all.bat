@echo off
ECHO Iniciando todos los servicios de Anclora Metaform...

REM Llama a los otros dos scripts usando la ruta del script actual
call "%~dp0start_backend.bat"
call "%~dp0start_frontend.bat"

ECHO.
ECHO Los servidores del Backend y Frontend se estan iniciando en sus propias ventanas.