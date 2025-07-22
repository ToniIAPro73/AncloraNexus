# Archivos de Prueba - Categoría Archivos Comprimidos

## 1. Archivos Comprimidos Válidos

### test-archive.zip
```
ZIP Archive Structure:
- Version: 2.0
- Compression: Deflate
- Encryption: None

Contents:
/documents/
  ├── readme.txt (2 KB)
  ├── report.pdf (150 KB)
  └── data.xlsx (45 KB)
/images/
  ├── logo.png (25 KB)
  ├── photo1.jpg (1.2 MB)
  └── photo2.jpg (980 KB)
/config/
  └── settings.json (1 KB)

Total: 7 files, 3 directories
Compressed size: 1.8 MB
Uncompressed size: 2.4 MB
```

### test-archive.rar
```
RAR5 Archive Structure:
- Version: 5.0
- Compression: RAR5 algorithm
- Recovery record: Yes (3%)
- Solid archive: No

Contents:
/project/
  ├── src/
  │   ├── main.py (5 KB)
  │   ├── utils.py (3 KB)
  │   └── config.py (1 KB)
  ├── tests/
  │   ├── test_main.py (4 KB)
  │   └── test_utils.py (2 KB)
  ├── docs/
  │   └── manual.pdf (500 KB)
  └── requirements.txt (1 KB)

Archive comments: "Proyecto Anclora Test v1.0"
```

### test-archive.7z
```
7-Zip Archive Structure:
- Format: 7z
- Compression: LZMA2
- Compression level: 9 (Ultra)
- Dictionary size: 64 MB
- Solid: Yes
- Encryption: None

Contents:
/backup/
  ├── database/
  │   ├── users.sql (50 MB)
  │   ├── products.sql (30 MB)
  │   └── orders.sql (20 MB)
  ├── uploads/
  │   ├── [1000 archivos de imagen]
  │   └── total: 500 MB
  └── logs/
      ├── app.log (10 MB)
      └── error.log (2 MB)

Compression ratio: 15:1
```

### test-archive.tar
```
TAR Archive (no compression):
- Format: POSIX.1-2001 (pax)
- Block size: 10240 bytes

Contents:
/webapp/
  ├── index.html (5 KB)
  ├── css/
  │   ├── main.css (20 KB)
  │   └── theme.css (15 KB)
  ├── js/
  │   ├── app.js (50 KB)
  │   └── vendor.js (200 KB)
  └── assets/
      └── [various files]

File permissions preserved
Owner/Group information included
Timestamps preserved
```

### test-archive.tar.gz
```
TAR archive compressed with GZIP:
- TAR format: GNU tar
- GZIP compression level: 6
- Original name preserved

Contents: Same as test-archive.tar
Compression ratio: 3:1
```

### test-archive.tar.bz2
```
TAR archive compressed with BZIP2:
- Compression block size: 900k
- Better compression than gzip

Contents: Same as test-archive.tar
Compression ratio: 4:1
```

### test-archive.tar.xz
```
TAR archive compressed with XZ:
- LZMA2 compression
- Preset: 6
- Dictionary size: 8 MB

Contents: Same as test-archive.tar
Compression ratio: 5:1
Best compression ratio
```

### test-archive.cab
```
Microsoft Cabinet Archive:
- Version: 1.3
- Compression: MSZIP
- Split: No

Contents:
/installer/
  ├── setup.exe (2 MB)
  ├── files/
  │   ├── app.dll (5 MB)
  │   ├── resources.dll (3 MB)
  │   └── config.xml (10 KB)
  └── data/
      └── database.mdb (10 MB)

Cabinet features: File attributes preserved
```

### test-archive.iso
```
ISO 9660 Image:
- Level: 3
- Extensions: Rock Ridge, Joliet
- Volume ID: ANCLORA_TEST
- Publisher: Anclora Metaform Test Suite

Contents:
/
├── autorun.inf
├── software/
│   ├── installer.exe (50 MB)
│   └── readme.txt (5 KB)
├── documentation/
│   ├── manual.pdf (10 MB)
│   └── quickstart.pdf (2 MB)
└── media/
    ├── videos/
    │   └── demo.mp4 (100 MB)
    └── images/
        └── [screenshots]

Total size: 200 MB
```

### test-archive-encrypted.zip
```
ZIP with AES-256 encryption:
- Encryption: AES-256
- Password protected
- Compression: Deflate

Contents:
/confidential/
  ├── contracts/
  │   ├── contract_001.pdf
  │   └── contract_002.pdf
  ├── financial/
  │   ├── report_2024.xlsx
  │   └── budget_2025.xlsx
  └── keys/
      └── api_keys.txt

Note: Password is "test123" for testing
```

### test-archive-split.zip
```
Split ZIP Archive:
- Part 1: test-archive-split.z01 (50 MB)
- Part 2: test-archive-split.z02 (50 MB)
- Part 3: test-archive-split.z03 (50 MB)
- Part 4: test-archive-split.zip (30 MB)

Total: 180 MB across 4 parts
Contains large video files
```

### test-archive-solid.rar
```
Solid RAR Archive:
- Solid compression enabled
- Dictionary: 4096 KB
- Recovery record: 5%

Contents:
/source_code/
  ├── [500 archivos .py]
  ├── [300 archivos .js]
  └── [200 archivos .css]

Solid compression mejora ratio en archivos similares
Compression ratio: 10:1
```

## 2. Archivos Comprimidos Corrompidos pero Subsanables

### corrupted-fixable-crc.zip
```
ZIP con errores CRC en algunos archivos:
- Estructura del archivo central: OK
- Algunos archivos con CRC incorrecto
- Se puede extraer con opción de ignorar CRC
- ~90% de archivos recuperables
```

### corrupted-fixable-incomplete.rar
```
RAR incompleto pero con recovery record:
- Archivo truncado al 95%
- Recovery record presente (3%)
- Se puede recuperar mayoría del contenido
- Algunos archivos al final perdidos
```

### corrupted-fixable-header.7z
```
7Z con header ligeramente corrupto:
- Signature válida
- Algunos bytes del header dañados
- Streams de datos intactos
- Recuperable con reparación de header
```

### corrupted-fixable-index.tar.gz
```
TAR.GZ con índice dañado:
- Compresión GZIP: OK
- TAR header de algunos archivos corrupto
- Datos de archivos presentes
- Se puede reconstruir parcialmente
```

## 3. Archivos Comprimidos Corrompidos Insubsanables

### corrupted-unfixable-encrypted-lost-key.zip
```
ZIP encriptado sin posibilidad de recuperación:
- Encriptación: AES-256
- Password desconocido
- Sin vulnerabilidades conocidas
- Fuerza bruta impráctica
```

### corrupted-unfixable-severe.rar
```
RAR con corrupción severa:
- Header principal destruido
- Sin recovery record
- Datos sobrescritos con basura
- Estructura irrecuperable
```

### corrupted-unfixable-truncated.7z
```
7Z severamente truncado:
- Solo 10% del archivo presente
- Sin header completo
- Streams de datos incompletos
- Imposible reconstruir
```

## 4. Archivos Especiales para Pruebas

### test-archive-unicode.zip
```
ZIP con nombres de archivo Unicode:
/international/
  ├── español/
  │   └── archivo_con_ñ.txt
  ├── 中文/
  │   └── 文档.pdf
  ├── العربية/
  │   └── ملف.docx
  └── emoji/
      └── 📁📄🎉.txt

Para probar manejo de caracteres internacionales
```

### test-archive-nested.zip
```
ZIP con archivos anidados:
archive.zip
  └── level1.zip
      └── level2.zip
          └── level3.zip
              └── final.txt

Para probar extracción recursiva
```

### test-archive-links.tar.gz
```
TAR con enlaces simbólicos y duros:
/system/
  ├── files/
  │   ├── original.conf
  │   └── data.txt
  ├── links/
  │   ├── symlink -> ../files/original.conf
  │   └── hardlink (→ data.txt)
  └── broken/
      └── broken_link -> /non/existent/path

Para probar manejo de enlaces
```

### test-archive-permissions.tar
```
TAR con permisos especiales Unix:
/secure/
  ├── executable (755)
  ├── readonly (444)
  ├── setuid (4755)
  ├── setgid (2755)
  └── sticky (1777)

Owner: user1 (1000)
Group: group1 (1000)
```

### test-archive-sparse.tar
```
TAR con archivos sparse:
/sparse/
  └── largefile.img (10GB lógico, 100MB real)
      - Archivo con grandes secciones de ceros
      - Formato sparse para eficiencia

Para probar manejo de archivos sparse
```

### test-archive-multi-volume.rar
```
RAR multi-volumen con recovery:
- anclora.part1.rar (100 MB)
- anclora.part2.rar (100 MB)
- anclora.part3.rar (100 MB)
- anclora.part4.rar (100 MB)
- anclora.part5.rar (50 MB)

Recovery volumes:
- anclora.rev (10% recovery data)

Puede recuperarse con 1 volumen perdido
```

### test-archive-sfx.exe
```
Archivo autoextraíble (SFX):
- Base: 7-Zip SFX
- Tamaño stub: 200 KB
- Archivo comprimido: 50 MB
- Configuración SFX:
  - Título: "Anclora Test Installer"
  - Extracción a: %TEMP%\anclora
  - Ejecutar después: setup.exe
  - Modo silencioso disponible

Para probar conversión de SFX
```