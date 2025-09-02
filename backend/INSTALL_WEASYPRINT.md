# Instalación de WeasyPrint en Windows

WeasyPrint requiere bibliotecas adicionales de GTK para funcionar en Windows.

## Opción 1: Usar GTK para Windows (Recomendado)

1. Descargar e instalar GTK3 Runtime desde:
   https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases

2. Después de la instalación, reiniciar el terminal y probar:
   ```bash
   python -c "import weasyprint; print('WeasyPrint funcionando')"
   ```

## Opción 2: Usar MSYS2 (Alternativa)

1. Instalar MSYS2 desde: https://www.msys2.org/
2. Abrir MSYS2 terminal y ejecutar:
   ```bash
   pacman -S mingw-w64-x86_64-gtk3 mingw-w64-x86_64-python-gobject
   ```
3. Agregar `C:\msys64\mingw64\bin` al PATH del sistema

## Opción 3: Deshabilitar WeasyPrint temporalmente

Si no necesitas WeasyPrint inmediatamente, puedes comentar su importación en el código y usar otras bibliotecas para PDF como:
- fpdf2 (ya instalado)
- pdfkit (ya instalado, requiere wkhtmltopdf)
- reportlab

## Verificación

Una vez instalado GTK, ejecuta:
```bash
python -c "import weasyprint; print('✅ WeasyPrint funcionando correctamente')"
```