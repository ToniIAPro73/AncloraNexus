# Archivos de Prueba - Categoría Imágenes

## 1. Imágenes Válidas

### test-image.svg
```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <title>Imagen SVG de Prueba - Anclora Metaform</title>
  <desc>Imagen vectorial para pruebas de conversión</desc>
  
  <!-- Fondo -->
  <rect width="400" height="300" fill="#f0f0f0"/>
  
  <!-- Logo simulado -->
  <g id="logo">
    <circle cx="200" cy="100" r="50" fill="#2196F3"/>
    <rect x="170" y="75" width="60" height="50" fill="white" opacity="0.9"/>
    <text x="200" y="110" text-anchor="middle" font-family="Arial" font-size="24" fill="#2196F3">AM</text>
  </g>
  
  <!-- Texto -->
  <text x="200" y="180" text-anchor="middle" font-family="Arial" font-size="18" fill="#333">
    Anclora Metaform
  </text>
  <text x="200" y="210" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">
    Test Image - Vector Format
  </text>
  
  <!-- Elementos de prueba -->
  <path d="M 50 250 Q 100 200 150 250 T 250 250" stroke="#4CAF50" stroke-width="3" fill="none"/>
  <polygon points="300,250 320,220 340,230 360,250" fill="#FF5722" opacity="0.7"/>
  
  <!-- Gradiente -->
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF6347;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="50" y="270" width="300" height="20" fill="url(#grad1)"/>
</svg>
```

### test-image.bmp (Representación de estructura)
```
BM              // Firma BMP
[File Size]     // Tamaño del archivo
[Reserved]      // Reservado
[Data Offset]   // Offset a los datos de píxeles
[Header Size]   // Tamaño del encabezado
400             // Ancho
300             // Alto
1               // Planos
24              // Bits por píxel
0               // Compresión (sin comprimir)
[Image Size]    // Tamaño de la imagen
2835            // Resolución horizontal (72 DPI)
2835            // Resolución vertical (72 DPI)
0               // Colores usados
0               // Colores importantes

// Datos de píxeles (RGB, de abajo hacia arriba)
// Imagen de prueba con patrón de colores
```

### test-image-metadata.jpg (Estructura con metadatos EXIF)
```
FFD8FFE0        // Marcador SOI y APP0
[JFIF Header]   // Encabezado JFIF
FFE1            // Marcador APP1 (EXIF)
[EXIF Length]   // Longitud de datos EXIF

// Metadatos EXIF
Make: Anclora Test Camera
Model: Metaform Pro
DateTime: 2024:01:15 10:30:45
ImageWidth: 800
ImageHeight: 600
XResolution: 300
YResolution: 300
Software: Anclora Metaform v1.0
Copyright: © 2024 Anclora Test Suite
GPS Latitude: 40.4168° N
GPS Longitude: 3.7038° W
UserComment: Imagen de prueba con metadatos completos

// Datos de imagen JPEG comprimidos
```

### test-image.webp (Descripción de contenido)
```
RIFF header
WEBP chunk
VP8L (lossless) data:
- Width: 600px
- Height: 400px
- Alpha channel: Yes
- Animation: No
- Color profile: sRGB

Contenido visual:
- Logo de prueba en el centro
- Gradiente de fondo
- Texto: "WebP Test Image"
- Transparencia en las esquinas
```

### test-image.tiff (Estructura multi-página)
```
// TIFF Header
4949 (II - Little Endian)
002A (TIFF version 42)
[IFD Offset]

// Primera página (IFD0)
ImageWidth: 1200
ImageLength: 800
BitsPerSample: 8,8,8
Compression: LZW
PhotometricInterpretation: RGB
SamplesPerPixel: 3
XResolution: 300
YResolution: 300
Software: Anclora Metaform
DateTime: 2024:01:15 12:00:00

// Segunda página (IFD1)
ImageWidth: 1200
ImageLength: 800
BitsPerSample: 8
Compression: PackBits
PhotometricInterpretation: Grayscale

// Tercera página (IFD2)
ImageWidth: 1200
ImageLength: 800
Compression: JPEG
PhotometricInterpretation: YCbCr
```

### test-image-animated.gif (Estructura GIF animado)
```
GIF89a          // Versión
400 300         // Dimensiones
F7              // Flags (tabla de colores global, 256 colores)
00              // Color de fondo
00              // Aspect ratio

// Tabla de colores global (256 colores)
[768 bytes de paleta de colores]

// Extension de aplicación (NETSCAPE2.0 para loop)
21 FF 0B 4E 45 54 53 43 41 50 45 32 2E 30 03 01 00 00 00

// Frame 1
21 F9 04 08 0A 00 00 00    // Control gráfico (delay 100ms)
2C 00 00 00 00 90 01 2C 01 00  // Descriptor de imagen
[Datos LZW comprimidos - Logo apareciendo]

// Frame 2
21 F9 04 08 0A 00 00 00    // Control gráfico (delay 100ms)
2C 00 00 00 00 90 01 2C 01 00  // Descriptor de imagen
[Datos LZW comprimidos - Logo rotando]

// Frame 3
21 F9 04 08 0A 00 00 00    // Control gráfico (delay 100ms)
2C 00 00 00 00 90 01 2C 01 00  // Descriptor de imagen
[Datos LZW comprimidos - Logo con texto]

3B              // Terminador GIF
```

### test-image.ico (Estructura ICO multi-resolución)
```
// ICONDIR Header
0000 (Reserved)
0100 (Type: 1 = Icon)
0400 (Count: 4 images)

// ICONDIRENTRY 1 (16x16)
10 10           // Width, Height
00              // Color palette
00              // Reserved
01 00           // Color planes
20 00           // Bits per pixel (32)
[Size]          // Tamaño de imagen
[Offset]        // Offset a datos

// ICONDIRENTRY 2 (32x32)
20 20           // Width, Height
00 00 01 00 20 00
[Size] [Offset]

// ICONDIRENTRY 3 (48x48)
30 30           // Width, Height
00 00 01 00 20 00
[Size] [Offset]

// ICONDIRENTRY 4 (256x256)
00 00           // 0 = 256
00 00 01 00 20 00
[Size] [Offset]

// Datos de imagen PNG para cada resolución
```

## 2. Imágenes Corrompidas pero Subsanables

### corrupted-fixable-truncated.jpg
```
FFD8FFE0        // SOI y APP0 correctos
[JFIF Header]   // Encabezado JFIF válido
[Segmentos válidos de imagen]
[Datos parciales]
// Falta marcador EOI (FFD9)
// La imagen está truncada al 90% pero es recuperable
```

### corrupted-fixable-bad-header.png
```
89 50 4E 47 0D 0A 1A 0A    // Firma PNG correcta
00 00 00 0D                 // Longitud IHDR
49 48 44 52                 // Tipo IHDR
[Width/Height con valores corruptos pero recuperables]
08 06 00 00 00              // Bit depth, color type válidos
[CRC incorrecto]
[Chunks IDAT válidos]
[IEND correcto]
```

### corrupted-fixable-color-space.tiff
```
// TIFF con espacio de color mal definido
4D4D 002A       // Big Endian, versión TIFF
[IFD con PhotometricInterpretation incorrecto]
// Los datos de píxeles están bien pero la interpretación es errónea
// Se puede corregir analizando los datos reales
```

## 3. Imágenes Corrompidas Insubsanables

### corrupted-unfixable-encrypted.jpg
```
// Archivo JPEG encriptado con AES-256
ENCRYPTED_HEADER_BLOCK
[Datos binarios aleatorios sin estructura JPEG]
NO_JPEG_MARKERS_PRESENT
CANNOT_RECOVER_WITHOUT_KEY
```

### corrupted-unfixable-severe-corruption.png
```
89 50 4E 47 0D 0A 1A 0A    // Firma PNG
XX XX XX XX                 // IHDR corrupto
XX XX XX XX XX XX XX XX     // Datos aleatorios
// Sin chunks válidos
// Sin estructura PNG recuperable
```

### corrupted-unfixable-mixed-format.gif
```
GIF89a          // Comienza como GIF
[Algunos datos GIF]
FFD8FFE0        // De repente cambia a JPEG
[Mezcla de datos JPEG]
89504E47        // Luego cambia a PNG
[Datos corruptos mezclados]
// Formato completamente inconsistente
```

## 4. Imágenes Especiales para Pruebas

### test-image-cmyk.jpg
```
// JPEG con espacio de color CMYK para pruebas de conversión de color
FFD8FFE0
[JFIF Header]
FFE2            // APP2 con perfil ICC
[ICC Profile: CMYK]
// Datos de imagen en CMYK para probar conversiones a RGB
```

### test-image-16bit.png
```
// PNG con profundidad de 16 bits por canal
89 50 4E 47 0D 0A 1A 0A
[IHDR: 16 bits per channel]
// Para probar conversiones de profundidad de bits
```

### test-image-layers.psd (Descripción)
```
Archivo PSD de Adobe Photoshop con:
- 3 capas (fondo, logo, texto)
- Máscaras de capa
- Efectos de capa
- Modo de color: RGB
- 1920x1080 píxeles
- Para probar conversión con aplanado de capas
```

### test-image-raw.cr2 (Descripción)
```
Archivo Canon RAW (CR2) con:
- Datos RAW del sensor 
- Metadatos EXIF completos
- Vista previa JPEG embebida
- 6000x4000 píxeles
- 14 bits por canal
- Para probar conversiones de RAW
```