"""
Sistema de Mensajes de Error Mejorados para Anclora Nexus
Proporciona mensajes claros y útiles para usuarios finales
"""
import re
from typing import Dict, Tuple, List

class ErrorMessageTranslator:
    """Traductor de errores técnicos a mensajes amigables"""
    
    def __init__(self):
        # Códigos de error únicos para soporte técnico
        self.error_codes = {
            'FILE_NOT_FOUND': 'ANX-001',
            'FILE_EMPTY': 'ANX-002', 
            'FILE_TOO_LARGE': 'ANX-003',
            'INVALID_FORMAT': 'ANX-004',
            'CORRUPTED_FILE': 'ANX-005',
            'ENCODING_ERROR': 'ANX-006',
            'CONVERSION_FAILED': 'ANX-007',
            'UNSUPPORTED_CONVERSION': 'ANX-008',
            'INSUFFICIENT_CREDITS': 'ANX-009',
            'NETWORK_ERROR': 'ANX-010',
            'PROCESSING_TIMEOUT': 'ANX-011',
            'ZIP_CORRUPTED': 'ANX-012',
            'PDF_CORRUPTED': 'ANX-013',
            'IMAGE_CORRUPTED': 'ANX-014',
            'CSV_MALFORMED': 'ANX-015',
            'JSON_INVALID': 'ANX-016'
        }
        
        # Patrones de errores técnicos y sus traducciones
        self.error_patterns = {
            r'bad magic number|BadZipFile|not a zip file': {
                'code': 'ANX-012',
                'title': 'Archivo ZIP Corrupto',
                'message': 'El archivo parece estar dañado o corrupto. Los archivos DOCX, EPUB y ODT son archivos ZIP internamente.',
                'solutions': [
                    'Intente con una copia nueva del archivo original',
                    'Verifique que el archivo se descargó completamente',
                    'Asegúrese de que la extensión del archivo sea correcta'
                ]
            },
            r'cannot identify image file|truncated|broken data stream': {
                'code': 'ANX-014',
                'title': 'Imagen Corrupta',
                'message': 'La imagen está dañada o no se puede procesar correctamente.',
                'solutions': [
                    'Verifique que la imagen se abre correctamente en otros programas',
                    'Intente guardar la imagen en un formato diferente',
                    'Asegúrese de que el archivo se subió completamente'
                ]
            },
            r'PDF.*error|invalid PDF|PDF.*corrupted': {
                'code': 'ANX-013',
                'title': 'PDF Corrupto',
                'message': 'El archivo PDF está dañado o tiene una estructura inválida.',
                'solutions': [
                    'Intente abrir el PDF en un visor de PDF para verificar que funciona',
                    'Regenere el PDF desde el documento original',
                    'Verifique que el archivo se descargó sin errores'
                ]
            },
            r'JSON.*error|invalid JSON|malformed JSON': {
                'code': 'ANX-016',
                'title': 'JSON Inválido',
                'message': 'El archivo JSON tiene errores de sintaxis o formato.',
                'solutions': [
                    'Verifique la sintaxis JSON en un validador online',
                    'Asegúrese de que todas las llaves y corchetes estén balanceados',
                    'Revise que no haya comas adicionales al final'
                ]
            },
            r'CSV.*error|delimiter.*error|malformed CSV': {
                'code': 'ANX-015',
                'title': 'CSV Mal Formado',
                'message': 'El archivo CSV tiene problemas de estructura o formato.',
                'solutions': [
                    'Verifique que todas las filas tengan el mismo número de columnas',
                    'Asegúrese de usar el delimitador correcto (coma, punto y coma, etc.)',
                    'Revise que no haya caracteres especiales sin escapar'
                ]
            },
            r'encoding.*error|unicode.*error|decode.*error': {
                'code': 'ANX-006',
                'title': 'Problema de Codificación',
                'message': 'El archivo tiene problemas de codificación de caracteres.',
                'solutions': [
                    'Guarde el archivo con codificación UTF-8',
                    'Verifique que no haya caracteres especiales corruptos',
                    'Intente abrir y guardar el archivo en un editor de texto'
                ]
            },
            r'timeout|time.*out|processing.*timeout': {
                'code': 'ANX-011',
                'title': 'Tiempo de Procesamiento Agotado',
                'message': 'La conversión está tomando demasiado tiempo.',
                'solutions': [
                    'Intente con un archivo más pequeño',
                    'Use calidad estándar en lugar de alta calidad',
                    'Divida archivos grandes en partes más pequeñas'
                ]
            },
            r'insufficient.*credits|not.*enough.*credits': {
                'code': 'ANX-009',
                'title': 'Créditos Insuficientes',
                'message': 'No tiene suficientes créditos para realizar esta conversión.',
                'solutions': [
                    'Adquiera más créditos en su panel de usuario',
                    'Use calidad estándar para reducir el costo',
                    'Considere dividir archivos grandes'
                ]
            },
            r'unsupported.*conversion|format.*not.*supported': {
                'code': 'ANX-008',
                'title': 'Conversión No Soportada',
                'message': 'Esta combinación de formatos no está disponible actualmente.',
                'solutions': [
                    'Verifique los formatos soportados en la documentación',
                    'Considere una conversión en dos pasos (ej: DOC→DOCX→PDF)',
                    'Contacte soporte para solicitar nuevos formatos'
                ]
            }
        }

    def translate_error(self, technical_error: str, source_format: str = '', target_format: str = '') -> Dict:
        """Traduce error técnico a mensaje amigable"""
        
        # Buscar patrón coincidente
        for pattern, error_info in self.error_patterns.items():
            if re.search(pattern, technical_error, re.IGNORECASE):
                return {
                    'error_code': error_info['code'],
                    'title': error_info['title'],
                    'message': error_info['message'],
                    'solutions': error_info['solutions'],
                    'technical_details': technical_error,
                    'conversion': f"{source_format.upper()} → {target_format.upper()}" if source_format and target_format else ""
                }
        
        # Error genérico si no se encuentra patrón específico
        return {
            'error_code': 'ANX-007',
            'title': 'Error de Conversión',
            'message': 'Ocurrió un problema durante la conversión del archivo.',
            'solutions': [
                'Verifique que el archivo no esté corrupto',
                'Intente con una copia nueva del archivo',
                'Contacte soporte técnico si el problema persiste'
            ],
            'technical_details': technical_error,
            'conversion': f"{source_format.upper()} → {target_format.upper()}" if source_format and target_format else ""
        }

    def get_validation_error_message(self, validation_error: str, file_extension: str) -> Dict:
        """Genera mensaje específico para errores de validación"""
        
        if "no es un ZIP válido" in validation_error:
            return {
                'error_code': 'ANX-012',
                'title': 'Archivo de Documento Inválido',
                'message': f'El archivo .{file_extension.upper()} no tiene la estructura correcta. Los archivos {file_extension.upper()} deben ser documentos válidos.',
                'solutions': [
                    f'Verifique que el archivo se abre correctamente en programas como Microsoft Word (DOCX) o LibreOffice',
                    'Intente guardar el documento nuevamente desde la aplicación original',
                    'Asegúrese de que el archivo no se renombró manualmente'
                ]
            }
        
        elif "header" in validation_error.lower():
            return {
                'error_code': 'ANX-004',
                'title': 'Formato de Archivo Incorrecto',
                'message': f'El archivo no tiene la estructura interna correcta para un archivo .{file_extension.upper()}.',
                'solutions': [
                    'Verifique que la extensión del archivo sea correcta',
                    'Intente abrir el archivo en su programa nativo para verificar que funciona',
                    'Si cambió la extensión manualmente, use la extensión original'
                ]
            }
        
        elif "vacío" in validation_error:
            return {
                'error_code': 'ANX-002',
                'title': 'Archivo Vacío',
                'message': 'El archivo no contiene datos.',
                'solutions': [
                    'Verifique que seleccionó el archivo correcto',
                    'Asegúrese de que el archivo tiene contenido',
                    'Intente con una copia diferente del archivo'
                ]
            }
        
        else:
            return self.translate_error(validation_error, file_extension, '')

    def format_error_response(self, error_dict: Dict) -> str:
        """Formatea respuesta de error para API"""
        formatted = f"[{error_dict['error_code']}] {error_dict['title']}\n\n"
        formatted += f"{error_dict['message']}\n\n"
        
        if error_dict['solutions']:
            formatted += "💡 Soluciones sugeridas:\n"
            for i, solution in enumerate(error_dict['solutions'], 1):
                formatted += f"   {i}. {solution}\n"
        
        if error_dict.get('conversion'):
            formatted += f"\n🔄 Conversión: {error_dict['conversion']}"
        
        return formatted

# Instancia global del traductor de errores
error_translator = ErrorMessageTranslator()
