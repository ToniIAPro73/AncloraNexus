# Crear guía de instalación y primeros pasos para las librerías más importantes

instalacion_data = {
    'Libreria': [
        'python-docx',
        'openpyxl', 
        'pandas',
        'PyPDF2',
        'Pillow',
        'BeautifulSoup4',
        'xlsxwriter',
        'pdfplumber',
        'weasyprint',
        'docx2pdf'
    ],
    'Comando_Instalacion': [
        'pip install python-docx',
        'pip install openpyxl',
        'pip install pandas',
        'pip install PyPDF2',
        'pip install Pillow',
        'pip install beautifulsoup4',
        'pip install XlsxWriter',
        'pip install pdfplumber',
        'pip install weasyprint',
        'pip install docx2pdf'
    ],
    'Dependencias_Sistema': [
        'Ninguna',
        'Ninguna',
        'Ninguna (opcional: xlrd para XLS)',
        'Ninguna',
        'Ninguna (opcional: external libs para formatos especiales)',
        'Ninguna (recomendado: lxml, html5lib)',
        'Ninguna',
        'Ninguna',
        'Pango, GDK-PixBuf (Linux), Cairo',
        'Microsoft Word (Windows) o LibreOffice'
    ],
    'Ejemplo_Basico': [
        '''from docx import Document
doc = Document()
doc.add_heading('Mi Documento', 0)
doc.add_paragraph('Texto de ejemplo')
doc.save('documento.docx')''',
        
        '''from openpyxl import Workbook
wb = Workbook()
ws = wb.active
ws['A1'] = 'Hola'
ws['B1'] = 'Mundo'
wb.save('archivo.xlsx')''',
        
        '''import pandas as pd
df = pd.read_csv('datos.csv')
df_filtrado = df[df['columna'] > 100]
df_filtrado.to_excel('resultado.xlsx')''',
        
        '''import PyPDF2
with open('archivo.pdf', 'rb') as file:
    reader = PyPDF2.PdfReader(file)
    text = reader.pages[0].extract_text()
    print(text)''',
        
        '''from PIL import Image
img = Image.open('imagen.jpg')
img_resized = img.resize((300, 300))
img_resized.save('imagen_small.jpg')''',
        
        '''from bs4 import BeautifulSoup
import requests
response = requests.get('https://ejemplo.com')
soup = BeautifulSoup(response.content, 'html.parser')
titles = soup.find_all('h1')''',
        
        '''import xlsxwriter
workbook = xlsxwriter.Workbook('ejemplo.xlsx')
worksheet = workbook.add_worksheet()
worksheet.write('A1', 'Hola Excel')
workbook.close()''',
        
        '''import pdfplumber
with pdfplumber.open('archivo.pdf') as pdf:
    page = pdf.pages[0]
    text = page.extract_text()
    tables = page.extract_tables()''',
        
        '''import weasyprint
html = '<h1>Título</h1><p>Contenido</p>'
weasyprint.HTML(string=html).write_pdf('output.pdf')''',
        
        '''from docx2pdf import convert
convert("input.docx", "output.pdf")
# O para múltiples archivos:
convert("carpeta_docx/")'''
    ],
    'Casos_Uso_Principal': [
        'Crear informes, facturas, cartas automáticas',
        'Reportes de datos, dashboards Excel',
        'Análisis de datos, ETL, reporting',
        'Manipular PDFs existentes, extraer contenido',
        'Redimensionar imágenes, cambiar formatos',
        'Web scraping, parsing HTML/XML',
        'Generar archivos Excel con formato',
        'Extraer tablas estructuradas de PDFs',
        'HTML/CSS complejos a PDF de calidad',
        'Conversión masiva Word a PDF'
    ],
    'Dificultad_Inicial': [
        'Muy Fácil',
        'Muy Fácil', 
        'Fácil',
        'Fácil',
        'Muy Fácil',
        'Fácil',
        'Fácil',
        'Medio',
        'Medio',
        'Muy Fácil'
    ]
}

df_install = pd.DataFrame(instalacion_data)

print("=" * 120)
print("GUÍA DE INSTALACIÓN Y PRIMEROS PASOS - TOP 10 LIBRERÍAS OPEN SOURCE")
print("=" * 120)

for idx, row in df_install.iterrows():
    print(f"\n{'='*80}")
    print(f"📦 {row['Libreria'].upper()}")
    print(f"{'='*80}")
    print(f"🔧 Instalación: {row['Comando_Instalacion']}")
    print(f"⚙️  Dependencias: {row['Dependencias_Sistema']}")
    print(f"🎯 Caso de uso: {row['Casos_Uso_Principal']}")
    print(f"📚 Dificultad: {row['Dificultad_Inicial']}")
    print(f"\n💻 EJEMPLO BÁSICO:")
    print(f"{row['Ejemplo_Basico']}")
    print()

# Crear resumen final
print("=" * 120)
print("📋 RESUMEN EJECUTIVO")
print("=" * 120)

print(f"""
🚀 RECOMENDACIONES POR CASO DE USO:

📄 Para documentos de oficina básicos:
   • python-docx (Word) + openpyxl (Excel) - Dupla perfecta
   • Instalación: pip install python-docx openpyxl

📊 Para análisis de datos y reportes:
   • pandas - La herramienta más potente y versátil
   • Instalación: pip install pandas openpyxl xlsxwriter

🖼️ Para procesamiento de imágenes:
   • Pillow - Estándar de facto para Python
   • Instalación: pip install Pillow

📑 Para trabajar con PDFs:
   • PyPDF2 (manipulación) + pdfplumber (extracción)
   • Instalación: pip install PyPDF2 pdfplumber

🌐 Para contenido web:
   • BeautifulSoup4 + requests - Combinación clásica
   • Instalación: pip install beautifulsoup4 requests

⚡ INSTALACIÓN COMPLETA RECOMENDADA:
pip install python-docx openpyxl pandas PyPDF2 Pillow beautifulsoup4 pdfplumber xlsxwriter requests

🎓 CURVA DE APRENDIZAJE:
• Muy Fácil (1-2 horas): python-docx, openpyxl, Pillow, docx2pdf
• Fácil (1-2 días): pandas, PyPDF2, BeautifulSoup4, xlsxwriter  
• Medio (1 semana): pdfplumber, weasyprint

💡 CONSEJOS PRÁCTICOS:
• Siempre instalar en entornos virtuales (venv)
• Usar requirements.txt para proyectos
• Consultar documentación oficial para funciones avanzadas
• Probar con archivos pequeños antes de procesar lotes grandes
""")

print("Análisis completado. ✅")