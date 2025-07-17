# 🧪 Guía de Pruebas - Nuevos Conversores Anclora

## 📋 Resumen de Pruebas
Esta guía te ayudará a verificar que todos los nuevos conversores funcionan correctamente en tu entorno.

## 🎯 Conversores a Probar
1. **TXT → HTML** 🌐
2. **TXT → DOC** 📄
3. **TXT → MD** 📝
4. **TXT → RTF** 📋
5. **TXT → ODT** 📊

## 📝 Archivos de Prueba

### **Archivo de Prueba Básico**
Crea un archivo `prueba.txt` con este contenido:
```
TÍTULO PRINCIPAL
Este es un documento de prueba para verificar las conversiones.

Subtítulo Importante
Aquí hay un párrafo con texto normal que incluye algunas características:

Lista de elementos:
- Primer elemento de la lista
- Segundo elemento con texto más largo
- Tercer elemento final

Lista numerada:
1. Primera opción
2. Segunda opción
3. Tercera opción

Texto con formato especial:
→ Texto indentado como cita
→ Otra línea de cita

Características técnicas:
• Soporte para Unicode: áéíóú ñ ¿¡
• Caracteres especiales: @#$%&*()
• Números y fechas: 2025-01-15, 123.456

CONCLUSIÓN
Este archivo debe convertirse correctamente a todos los formatos.
```

### **Archivo de Prueba Avanzado**
Crea un archivo `prueba_avanzada.txt`:
```
DOCUMENTO TÉCNICO AVANZADO

INTRODUCCIÓN
Este documento contiene elementos complejos para probar la robustez de los conversores.

SECCIÓN 1: LISTAS COMPLEJAS

Lista mixta:
- Elemento con sub-elementos:
  → Sub-elemento 1
  → Sub-elemento 2
- Elemento normal
- Elemento con números: 123, 456, 789

SECCIÓN 2: CÓDIGO Y DATOS

Ejemplo de código:
    function convertir(texto) {
        return texto.toUpperCase();
    }

Datos estructurados:
Nombre: Juan Pérez
Edad: 30
Email: juan@ejemplo.com
Fecha: 2025-07-15

SECCIÓN 3: CARACTERES ESPECIALES

Símbolos: ©®™€$£¥
Matemáticos: ±×÷≤≥≠∞
Flechas: ←→↑↓⇐⇒⇑⇓
Emojis: 🚀🎯✅❌⚠️💡

CONCLUSIÓN FINAL
Todos los elementos deben preservarse en la conversión.
```

## 🔍 Procedimiento de Pruebas

### **1. Prueba Básica de Funcionamiento**

#### **Paso 1:** Cargar archivo
1. Abre tu aplicación Anclora
2. Ve al Conversor Universal
3. Selecciona el archivo `prueba.txt`
4. Verifica que aparece el análisis IA

#### **Paso 2:** Probar cada formato
Para cada formato (HTML, DOC, MD, RTF, ODT):
1. Selecciona el formato de destino
2. Verifica que aparece el costo en créditos
3. Haz clic en "Iniciar Conversión"
4. Confirma que se descarga el archivo
5. Abre el archivo en el software apropiado

### **2. Verificación de Calidad**

#### **HTML (prueba.html)**
- ✅ Abre correctamente en navegador
- ✅ Títulos aparecen como `<h1>`, `<h2>`
- ✅ Listas aparecen como `<ul>` y `<ol>`
- ✅ Texto indentado aparece como `<blockquote>`
- ✅ Estilos CSS aplicados correctamente

#### **DOC (prueba.docx)**
- ✅ Abre en Microsoft Word/LibreOffice
- ✅ Títulos tienen formato de encabezado
- ✅ Listas con viñetas y numeración
- ✅ Metadatos del documento presentes
- ✅ Formato profesional aplicado

#### **MD (prueba.md)**
- ✅ Abre en editor Markdown
- ✅ Títulos con `#` y `##`
- ✅ Listas con `-` y `1.`
- ✅ Código con indentación
- ✅ Sintaxis Markdown válida

#### **RTF (prueba.rtf)**
- ✅ Abre en Word/WordPad/LibreOffice
- ✅ Títulos en negrita
- ✅ Listas con viñetas
- ✅ Formato RTF estándar
- ✅ Compatibilidad universal

#### **ODT (prueba.odt)**
- ✅ Abre en LibreOffice Writer
- ✅ Estructura de documento correcta
- ✅ Estilos aplicados
- ✅ Metadatos presentes
- ✅ Formato OpenDocument válido

### **3. Pruebas de Casos Extremos**

#### **Archivo Vacío**
1. Crea archivo `vacio.txt` sin contenido
2. Intenta convertir a cada formato
3. Verifica manejo de errores apropiado

#### **Archivo Muy Grande**
1. Crea archivo `grande.txt` con 10,000+ líneas
2. Prueba conversión a cada formato
3. Verifica rendimiento y resultado

#### **Caracteres Especiales**
1. Crea archivo con emojis, acentos, símbolos
2. Verifica que se preservan en todos los formatos

## 📊 Lista de Verificación

### **Funcionalidad Básica**
- [ ] TXT → HTML funciona
- [ ] TXT → DOC funciona  
- [ ] TXT → MD funciona
- [ ] TXT → RTF funciona
- [ ] TXT → ODT funciona

### **Calidad de Conversión**
- [ ] Títulos detectados correctamente
- [ ] Listas formateadas apropiadamente
- [ ] Caracteres especiales preservados
- [ ] Estructura del documento mantenida
- [ ] Metadatos incluidos

### **Interfaz de Usuario**
- [ ] Nuevos formatos aparecen en selector
- [ ] Costos de créditos mostrados
- [ ] Análisis IA funciona
- [ ] Descarga de archivos funciona
- [ ] Mensajes de error apropiados

### **Compatibilidad**
- [ ] HTML abre en navegadores
- [ ] DOC abre en Microsoft Word
- [ ] MD abre en editores Markdown
- [ ] RTF abre en procesadores de texto
- [ ] ODT abre en LibreOffice

## 🚨 Problemas Comunes y Soluciones

### **"Error al descargar archivo"**
- Verifica que el navegador permite descargas
- Comprueba que no hay bloqueadores de pop-ups

### **"Archivo no se abre correctamente"**
- Confirma que tienes el software apropiado instalado
- Verifica que el archivo se descargó completamente

### **"Conversión falla silenciosamente"**
- Abre la consola del navegador (F12)
- Busca errores de JavaScript
- Verifica que las dependencias están instaladas

### **"Formato no aparece en selector"**
- Confirma que el archivo es .txt
- Verifica que el UniversalConverter está actualizado
- Revisa que los imports son correctos

## 📈 Métricas de Éxito

### **Criterios de Aprobación**
- ✅ 100% de conversores funcionan
- ✅ Archivos generados son válidos
- ✅ Interfaz responde correctamente
- ✅ No hay errores en consola
- ✅ Rendimiento es aceptable (<3 segundos)

### **Benchmarks Esperados**
- **HTML:** ~2-5KB por archivo típico
- **DOC:** ~8-15KB por archivo típico
- **MD:** ~0.5-2KB por archivo típico
- **RTF:** ~1-3KB por archivo típico
- **ODT:** ~5-10KB por archivo típico

## 🎉 Confirmación Final

Una vez completadas todas las pruebas:
1. ✅ Todos los conversores funcionan
2. ✅ Calidad de conversión es buena
3. ✅ Interfaz es estable
4. ✅ No hay errores críticos

**¡Tu instalación está completa y funcionando!** 🚀

Para reportar problemas o sugerir mejoras, documenta:
- Archivo de prueba usado
- Formato de destino
- Error específico observado
- Navegador y versión
- Pasos para reproducir

