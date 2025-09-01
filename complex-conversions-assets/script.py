import pandas as pd

# Crear una tabla con las principales herramientas para conversiones complejas
herramientas_data = {
    'Herramienta': [
        'Adobe Acrobat Pro DC',
        'ABBYY FineReader PDF',
        'Pandoc',
        'Tesseract OCR',
        'Foxit PhantomPDF',
        'PDFelement',
        'tex4ht',
        'Calibre',
        'EasyOCR',
        'AutoCAD',
        'ONLYOFFICE',
        'LibreOffice Draw'
    ],
    'Tipo': [
        'Comercial',
        'Comercial',
        'Open Source',
        'Open Source',
        'Comercial',
        'Comercial',
        'Open Source',
        'Open Source',
        'Open Source',
        'Comercial',
        'Open Source',
        'Open Source'
    ],
    'OCR_Avanzado': [
        'Excelente',
        'Excelente',
        'No',
        'Bueno',
        'Bueno',
        'Bueno',
        'No',
        'No',
        'Excelente',
        'No',
        'Plugin',
        'No'
    ],
    'Formulas_Matematicas': [
        'Limitado',
        'Limitado',
        'Excelente',
        'Limitado',
        'Limitado',
        'Limitado',
        'Excelente',
        'Bueno',
        'No',
        'No',
        'Limitado',
        'Bueno'
    ],
    'CAD_Vectorial': [
        'Bueno',
        'Limitado',
        'No',
        'No',
        'Limitado',
        'Limitado',
        'No',
        'No',
        'No',
        'Excelente',
        'No',
        'Bueno'
    ],
    'Tablas_Complejas': [
        'Excelente',
        'Excelente',
        'Bueno',
        'Limitado',
        'Bueno',
        'Bueno',
        'Limitado',
        'Limitado',
        'Bueno',
        'No',
        'Bueno',
        'Bueno'
    ],
    'Multiidioma': [
        'Excelente',
        'Excelente',
        'Excelente',
        'Excelente',
        'Bueno',
        'Bueno',
        'Bueno',
        'Bueno',
        'Excelente',
        'Limitado',
        'Bueno',
        'Excelente'
    ],
    'Precio_Aprox': [
        '$179/año',
        '$199/año',
        'Gratis',
        'Gratis',
        '$149 único',
        '$79/año',
        'Gratis',
        'Gratis',
        'Gratis',
        '$1,700/año',
        'Gratis',
        'Gratis'
    ]
}

df_herramientas = pd.DataFrame(herramientas_data)
print("Tabla de Herramientas para Conversiones Complejas:")
print("=" * 60)
print(df_herramientas.to_string(index=False))

# Guardar como CSV
df_herramientas.to_csv('herramientas_conversiones_complejas.csv', index=False, encoding='utf-8')

print("\n\nArchivo CSV guardado: herramientas_conversiones_complejas.csv")