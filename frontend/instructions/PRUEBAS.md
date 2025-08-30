# ðŸ§ª GuÃ­a de Pruebas - Nuevos Conversores Anclora

## ðŸ“‹ Resumen de Pruebas
Esta guÃ­a te ayudarÃ¡ a verificar que todos los nuevos conversores funcionan correctamente en tu entorno.

## ðŸŽ¯ Conversores a Probar
1. **TXT â†’ HTML** ðŸŒ
2. **TXT â†’ DOC** ðŸ“„
3. **TXT â†’ MD** ðŸ“
4. **TXT â†’ RTF** ðŸ“‹
5. **TXT â†’ ODT** ðŸ“Š

## ðŸ“ Archivos de Prueba

### **Archivo de Prueba BÃ¡sico**
Crea un archivo `prueba.txt` con este contenido:
```
TÃTULO PRINCIPAL
Este es un documento de prueba para verificar las conversiones.

SubtÃ­tulo Importante
AquÃ­ hay un pÃ¡rrafo con texto normal que incluye algunas caracterÃ­sticas:

Lista de elementos:
- Primer elemento de la lista
- Segundo elemento con texto mÃ¡s largo
- Tercer elemento final

Lista numerada:
1. Primera opciÃ³n
2. Segunda opciÃ³n
3. Tercera opciÃ³n

Texto con formato especial:
â†’ Texto indentado como cita
â†’ Otra lÃ­nea de cita

CaracterÃ­sticas tÃ©cnicas:
â€¢ Soporte para Unicode: Ã¡Ã©Ã­Ã³Ãº Ã± Â¿Â¡
â€¢ Caracteres especiales: @#$%&*()
â€¢ NÃºmeros y fechas: 2025-01-15, 123.456

CONCLUSIÃ“N
Este archivo debe convertirse correctamente a todos los formatos.
```

### **Archivo de Prueba Avanzado**
Crea un archivo `prueba_avanzada.txt`:
```
DOCUMENTO TÃ‰CNICO AVANZADO

INTRODUCCIÃ“N
Este documento contiene elementos complejos para probar la robustez de los conversores.

SECCIÃ“N 1: LISTAS COMPLEJAS

Lista mixta:
- Elemento con sub-elementos:
  â†’ Sub-elemento 1
  â†’ Sub-elemento 2
- Elemento normal
- Elemento con nÃºmeros: 123, 456, 789

SECCIÃ“N 2: CÃ“DIGO Y DATOS

Ejemplo de cÃ³digo:
    function convertir(texto) {
        return texto.toUpperCase();
    }

Datos estructurados:
Nombre: Juan PÃ©rez
Edad: 30
Email: juan@ejemplo.com
Fecha: 2025-07-15

SECCIÃ“N 3: CARACTERES ESPECIALES

SÃ­mbolos: Â©Â®â„¢â‚¬$Â£Â¥
MatemÃ¡ticos: Â±Ã—Ã·â‰¤â‰¥â‰ âˆž
Flechas: â†â†’â†‘â†“â‡â‡’â‡‘â‡“
Emojis: ðŸš€ðŸŽ¯âœ…âŒâš ï¸ðŸ’¡

CONCLUSIÃ“N FINAL
Todos los elementos deben preservarse en la conversiÃ³n.
```

## ðŸ” Procedimiento de Pruebas

### **1. Prueba BÃ¡sica de Funcionamiento**

#### **Paso 1:** Cargar archivo
1. Abre tu aplicaciÃ³n Anclora
2. Ve al Conversor Universal
3. Selecciona el archivo `prueba.txt`
4. Verifica que aparece el anÃ¡lisis IA

#### **Paso 2:** Probar cada formato
Para cada formato (HTML, DOC, MD, RTF, ODT):
1. Selecciona el formato de destino
2. Verifica que aparece el costo en crÃ©ditos
3. Haz clic en "Iniciar ConversiÃ³n"
4. Confirma que se descarga el archivo
5. Abre el archivo en el software apropiado

### **2. VerificaciÃ³n de Calidad**

#### **HTML (prueba.html)**
- âœ… Abre correctamente en navegador
- âœ… TÃ­tulos aparecen como `<h1>`, `<h2>`
- âœ… Listas aparecen como `<ul>` y `<ol>`
- âœ… Texto indentado aparece como `<blockquote>`
- âœ… Estilos CSS aplicados correctamente

#### **DOC (prueba.docx)**
- âœ… Abre en Microsoft Word/LibreOffice
- âœ… TÃ­tulos tienen formato de encabezado
- âœ… Listas con viÃ±etas y numeraciÃ³n
- âœ… Metadatos del documento presentes
- âœ… Formato profesional aplicado

#### **MD (prueba.md)**
- âœ… Abre en editor Markdown
- âœ… TÃ­tulos con `#` y `##`
- âœ… Listas con `-` y `1.`
- âœ… CÃ³digo con indentaciÃ³n
- âœ… Sintaxis Markdown vÃ¡lida

#### **RTF (prueba.rtf)**
- âœ… Abre en Word/WordPad/LibreOffice
- âœ… TÃ­tulos en negrita
- âœ… Listas con viÃ±etas
- âœ… Formato RTF estÃ¡ndar
- âœ… Compatibilidad universal

#### **ODT (prueba.odt)**
- âœ… Abre en LibreOffice Writer
- âœ… Estructura de documento correcta
- âœ… Estilos aplicados
- âœ… Metadatos presentes
- âœ… Formato OpenDocument vÃ¡lido

### **3. Pruebas de Casos Extremos**

#### **Archivo VacÃ­o**
1. Crea archivo `vacio.txt` sin contenido
2. Intenta convertir a cada formato
3. Verifica manejo de errores apropiado

#### **Archivo Muy Grande**
1. Crea archivo `grande.txt` con 10,000+ lÃ­neas
2. Prueba conversiÃ³n a cada formato
3. Verifica rendimiento y resultado

#### **Caracteres Especiales**
1. Crea archivo con emojis, acentos, sÃ­mbolos
2. Verifica que se preservan en todos los formatos

## ðŸ“Š Lista de VerificaciÃ³n

### **Funcionalidad BÃ¡sica**
- [ ] TXT â†’ HTML funciona
- [ ] TXT â†’ DOC funciona  
- [ ] TXT â†’ MD funciona
- [ ] TXT â†’ RTF funciona
- [ ] TXT â†’ ODT funciona

### **Calidad de ConversiÃ³n**
- [ ] TÃ­tulos detectados correctamente
- [ ] Listas formateadas apropiadamente
- [ ] Caracteres especiales preservados
- [ ] Estructura del documento mantenida
- [ ] Metadatos incluidos

### **Interfaz de Usuario**
- [ ] Nuevos formatos aparecen en selector
- [ ] Costos de crÃ©ditos mostrados
- [ ] AnÃ¡lisis IA funciona
- [ ] Descarga de archivos funciona
- [ ] Mensajes de error apropiados

### **Compatibilidad**
- [ ] HTML abre en navegadores
- [ ] DOC abre en Microsoft Word
- [ ] MD abre en editores Markdown
- [ ] RTF abre en procesadores de texto
- [ ] ODT abre en LibreOffice

## ðŸš¨ Problemas Comunes y Soluciones

### **"Error al descargar archivo"**
- Verifica que el navegador permite descargas
- Comprueba que no hay bloqueadores de pop-ups

### **"Archivo no se abre correctamente"**
- Confirma que tienes el software apropiado instalado
- Verifica que el archivo se descargÃ³ completamente

### **"ConversiÃ³n falla silenciosamente"**
- Abre la consola del navegador (F12)
- Busca errores de JavaScript
- Verifica que las dependencias estÃ¡n instaladas

### **"Formato no aparece en selector"**
- Confirma que el archivo es .txt
- Verifica que el UniversalConverter estÃ¡ actualizado
- Revisa que los imports son correctos

## ðŸ“ˆ MÃ©tricas de Ã‰xito

### **Criterios de AprobaciÃ³n**
- âœ… 100% de conversores funcionan
- âœ… Archivos generados son vÃ¡lidos
- âœ… Interfaz responde correctamente
- âœ… No hay errores en consola
- âœ… Rendimiento es aceptable (<3 segundos)

### **Benchmarks Esperados**
- **HTML:** ~2-5KB por archivo tÃ­pico
- **DOC:** ~8-15KB por archivo tÃ­pico
- **MD:** ~0.5-2KB por archivo tÃ­pico
- **RTF:** ~1-3KB por archivo tÃ­pico
- **ODT:** ~5-10KB por archivo tÃ­pico

## ðŸŽ‰ ConfirmaciÃ³n Final

Una vez completadas todas las pruebas:
1. âœ… Todos los conversores funcionan
2. âœ… Calidad de conversiÃ³n es buena
3. âœ… Interfaz es estable
4. âœ… No hay errores crÃ­ticos

**Â¡Tu instalaciÃ³n estÃ¡ completa y funcionando!** ðŸš€

Para reportar problemas o sugerir mejoras, documenta:
- Archivo de prueba usado
- Formato de destino
- Error especÃ­fico observado
- Navegador y versiÃ³n
- Pasos para reproducir


