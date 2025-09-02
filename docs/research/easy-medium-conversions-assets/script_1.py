# Crear tabla con casos de uso específicos y mejores prácticas

casos_uso_data = {
    'Caso_Uso': [
        'Word a PDF básico',
        'Excel a CSV masivo',
        'PDF a Excel (tablas)',
        'Imágenes a diferentes formatos',
        'HTML a PDF con estilos',
        'JSON a Excel reportes',
        'CSV a gráficos/dashboards',
        'Web scraping a documentos',
        'Automatización reportes Office',
        'Documentos con plantillas dinámicas',
        'Extracción texto de PDFs',
        'Manipulación imágenes batch',
        'Conversión formatos legacy',
        'APIs REST a documentos',
        'Análisis datos no estructurados'
    ],
    'Libreria_Recomendada': [
        'python-docx + docx2pdf',
        'pandas',
        'pdfplumber + pandas',
        'Pillow',
        'weasyprint',
        'pandas + openpyxl',
        'matplotlib + pandas',
        'BeautifulSoup4 + requests',
        'python-docx + xlsxwriter',
        'docxtpl + Jinja2',
        'PyPDF2 + PDFMiner',
        'Pillow + os',
        'Pandoc CLI',
        'requests + pandas',
        'pandas + nltk'
    ],
    'Alternativa_Open_Source': [
        'LibreOffice SDK',
        'openpyxl',
        'tabula-py',
        'ImageMagick CLI',
        'Pandoc',
        'pyexcel',
        'plotly + dash',
        'scrapy',
        'LibreOffice UNO API',
        'python-docx + jinja2',
        'pdfplumber',
        'OpenCV-Python',
        'LibreOffice CLI',
        'httpx + json',
        'spaCy + pandas'
    ],
    'Dificultad_Implementacion': [
        'Fácil',
        'Fácil',
        'Medio',
        'Fácil',
        'Medio',
        'Fácil',
        'Medio',
        'Medio',
        'Medio',
        'Medio',
        'Difícil',
        'Fácil',
        'Fácil',
        'Fácil',
        'Difícil'
    ],
    'Rendimiento': [
        'Alto',
        'Muy Alto',
        'Medio',
        'Alto',
        'Medio',
        'Alto',
        'Alto',
        'Medio',
        'Medio',
        'Alto',
        'Bajo',
        'Alto',
        'Alto',
        'Alto',
        'Medio'
    ],
    'Ventajas_Principales': [
        'Mantiene formato original, rápido',
        'Optimizado para big data, memoria eficiente',
        'Preserva estructura tabular compleja',
        'Múltiples formatos, optimizaciones automáticas',
        'CSS completo, layouts complejos',
        'Pivot tables, formatos automáticos',
        'Visualizaciones interactivas, web-ready',
        'Anti-blocking, parseo robusto',
        'Templates reutilizables, branded docs',
        'Variables dinámicas, logic templates',
        'Acceso raw a contenido PDF',
        'Operaciones paralelas, filtros avanzados',
        'Máxima compatibilidad formatos',
        'Pipelines automatizados, escalables',
        'NLP avanzado, machine learning ready'
    ],
    'Limitaciones': [
        'Solo DOCX moderno, no DOC antiguo',
        'Memoria intensivo con datasets grandes',
        'OCR limitado, tablas complejas fallan',
        'No vectoriales avanzados, no AI upscaling',
        'Rendering lento, JavaScript limitado',
        'Sin formatos complejos Excel avanzados',
        'Curva aprendizaje, dependencias pesadas',
        'Rate limiting, legal issues',
        'Dependencias COM en Windows',
        'Lógica template limitada vs full programming',
        'Textos con layout complejo problemáticos',
        'No inteligencia contextual automática',
        'CLI dependency, no programmatic control',
        'Rate limits APIs, authentication complexity',
        'Modelos pre-entrenados, domain adaptation'
    ]
}

df_casos = pd.DataFrame(casos_uso_data)

print("=" * 120)
print("CASOS DE USO ESPECÍFICOS Y MEJORES PRÁCTICAS - LIBRERÍAS OPEN SOURCE")
print("=" * 120)

for idx, row in df_casos.iterrows():
    print(f"\n🎯 {row['Caso_Uso'].upper()}")
    print(f"   📦 Librería principal: {row['Libreria_Recomendada']}")
    print(f"   🔄 Alternativa: {row['Alternativa_Open_Source']}")
    print(f"   ⚡ Dificultad: {row['Dificultad_Implementacion']} | Rendimiento: {row['Rendimiento']}")
    print(f"   ✅ Ventajas: {row['Ventajas_Principales']}")
    print(f"   ⚠️  Limitaciones: {row['Limitaciones']}")

# Estadísticas
print(f"\n📊 ANÁLISIS DE CASOS DE USO")
print(f"Total casos analizados: {len(df_casos)}")
print(f"\nDistribución por dificultad:")
dificultad_counts = df_casos['Dificultad_Implementacion'].value_counts()
for dif, count in dificultad_counts.items():
    print(f"  {dif}: {count} casos ({count/len(df_casos)*100:.1f}%)")

print(f"\nDistribución por rendimiento:")
rendimiento_counts = df_casos['Rendimiento'].value_counts()
for rend, count in rendimiento_counts.items():
    print(f"  {rend}: {count} casos ({count/len(df_casos)*100:.1f}%)")

# Guardar CSV
df_casos.to_csv('casos_uso_librerias_open_source.csv', index=False, encoding='utf-8')
print(f"\nArchivo CSV guardado: casos_uso_librerias_open_source.csv")