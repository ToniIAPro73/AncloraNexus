from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import tempfile
import uuid

# Importar el motor de conversión existente
# (Aquí integraremos el motor que ya tienes implementado)

class ConversionEngine:
    """Motor de conversión de Anclora Metaform"""
    
    def __init__(self):
        self.name = 'Anclora Metaform Conversion Engine'
        self.version = '1.0.0'
        
        # Conversiones soportadas y sus costos en créditos
        self.supported_conversions = {
            'txt': {
                'html': 1,
                'pdf': 1,
                'doc': 2,
                'docx': 2,
                'md': 1,
                'rtf': 1,
                'odt': 2,
                'tex': 3
            },
            'pdf': {
                'jpg': 3,
                'png': 3,
                'txt': 4
            },
            'jpg': {
                'png': 1,
                'pdf': 3,
                'gif': 2
            },
            'png': {
                'jpg': 1,
                'pdf': 3,
                'gif': 2
            },
            'doc': {
                'pdf': 4,
                'txt': 3,
                'html': 4
            },
            'docx': {
                'pdf': 4,
                'txt': 3,
                'html': 4
            }
        }

    def get_supported_formats(self, source_format):
        """Obtiene los formatos de destino soportados para un formato origen"""
        return list(self.supported_conversions.get(source_format.lower(), {}).keys())

    def get_conversion_cost(self, source_format, target_format):
        """Calcula el costo en créditos de una conversión"""
        source = source_format.lower().replace('.', '')
        target = target_format.lower().replace('.', '')
        
        return self.supported_conversions.get(source, {}).get(target, 2)

    def validate_file(self, file_path, max_size_mb=100):
        """Valida un archivo antes de la conversión"""
        if not os.path.exists(file_path):
            return False, "El archivo no existe"
        
        file_size = os.path.getsize(file_path)
        if file_size == 0:
            return False, "El archivo está vacío"
        
        if file_size > max_size_mb * 1024 * 1024:
            return False, f"El archivo es demasiado grande (máximo {max_size_mb}MB)"
        
        return True, "Archivo válido"

    def analyze_file(self, file_path, filename):
        """Analiza un archivo y genera recomendaciones"""
        file_extension = filename.split('.')[-1].lower()
        file_size = os.path.getsize(file_path)
        
        analysis = {
            'filename': filename,
            'extension': file_extension,
            'size': file_size,
            'supported_formats': self.get_supported_formats(file_extension),
            'recommendations': []
        }
        
        # Generar recomendaciones basadas en el tipo de archivo
        if file_extension == 'txt':
            analysis['recommendations'] = [
                'Para documentos formales, recomendamos PDF',
                'Para web, HTML es la mejor opción',
                'Para desarrolladores, Markdown es ideal'
            ]
        elif file_extension == 'pdf':
            analysis['recommendations'] = [
                'Para edición, convierte a DOC',
                'Para imágenes, JPG o PNG son ideales'
            ]
        elif file_extension in ['jpg', 'png']:
            analysis['recommendations'] = [
                'Para documentos, PDF mantiene la calidad',
                'Para web, considera optimización de tamaño'
            ]
        
        return analysis

    def convert_file(self, input_path, output_path, source_format, target_format):
        """Realiza la conversión de archivo"""
        try:
            # Aquí integraremos los conversores específicos que ya tienes
            if source_format == 'txt' and target_format == 'html':
                return self._convert_txt_to_html(input_path, output_path)
            elif source_format == 'txt' and target_format == 'md':
                return self._convert_txt_to_markdown(input_path, output_path)
            elif source_format == 'txt' and target_format == 'rtf':
                return self._convert_txt_to_rtf(input_path, output_path)
            # Añadir más conversores aquí...
            else:
                return False, f"Conversión {source_format} → {target_format} no implementada aún"
                
        except Exception as e:
            return False, f"Error durante la conversión: {str(e)}"

    def _convert_txt_to_html(self, input_path, output_path):
        """Convierte TXT a HTML"""
        try:
            with open(input_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Escapar caracteres HTML
            content = content.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            
            # Convertir saltos de línea
            content = content.replace('\n\n', '</p><p>').replace('\n', '<br>')
            content = f'<p>{content}</p>'
            
            # Generar HTML completo
            html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documento Convertido - Anclora Metaform</title>
    <meta name="generator" content="Anclora Metaform">
    <style>
        body {{ 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }}
        .header {{
            text-align: center;
            border-bottom: 2px solid #1e40af;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }}
        .content {{
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
        }}
        .footer {{
            text-align: center;
            margin-top: 20px;
            font-size: 0.9em;
            color: #666;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Anclora Metaform</h1>
        <p>Tu Contenido, Reinventado</p>
    </div>
    <div class="content">
        {content}
    </div>
    <div class="footer">
        <p>Convertido con Anclora Metaform - {datetime.now().strftime('%d/%m/%Y')}</p>
    </div>
</body>
</html>"""
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            return True, "Conversión exitosa"
            
        except Exception as e:
            return False, f"Error en conversión TXT→HTML: {str(e)}"

    def _convert_txt_to_markdown(self, input_path, output_path):
        """Convierte TXT a Markdown"""
        try:
            with open(input_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Conversión básica a Markdown
            markdown_content = f"""# Documento Convertido

*Convertido con Anclora Metaform - {datetime.now().strftime('%d/%m/%Y')}*

---

{content}

---

**Generado por:** [Anclora Metaform](https://anclora-metaform.com)  
**Tu Contenido, Reinventado**
"""
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(markdown_content)
            
            return True, "Conversión exitosa"
            
        except Exception as e:
            return False, f"Error en conversión TXT→MD: {str(e)}"

    def _convert_txt_to_rtf(self, input_path, output_path):
        """Convierte TXT a RTF"""
        try:
            with open(input_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Generar RTF básico
            content_rtf = content.replace('\n', '\\par ')
            date_str = datetime.now().strftime('%d/%m/%Y')
            rtf_content = f"""{{\\rtf1\\ansi\\deff0 {{\\fonttbl {{\\f0 Times New Roman;}}}}
\\f0\\fs24 
\\b Documento Convertido - Anclora Metaform\\b0\\par
\\par
{content_rtf}
\\par
\\par
\\i Convertido con Anclora Metaform - {date_str}\\i0
}}"""
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(rtf_content)
            
            return True, "Conversión exitosa"
            
        except Exception as e:
            return False, f"Error en conversión TXT→RTF: {str(e)}"


# Instancia global del motor de conversión
conversion_engine = ConversionEngine()

