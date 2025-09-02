# Crear una tabla completa de librerías open source para conversiones básicas de documentos

import pandas as pd

# Datos de librerías por categoría y lenguaje de programación
librerias_data = {
    'Categoria': [
        # Python - Documentos Office
        'Documentos Office', 'Documentos Office', 'Documentos Office', 'Documentos Office', 'Documentos Office',
        'Documentos Office', 'Documentos Office', 'Documentos Office', 'Documentos Office', 'Documentos Office',
        
        # Python - PDFs
        'PDFs', 'PDFs', 'PDFs', 'PDFs', 'PDFs',
        
        # Python - Imágenes
        'Imágenes', 'Imágenes', 'Imágenes',
        
        # Python - Datos estructurados
        'Datos estructurados', 'Datos estructurados', 'Datos estructurados', 'Datos estructurados',
        
        # Python - Web/HTML
        'Web/HTML', 'Web/HTML', 'Web/HTML',
        
        # JavaScript
        'JavaScript - General', 'JavaScript - General', 'JavaScript - General',
        
        # C/C++
        'C/C++ - Imágenes', 'C/C++ - Imágenes', 'C/C++ - Imágenes',
        
        # Multi-lenguaje
        'Multi-lenguaje', 'Multi-lenguaje', 'Multi-lenguaje'
    ],
    'Libreria': [
        # Python - Documentos Office
        'python-docx', 'openpyxl', 'xlsxwriter', 'pandas', 'xlrd',
        'xlwings', 'pyexcel', 'docxtpl', 'docx2pdf', 'xlslim',
        
        # Python - PDFs  
        'PyPDF2', 'PyPDF4', 'pdfplumber', 'PDFMiner', 'reportlab',
        
        # Python - Imágenes
        'Pillow (PIL)', 'OpenCV-Python', 'scikit-image',
        
        # Python - Datos estructurados
        'json', 'csv', 'xmltodict', 'PyYAML',
        
        # Python - Web/HTML
        'BeautifulSoup4', 'html2text', 'weasyprint',
        
        # JavaScript
        'pdf-lib', 'xlsx', 'html2canvas',
        
        # C/C++
        'OpenCV', 'CImg', 'ImageLib',
        
        # Multi-lenguaje
        'Pandoc', 'LibreOffice SDK', 'ImageMagick'
    ],
    'Lenguaje': [
        # Python - Documentos Office
        'Python', 'Python', 'Python', 'Python', 'Python',
        'Python', 'Python', 'Python', 'Python', 'Python',
        
        # Python - PDFs
        'Python', 'Python', 'Python', 'Python', 'Python',
        
        # Python - Imágenes
        'Python', 'Python', 'Python',
        
        # Python - Datos estructurados
        'Python', 'Python', 'Python', 'Python',
        
        # Python - Web/HTML
        'Python', 'Python', 'Python',
        
        # JavaScript
        'JavaScript', 'JavaScript', 'JavaScript',
        
        # C/C++
        'C/C++', 'C/C++', 'C/C++',
        
        # Multi-lenguaje
        'Haskell/CLI', 'Java/C++', 'C/CLI'
    ],
    'Funcionalidad_Principal': [
        # Python - Documentos Office
        'Crear/editar documentos Word (.docx)', 'Leer/escribir archivos Excel (.xlsx)', 'Crear archivos Excel con formato',
        'Análisis datos tabulares (CSV/Excel)', 'Leer archivos Excel antiguos (.xls)',
        'Automatización Excel desde Python', 'API unificada para múltiples formatos', 'Plantillas Word con variables',
        'Convertir DOCX a PDF', 'Excel como Jupyter notebook',
        
        # Python - PDFs
        'Manipular PDFs (fusionar, dividir)', 'Versión mejorada de PyPDF2', 'Extraer tablas de PDFs',
        'Extraer texto y metadatos PDF', 'Generar PDFs desde Python',
        
        # Python - Imágenes
        'Procesamiento básico de imágenes', 'Visión por computador avanzada', 'Procesamiento científico imágenes',
        
        # Python - Datos estructurados
        'Manipulación datos JSON', 'Leer/escribir archivos CSV', 'Convertir XML a diccionarios',
        'Leer/escribir archivos YAML',
        
        # Python - Web/HTML
        'Parsing HTML/XML', 'Convertir HTML a texto plano', 'HTML/CSS a PDF',
        
        # JavaScript
        'Crear/modificar PDFs browser', 'Leer/escribir archivos Excel', 'Capturar HTML como imagen',
        
        # C/C++
        'Visión computador multiplataforma', 'Procesamiento imágenes C++', 'Librería imágenes orientada objetos',
        
        # Multi-lenguaje
        'Conversor universal documentos', 'Automatización Office multiplataforma', 'Manipulación imágenes CLI'
    ],
    'Formatos_Entrada': [
        # Python - Documentos Office
        'DOCX', 'XLSX, XLSM', 'Datos Python', 'CSV, XLSX, JSON, SQL', 'XLS',
        'XLSX (Excel activo)', 'CSV, XLS, XLSX, ODS', 'DOCX', 'DOCX', 'XLSX',
        
        # Python - PDFs
        'PDF', 'PDF', 'PDF', 'PDF', 'Datos Python',
        
        # Python - Imágenes
        'JPG, PNG, GIF, BMP, TIFF', 'Múltiples formatos imagen/video', 'Múltiples formatos científicos',
        
        # Python - Datos estructurados
        'JSON string/file', 'CSV file', 'XML string/file', 'YAML string/file',
        
        # Python - Web/HTML
        'HTML, XML', 'HTML', 'HTML, CSS',
        
        # JavaScript
        'PDF, datos JS', 'CSV, JSON', 'HTML elements',
        
        # C/C++
        'Múltiples formatos imagen/video', 'Múltiples formatos imagen', 'Múltiples formatos imagen',
        
        # Multi-lenguaje
        '50+ formatos documentos', 'DOC, DOCX, XLS, XLSX, PPT', 'Múltiples formatos imagen'
    ],
    'Formatos_Salida': [
        # Python - Documentos Office
        'DOCX', 'XLSX', 'XLSX', 'CSV, XLSX, JSON, HTML', 'Datos Python',
        'Excel (via COM)', 'CSV, XLS, XLSX, ODS', 'DOCX', 'PDF', 'Excel',
        
        # Python - PDFs
        'PDF', 'PDF', 'CSV, texto', 'Texto, XML, HTML', 'PDF',
        
        # Python - Imágenes
        'JPG, PNG, GIF, BMP, TIFF', 'Múltiples formatos', 'Múltiples formatos',
        
        # Python - Datos estructurados
        'JSON', 'CSV', 'Dict Python', 'YAML',
        
        # Python - Web/HTML
        'Datos estructurados', 'Texto plano, Markdown', 'PDF',
        
        # JavaScript
        'PDF', 'XLSX', 'PNG, JPG',
        
        # C/C++
        'Múltiples formatos', 'Múltiples formatos imagen', 'Múltiples formatos imagen',
        
        # Multi-lenguaje
        '50+ formatos documentos', 'PDF, DOC, XLS, etc.', 'Múltiples formatos imagen'
    ],
    'Facilidad_Uso': [
        # Python - Documentos Office
        'Fácil', 'Fácil', 'Medio', 'Fácil', 'Fácil',
        'Medio', 'Fácil', 'Medio', 'Fácil', 'Difícil',
        
        # Python - PDFs
        'Fácil', 'Fácil', 'Medio', 'Difícil', 'Medio',
        
        # Python - Imágenes
        'Fácil', 'Difícil', 'Medio',
        
        # Python - Datos estructurados
        'Fácil', 'Fácil', 'Fácil', 'Fácil',
        
        # Python - Web/HTML
        'Fácil', 'Fácil', 'Medio',
        
        # JavaScript
        'Medio', 'Fácil', 'Fácil',
        
        # C/C++
        'Difícil', 'Difícil', 'Difícil',
        
        # Multi-lenguaje
        'Medio', 'Difícil', 'Medio'
    ],
    'Popularidad': [
        # Python - Documentos Office
        'Muy Alta', 'Muy Alta', 'Alta', 'Muy Alta', 'Alta',
        'Alta', 'Media', 'Media', 'Media', 'Baja',
        
        # Python - PDFs
        'Muy Alta', 'Alta', 'Alta', 'Alta', 'Alta',
        
        # Python - Imágenes
        'Muy Alta', 'Muy Alta', 'Alta',
        
        # Python - Datos estructurados
        'Muy Alta', 'Muy Alta', 'Alta', 'Alta',
        
        # Python - Web/HTML
        'Muy Alta', 'Alta', 'Media',
        
        # JavaScript
        'Alta', 'Alta', 'Alta',
        
        # C/C++
        'Muy Alta', 'Media', 'Baja',
        
        # Multi-lenguaje
        'Muy Alta', 'Media', 'Alta'
    ]
}

# Crear DataFrame
df_librerias = pd.DataFrame(librerias_data)

# Mostrar tabla por categorías
print("=" * 100)
print("LIBRERÍAS OPEN SOURCE PARA CONVERSIONES BÁSICAS DE DOCUMENTOS")
print("=" * 100)

categorias = df_librerias['Categoria'].unique()

for categoria in categorias:
    print(f"\n📁 {categoria.upper()}")
    print("-" * 80)
    
    df_cat = df_librerias[df_librerias['Categoria'] == categoria]
    
    for idx, row in df_cat.iterrows():
        print(f"🔧 {row['Libreria']} ({row['Lenguaje']})")
        print(f"   Función: {row['Funcionalidad_Principal']}")
        print(f"   Entrada: {row['Formatos_Entrada']}")
        print(f"   Salida: {row['Formatos_Salida']}")
        print(f"   Facilidad: {row['Facilidad_Uso']} | Popularidad: {row['Popularidad']}")
        print()

# Guardar CSV completo
df_librerias.to_csv('librerias_open_source_conversiones_basicas.csv', index=False, encoding='utf-8')

print(f"\n📊 RESUMEN ESTADÍSTICO")
print(f"Total de librerías analizadas: {len(df_librerias)}")
print(f"Categorías principales: {len(categorias)}")
print(f"Lenguajes representados: {len(df_librerias['Lenguaje'].unique())}")
print("\nArchivo CSV guardado: librerias_open_source_conversiones_basicas.csv")