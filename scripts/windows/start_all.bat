@echo off
ECHO Iniciando todos los servicios de Anclora Metaform...

REM Llama a los otros scripts usando su ruta completa
call "%~dp0start_backend.bat"
call "%~dp0start_frontend.bat"

ECHO.
ECHO Los servidores del Backend y Frontend se estan iniciando en sus propias ventanas.