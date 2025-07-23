# Archivos de Prueba - Categoría Documentos

## 1. Documentos Válidos

### test-document.txt
```
DOCUMENTO DE PRUEBA - ANCLORA METAFORM
======================================

Este es un documento de texto plano utilizado para pruebas de conversión.

Características del documento:
- Codificación UTF-8
- Múltiples párrafos
- Caracteres especiales: áéíóú ñ € ® ™
- Saltos de línea

Tabla de ejemplo:
ID    Nombre         Valor
001   Prueba A       100.50
002   Prueba B       250.75
003   Prueba C       500.00

Fórmula matemática: E = mc²

Fecha de creación: 2024-01-15
Versión: 1.0
```

### test-document.rtf
```
{\rtf1\ansi\deff0 {\fonttbl{\f0 Times New Roman;}}
{\colortbl;\red0\green0\blue0;\red255\green0\blue0;}
\f0\fs24 DOCUMENTO RTF DE PRUEBA\par
\par
Este es un documento RTF con formato b\'e1sico.\par
\par
{\b Texto en negrita}\par
{\i Texto en cursiva}\par
{\ul Texto subrayado}\par
\par
{\cf2 Texto en color rojo}\par
\par
Lista de elementos:\par
\bullet\tab Elemento 1\par
\bullet\tab Elemento 2\par
\bullet\tab Elemento 3\par
\par
Fin del documento.\par
}
```

### test-document.html
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Documento HTML de Prueba - Anclora Metaform</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Documento de Prueba HTML</h1>
    <p>Este documento contiene <strong>elementos HTML</strong> para validar conversiones.</p>
    
    <h2>Lista de Características</h2>
    <ul>
        <li>Formato HTML5 válido</li>
        <li>Estilos CSS embebidos</li>
        <li>Caracteres especiales: á é í ó ú ñ</li>
        <li>Tablas con datos</li>
    </ul>
    
    <h2>Tabla de Datos</h2>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Descripción</th>
                <th>Valor</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>001</td>
                <td>Conversión PDF</td>
                <td>98.5%</td>
            </tr>
            <tr>
                <td>002</td>
                <td>Conversión Word</td>
                <td>99.2%</td>
            </tr>
            <tr>
                <td>003</td>
                <td>Conversión Excel</td>
                <td>97.8%</td>
            </tr>
        </tbody>
    </table>
    
    <p>© 2024 Anclora Metaform - Documento de Prueba</p>
</body>
</html>
```

### test-document.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<documento>
    <metadata>
        <titulo>Documento XML de Prueba</titulo>
        <autor>Sistema de Pruebas Anclora</autor>
        <fecha>2024-01-15</fecha>
        <version>1.0</version>
    </metadata>
    
    <contenido>
        <seccion id="1">
            <titulo>Introducción</titulo>
            <parrafo>Este es un documento XML estructurado para pruebas de conversión.</parrafo>
            <parrafo>Contiene elementos anidados y atributos.</parrafo>
        </seccion>
        
        <seccion id="2">
            <titulo>Datos de Prueba</titulo>
            <tabla>
                <fila>
                    <celda tipo="encabezado">Campo</celda>
                    <celda tipo="encabezado">Valor</celda>
                </fila>
                <fila>
                    <celda>Nombre</celda>
                    <celda>Prueba XML</celda>
                </fila>
                <fila>
                    <celda>Estado</celda>
                    <celda>Activo</celda>
                </fila>
                <fila>
                    <celda>Prioridad</celda>
                    <celda>Alta</celda>
                </fila>
            </tabla>
        </seccion>
        
        <seccion id="3">
            <titulo>Caracteres Especiales</titulo>
            <parrafo>Acentos: áéíóú ÁÉÍÓÚ ñÑ</parrafo>
            <parrafo>Símbolos: &lt; &gt; &amp; € £ ¥</parrafo>
            <parrafo>Matemáticos: ∑ ∏ √ ∞ ≠ ≤ ≥</parrafo>
        </seccion>
    </contenido>
</documento>
```

### test-document.csv
```csv
ID,Nombre,Descripción,Categoría,Precio,Stock,Fecha_Alta,Activo
001,"Producto A","Descripción del producto A, con comas","Electrónica",199.99,50,2024-01-01,TRUE
002,"Producto B","Descripción del producto B con ""comillas""","Hogar",89.50,120,2024-01-02,TRUE
003,"Producto C","Descripción con 
salto de línea","Oficina",45.00,0,2024-01-03,FALSE
004,"Producto D","Descripción con caracteres: áéíóú ñ €","Electrónica",299.99,25,2024-01-04,TRUE
005,"Producto E","Descripción normal","Hogar",15.75,200,2024-01-05,TRUE
```

### test-document.md
```markdown
# Documento Markdown de Prueba

## Introducción

Este es un documento **Markdown** creado para probar las capacidades de conversión de _Anclora Metaform_.

## Características del Formato

### Elementos de Texto

- **Negrita** y *cursiva*
- ~~Texto tachado~~
- `Código en línea`
- [Enlaces](https://example.com)

### Listas

1. Elemento numerado uno
2. Elemento numerado dos
   - Sub-elemento A
   - Sub-elemento B
3. Elemento numerado tres

### Código

```python
def conversion_test():
    """Función de prueba para conversión"""
    formatos = ['pdf', 'docx', 'html']
    for formato in formatos:
        print(f"Convirtiendo a {formato}")
    return True
```

### Tabla

| Formato | Soporte | Calidad |
|---------|---------|---------|
| PDF     | ✓       | Alta    |
| DOCX    | ✓       | Alta    |
| HTML    | ✓       | Media   |

### Cita

> La conversión de documentos es esencial en el flujo de trabajo moderno.

### Imagen de referencia

![Logo Anclora](logo-anclora.png)

---

**Nota:** Este documento incluye todos los elementos comunes de Markdown.

© 2024 Anclora Metaform
```

## 2. Documentos Corrompidos pero Subsanables

### corrupted-fixable-missing-eof.txt
```
DOCUMENTO CON FINAL INCOMPLETO

Este documento tiene contenido válido pero le falta el marcador de fin de archivo.
Los datos están presentes pero la estructura no está completamente cerrada.

Datos de prueba:
- Campo 1: Valor A
- Campo 2: Valor B
- Campo 3: Val
```
(Nota: Este archivo debe guardarse sin el salto de línea final)

### corrupted-fixable-encoding.txt
```
DOCUMENTO CON PROBLEMAS DE CODIFICACI�N

Este documento fue guardado con codificaci�n incorrecta.
Contiene caracteres que no se muestran correctamente: � � �
Pero el contenido es recuperable mediante detecci�n autom�tica.

L�neas adicionales con m�s caracteres problem�ticos.
```
(Nota: Guardar este archivo en Windows-1252 o similar)

### corrupted-fixable-html.html
```html
<!DOCTYPE html>
<html>
<head>
    <title>HTML con errores menores</title>
    <meta charset="UTF-8"
</head>
<body>
    <h1>Documento HTML con errores subsanables</h1>
    <p>Este párrafo no está cerrado correctamente
    <p>Este tampoco tiene cierre</p>
    
    <table>
        <tr>
            <td>Celda 1
            <td>Celda 2</td>
        </tr>
        <tr>
            <td>Celda 3</td>
            <td>Celda 4
    </table>
    
    <div>
        <span>Elemento no cerrado
    </div>
```
(Nota: HTML mal formado pero parseable)

## 3. Documentos Corrompidos Insubsanables

### corrupted-unfixable-binary.txt
```
[Contenido binario - representación hexadecimal]
00 00 00 00 FF FF FF FF 12 34 56 78 9A BC DE F0
XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX
%!@#$%^&*()_+ TEXTO_CORRUPTO �����������������
01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F 10
```
(Nota: Este archivo debe contener datos binarios reales mezclados con texto)

### corrupted-unfixable-truncated.csv
```
ID,Nombre,Desc
001,"Producto
002,"Pro
```
(Nota: CSV severamente truncado, imposible recuperar estructura)

### corrupted-unfixable-encrypted.txt
```
U2FsdGVkX1+iX1z5X9X2X3X4X5X6X7X8X9X0X1X2X3X4
X5X6X7X8X9X0X1X2X3X4X5X6X7X8X9X0X1X2X3X4X5X6
ENCRYPTED_CONTENT_CANNOT_BE_RECOVERED_WITHOUT_KEY
```
(Nota: Simula contenido encriptado)