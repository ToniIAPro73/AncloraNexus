# Crear un análisis detallado de conversiones problemáticas específicas

conversiones_problematicas = {
    'Tipo_Conversion': [
        'LaTeX a EPUB (reflowable)',
        'PDF escaneado OCR tablas complejas',
        'Documentos CAD a PDF vectorial',
        'Fórmulas matemáticas complejas',
        'Manuscritos técnicos OCR',
        'PDF con gráficos vectoriales a Word',
        'Documentos multicolumna científicos',
        'Presentaciones con multimedia',
        'Formularios interactivos PDF',
        'Escritura no latina (árabe, chino)'
    ],
    'Nivel_Complejidad': [9.0, 8.0, 9.5, 8.5, 7.5, 7.0, 8.0, 6.5, 5.5, 6.0],
    'Principales_Problemas': [
        'Pérdida de formato matemático, referencias cruzadas rotas',
        'Reconocimiento erróneo de bordes de tabla, celdas fusionadas',
        'Vectores convertidos a bitmap, pérdida de escalabilidad',
        'Símbolos matemáticos no reconocidos, estructuras complejas',
        'Calidad de imagen baja, terminología técnica no estándar',
        'Gráficos embebidos, pérdida de layers y transparencias',
        'Detección incorrecta de columnas, flujo de texto roto',
        'Elementos interactivos perdidos, sincronización temporal',
        'Campos dinámicos a estáticos, validaciones perdidas',
        'Direccionalidad del texto, ligaduras específicas del idioma'
    ],
    'Mejores_Herramientas': [
        'Pandoc + tex4ht, Calibre (manual)',
        'ABBYY FineReader, Adobe Acrobat Pro',
        'AutoCAD nativo, Adobe Illustrator',
        'Pandoc, MathType, tex4ht',
        'ABBYY FineReader, EasyOCR + preprocesado',
        'Adobe Acrobat Pro, Illustrator + InDesign',
        'ABBYY FineReader, Adobe Acrobat Pro',
        'Adobe Creative Suite, conversión manual',
        'Adobe Acrobat Pro, PDFelement',
        'Google Cloud Vision API, ABBYY FineReader'
    ],
    'Tiempo_Estimado': [
        '2-4 horas por documento',
        '1-2 horas por página',
        '30 min - 2 horas',
        '1-3 horas por documento',
        '2-5 horas por página',
        '1-2 horas por documento',
        '1-3 horas por documento',
        '3-6 horas por presentación',
        '30 min - 1 hora',
        '1-2 horas por documento'
    ],
    'Tasa_Exito': ['60-80%', '70-90%', '90-95%', '70-85%', '50-80%', '75-90%', '80-95%', '40-70%', '95-98%', '85-95%']
}

df_problemas = pd.DataFrame(conversiones_problematicas)

print("ANÁLISIS DETALLADO DE CONVERSIONES PROBLEMÁTICAS")
print("=" * 80)
print()

for idx, row in df_problemas.iterrows():
    print(f"{idx+1}. {row['Tipo_Conversion']}")
    print(f"   Complejidad: {row['Nivel_Complejidad']}/10")
    print(f"   Problemas principales: {row['Principales_Problemas']}")
    print(f"   Mejores herramientas: {row['Mejores_Herramientas']}")
    print(f"   Tiempo estimado: {row['Tiempo_Estimado']}")
    print(f"   Tasa de éxito: {row['Tasa_Exito']}")
    print("-" * 80)

# Guardar como CSV
df_problemas.to_csv('conversiones_problematicas_detalle.csv', index=False, encoding='utf-8')
print(f"\nArchivo CSV guardado: conversiones_problematicas_detalle.csv")