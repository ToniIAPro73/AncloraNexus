"""
Analizador IA de Archivos para Anclora Nexus
Utiliza IA para analizar contenido y sugerir mejores formatos de destino
"""

import os
import logging
import mimetypes
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from pathlib import Path
import json
import hashlib

# Importar librerías de análisis
try:
    from PIL import Image, ExifTags
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False

try:
    from bs4 import BeautifulSoup
    BS4_AVAILABLE = True
except ImportError:
    BS4_AVAILABLE = False

# Importar IA opcional (Gemini)
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

@dataclass
class FileAnalysis:
    """Resultado del análisis de un archivo"""
    file_path: str
    file_type: str
    file_size: int
    content_type: str
    complexity_score: float  # 0-1, donde 1 es más complejo
    quality_indicators: Dict[str, Any]
    recommended_formats: List[Dict[str, Any]]
    ai_insights: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any] = None

class AIFileAnalyzer:
    """Analizador inteligente de archivos con IA"""
    
    def __init__(self):
        self.format_priorities = {
            # Prioridades por tipo de contenido
            'document': ['pdf', 'docx', 'html', 'md', 'txt'],
            'spreadsheet': ['xlsx', 'csv', 'html', 'pdf'],
            'image': ['png', 'jpg', 'webp', 'pdf', 'svg'],
            'data': ['json', 'csv', 'xlsx', 'html', 'xml'],
            'web': ['html', 'pdf', 'png', 'md'],
            'presentation': ['pdf', 'html', 'png', 'pptx'],
            'vector': ['svg', 'pdf', 'png', 'eps'],
            'archive': ['zip', 'pdf', 'html']
        }
        
        self.quality_thresholds = {
            'image_resolution': {'low': 72, 'medium': 150, 'high': 300},
            'document_pages': {'short': 5, 'medium': 20, 'long': 50},
            'data_rows': {'small': 100, 'medium': 1000, 'large': 10000},
            'file_size_mb': {'small': 1, 'medium': 10, 'large': 100}
        }
        
        # Configurar Gemini si está disponible
        if GEMINI_AVAILABLE:
            self._setup_gemini()
        
        logging.info("AIFileAnalyzer inicializado")
    
    def _setup_gemini(self):
        """Configurar Gemini AI si está disponible"""
        try:
            # Intentar configurar con variable de entorno
            api_key = os.environ.get('GEMINI_API_KEY')
            if api_key:
                genai.configure(api_key=api_key)
                self.gemini_model = genai.GenerativeModel('gemini-pro')
                logging.info("Gemini AI configurado exitosamente")
            else:
                logging.warning("GEMINI_API_KEY no encontrada, análisis IA limitado")
                self.gemini_model = None
        except Exception as e:
            logging.warning(f"Error configurando Gemini: {e}")
            self.gemini_model = None
    
    def analyze_file(self, file_path: str, target_format: str = None) -> FileAnalysis:
        """
        Analizar un archivo y generar recomendaciones inteligentes
        
        Args:
            file_path: Ruta del archivo a analizar
            target_format: Formato de destino deseado (opcional)
            
        Returns:
            FileAnalysis con recomendaciones y análisis
        """
        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Archivo no encontrado: {file_path}")
            
            # Información básica del archivo
            file_size = os.path.getsize(file_path)
            file_extension = Path(file_path).suffix.lower().lstrip('.')
            mime_type, _ = mimetypes.guess_type(file_path)
            
            # Determinar tipo de contenido
            content_type = self._determine_content_type(file_extension, mime_type)
            
            # Análisis específico por tipo
            quality_indicators = self._analyze_by_type(file_path, file_extension, content_type)
            
            # Calcular puntuación de complejidad
            complexity_score = self._calculate_complexity(file_path, file_extension, quality_indicators)
            
            # Generar recomendaciones de formato
            recommended_formats = self._generate_format_recommendations(
                content_type, quality_indicators, complexity_score, target_format
            )
            
            # Análisis IA opcional
            ai_insights = None
            if self.gemini_model and file_size < 10 * 1024 * 1024:  # Máximo 10MB para IA
                ai_insights = self._analyze_with_ai(file_path, file_extension, content_type)
            
            # Metadatos adicionales
            metadata = self._extract_metadata(file_path, file_extension)
            
            return FileAnalysis(
                file_path=file_path,
                file_type=file_extension,
                file_size=file_size,
                content_type=content_type,
                complexity_score=complexity_score,
                quality_indicators=quality_indicators,
                recommended_formats=recommended_formats,
                ai_insights=ai_insights,
                metadata=metadata
            )
            
        except Exception as e:
            logging.error(f"Error analizando archivo {file_path}: {e}")
            # Retornar análisis básico en caso de error
            return self._create_basic_analysis(file_path, str(e))
    
    def _determine_content_type(self, file_extension: str, mime_type: str) -> str:
        """Determinar el tipo de contenido del archivo"""
        # Mapeo de extensiones a tipos de contenido
        extension_mapping = {
            # Documentos
            'pdf': 'document', 'docx': 'document', 'doc': 'document',
            'txt': 'document', 'rtf': 'document', 'odt': 'document',
            'md': 'document', 'tex': 'document',
            
            # Hojas de cálculo
            'xlsx': 'spreadsheet', 'xls': 'spreadsheet', 'csv': 'spreadsheet',
            'ods': 'spreadsheet',
            
            # Imágenes
            'png': 'image', 'jpg': 'image', 'jpeg': 'image', 'gif': 'image',
            'webp': 'image', 'tiff': 'image', 'bmp': 'image',
            
            # Vectores
            'svg': 'vector', 'eps': 'vector', 'ai': 'vector',
            
            # Web
            'html': 'web', 'htm': 'web', 'xml': 'web', 'xhtml': 'web',
            
            # Datos
            'json': 'data', 'xml': 'data', 'yaml': 'data', 'yml': 'data',
            
            # Presentaciones
            'pptx': 'presentation', 'ppt': 'presentation', 'odp': 'presentation',
            
            # Archivos
            'zip': 'archive', 'rar': 'archive', '7z': 'archive', 'tar': 'archive'
        }
        
        return extension_mapping.get(file_extension, 'unknown')
    
    def _analyze_by_type(self, file_path: str, file_extension: str, content_type: str) -> Dict[str, Any]:
        """Análisis específico según el tipo de archivo"""
        indicators = {}
        
        try:
            if content_type == 'image' and PIL_AVAILABLE:
                indicators.update(self._analyze_image(file_path))
            elif content_type == 'spreadsheet' and PANDAS_AVAILABLE:
                indicators.update(self._analyze_spreadsheet(file_path))
            elif content_type == 'web' and BS4_AVAILABLE:
                indicators.update(self._analyze_web_content(file_path))
            elif content_type == 'data':
                indicators.update(self._analyze_data_file(file_path))
            elif content_type == 'document':
                indicators.update(self._analyze_document(file_path))
            
            # Análisis general siempre
            indicators.update(self._analyze_general(file_path))
            
        except Exception as e:
            logging.warning(f"Error en análisis específico para {content_type}: {e}")
            indicators = self._analyze_general(file_path)
        
        return indicators
    
    def _analyze_image(self, file_path: str) -> Dict[str, Any]:
        """Analizar imagen con PIL"""
        try:
            with Image.open(file_path) as img:
                width, height = img.size
                mode = img.mode
                
                # Calcular DPI si está disponible
                dpi = img.info.get('dpi', (72, 72))
                avg_dpi = (dpi[0] + dpi[1]) / 2 if isinstance(dpi, tuple) else dpi
                
                # Determinar calidad de resolución
                megapixels = (width * height) / 1000000
                
                return {
                    'width': width,
                    'height': height,
                    'megapixels': megapixels,
                    'color_mode': mode,
                    'dpi': avg_dpi,
                    'aspect_ratio': width / height,
                    'resolution_quality': 'high' if avg_dpi >= 300 else 'medium' if avg_dpi >= 150 else 'low',
                    'size_category': 'large' if megapixels > 10 else 'medium' if megapixels > 2 else 'small'
                }
        except Exception as e:
            logging.warning(f"Error analizando imagen: {e}")
            return {}
    
    def _analyze_spreadsheet(self, file_path: str) -> Dict[str, Any]:
        """Analizar hoja de cálculo con pandas"""
        try:
            # Intentar leer como Excel o CSV
            if file_path.lower().endswith(('.xlsx', '.xls')):
                df = pd.read_excel(file_path, nrows=1000)  # Limitar para análisis
            else:
                df = pd.read_csv(file_path, nrows=1000)
            
            rows, cols = df.shape
            
            # Analizar tipos de datos
            numeric_cols = len(df.select_dtypes(include=['number']).columns)
            text_cols = len(df.select_dtypes(include=['object']).columns)
            
            return {
                'rows': rows,
                'columns': cols,
                'numeric_columns': numeric_cols,
                'text_columns': text_cols,
                'data_density': df.notna().sum().sum() / (rows * cols) if rows * cols > 0 else 0,
                'size_category': 'large' if rows > 10000 else 'medium' if rows > 1000 else 'small',
                'complexity': 'high' if cols > 20 else 'medium' if cols > 10 else 'low'
            }
        except Exception as e:
            logging.warning(f"Error analizando spreadsheet: {e}")
            return {}
    
    def _analyze_web_content(self, file_path: str) -> Dict[str, Any]:
        """Analizar contenido web con BeautifulSoup"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            soup = BeautifulSoup(content, 'html.parser')
            
            # Contar elementos
            images = len(soup.find_all('img'))
            links = len(soup.find_all('a'))
            tables = len(soup.find_all('table'))
            forms = len(soup.find_all('form'))
            
            # Analizar estructura
            headings = len(soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']))
            paragraphs = len(soup.find_all('p'))
            
            return {
                'images': images,
                'links': links,
                'tables': tables,
                'forms': forms,
                'headings': headings,
                'paragraphs': paragraphs,
                'has_css': bool(soup.find_all(['style', 'link'])),
                'has_javascript': bool(soup.find_all('script')),
                'complexity': 'high' if (images + tables + forms) > 20 else 'medium' if (images + tables + forms) > 5 else 'low'
            }
        except Exception as e:
            logging.warning(f"Error analizando contenido web: {e}")
            return {}
    
    def _analyze_data_file(self, file_path: str) -> Dict[str, Any]:
        """Analizar archivo de datos (JSON, XML, etc.)"""
        try:
            file_size = os.path.getsize(file_path)
            
            if file_path.lower().endswith('.json'):
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Analizar estructura JSON
                if isinstance(data, list):
                    return {
                        'structure': 'array',
                        'items': len(data),
                        'complexity': 'high' if len(data) > 1000 else 'medium' if len(data) > 100 else 'low'
                    }
                elif isinstance(data, dict):
                    return {
                        'structure': 'object',
                        'keys': len(data.keys()),
                        'complexity': 'high' if len(data) > 50 else 'medium' if len(data) > 10 else 'low'
                    }
            
            return {
                'file_size_mb': file_size / (1024 * 1024),
                'complexity': 'high' if file_size > 10*1024*1024 else 'medium' if file_size > 1024*1024 else 'low'
            }
            
        except Exception as e:
            logging.warning(f"Error analizando archivo de datos: {e}")
            return {}
    
    def _analyze_document(self, file_path: str) -> Dict[str, Any]:
        """Analizar documento de texto"""
        try:
            file_size = os.path.getsize(file_path)
            
            # Análisis básico por tamaño
            return {
                'file_size_mb': file_size / (1024 * 1024),
                'estimated_pages': max(1, file_size // (2 * 1024)),  # Estimación: 2KB por página
                'complexity': 'high' if file_size > 5*1024*1024 else 'medium' if file_size > 1024*1024 else 'low'
            }
            
        except Exception as e:
            logging.warning(f"Error analizando documento: {e}")
            return {}
    
    def _analyze_general(self, file_path: str) -> Dict[str, Any]:
        """Análisis general aplicable a cualquier archivo"""
        try:
            file_size = os.path.getsize(file_path)
            file_name = Path(file_path).name
            
            return {
                'file_size_bytes': file_size,
                'file_size_mb': file_size / (1024 * 1024),
                'filename_length': len(file_name),
                'has_special_chars': any(c in file_name for c in '!@#$%^&*()[]{}|\\:";\'<>?,./'),
                'size_category': 'large' if file_size > 100*1024*1024 else 'medium' if file_size > 10*1024*1024 else 'small'
            }
            
        except Exception as e:
            logging.warning(f"Error en análisis general: {e}")
            return {}
    
    def _calculate_complexity(self, file_path: str, file_extension: str, indicators: Dict) -> float:
        """Calcular puntuación de complejidad (0-1)"""
        try:
            complexity_factors = []
            
            # Factor de tamaño
            file_size_mb = indicators.get('file_size_mb', 0)
            if file_size_mb > 100:
                complexity_factors.append(1.0)
            elif file_size_mb > 10:
                complexity_factors.append(0.7)
            elif file_size_mb > 1:
                complexity_factors.append(0.4)
            else:
                complexity_factors.append(0.2)
            
            # Factores específicos por tipo
            if 'megapixels' in indicators:
                # Imagen
                mp = indicators['megapixels']
                complexity_factors.append(min(1.0, mp / 50))  # Normalizar a 50MP
            
            elif 'rows' in indicators:
                # Spreadsheet
                rows = indicators['rows']
                complexity_factors.append(min(1.0, rows / 100000))  # Normalizar a 100k filas
            
            elif 'images' in indicators:
                # Web content
                elements = indicators.get('images', 0) + indicators.get('tables', 0) + indicators.get('forms', 0)
                complexity_factors.append(min(1.0, elements / 100))
            
            # Promedio de factores
            return sum(complexity_factors) / len(complexity_factors) if complexity_factors else 0.5
            
        except Exception as e:
            logging.warning(f"Error calculando complejidad: {e}")
            return 0.5
    
    def _generate_format_recommendations(self, content_type: str, indicators: Dict, 
                                       complexity: float, target_format: str = None) -> List[Dict[str, Any]]:
        """Generar recomendaciones de formato basadas en el análisis"""
        try:
            base_formats = self.format_priorities.get(content_type, ['pdf', 'html', 'txt'])
            recommendations = []
            
            for i, fmt in enumerate(base_formats[:5]):  # Top 5 recomendaciones
                score = 1.0 - (i * 0.15)  # Puntuación decreciente
                
                # Ajustar puntuación basada en complejidad
                if fmt == 'pdf' and complexity > 0.7:
                    score += 0.1  # PDF es mejor para contenido complejo
                elif fmt == 'html' and content_type == 'web':
                    score += 0.2  # HTML es ideal para contenido web
                elif fmt == target_format:
                    score += 0.3  # Bonus si coincide con el formato deseado
                
                # Razones específicas
                reasons = self._get_format_reasons(fmt, content_type, indicators, complexity)
                
                recommendations.append({
                    'format': fmt,
                    'score': min(1.0, score),
                    'reasons': reasons,
                    'estimated_quality': 'high' if score > 0.8 else 'medium' if score > 0.6 else 'acceptable'
                })
            
            # Ordenar por puntuación
            recommendations.sort(key=lambda x: x['score'], reverse=True)
            
            return recommendations
            
        except Exception as e:
            logging.warning(f"Error generando recomendaciones: {e}")
            return [{'format': 'pdf', 'score': 0.8, 'reasons': ['Formato universal'], 'estimated_quality': 'high'}]
    
    def _get_format_reasons(self, format_name: str, content_type: str, 
                          indicators: Dict, complexity: float) -> List[str]:
        """Obtener razones específicas para recomendar un formato"""
        reasons = []
        
        format_benefits = {
            'pdf': ['Preserva formato original', 'Compatible universalmente', 'Ideal para impresión'],
            'html': ['Visualización web', 'Interactivo', 'Fácil de compartir'],
            'png': ['Calidad sin pérdida', 'Soporta transparencia', 'Ideal para gráficos'],
            'jpg': ['Tamaño compacto', 'Compatible universalmente', 'Ideal para fotos'],
            'xlsx': ['Funciones avanzadas', 'Formato estándar', 'Ideal para análisis'],
            'csv': ['Formato simple', 'Compatible con cualquier herramienta', 'Fácil de procesar'],
            'json': ['Estructura de datos', 'Compatible con APIs', 'Fácil de procesar'],
            'docx': ['Editable', 'Formato estándar', 'Funciones avanzadas'],
            'md': ['Formato simple', 'Control de versiones', 'Fácil de leer']
        }
        
        # Razones base del formato
        reasons.extend(format_benefits.get(format_name, ['Formato compatible']))
        
        # Razones específicas basadas en análisis
        if complexity > 0.8 and format_name == 'pdf':
            reasons.append('Recomendado para contenido complejo')
        
        if indicators.get('size_category') == 'large' and format_name in ['jpg', 'webp']:
            reasons.append('Optimiza tamaño de archivo')
        
        if content_type == 'image' and indicators.get('resolution_quality') == 'high' and format_name == 'png':
            reasons.append('Preserva calidad de imagen alta')
        
        return reasons[:3]  # Máximo 3 razones
    
    def _analyze_with_ai(self, file_path: str, file_extension: str, content_type: str) -> Optional[Dict[str, Any]]:
        """Análisis con IA usando Gemini (opcional)"""
        try:
            if not self.gemini_model:
                return None
            
            # Crear prompt basado en el tipo de archivo
            prompt = self._create_ai_prompt(file_path, file_extension, content_type)
            
            if not prompt:
                return None
            
            # Generar análisis con IA
            response = self.gemini_model.generate_content(prompt)
            
            return {
                'ai_analysis': response.text,
                'confidence': 0.8,  # Placeholder
                'model': 'gemini-pro'
            }
            
        except Exception as e:
            logging.warning(f"Error en análisis IA: {e}")
            return None
    
    def _create_ai_prompt(self, file_path: str, file_extension: str, content_type: str) -> Optional[str]:
        """Crear prompt para análisis IA"""
        try:
            file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
            
            base_prompt = f"""
            Analiza este archivo {file_extension.upper()} de {file_size_mb:.1f}MB y tipo '{content_type}'.
            
            Proporciona:
            1. Características principales del contenido
            2. Mejor formato de destino recomendado
            3. Razones específicas para la recomendación
            4. Consideraciones especiales
            
            Responde en formato JSON con las claves: characteristics, recommended_format, reasons, considerations.
            """
            
            return base_prompt.strip()
            
        except Exception as e:
            logging.warning(f"Error creando prompt IA: {e}")
            return None
    
    def _extract_metadata(self, file_path: str, file_extension: str) -> Dict[str, Any]:
        """Extraer metadatos adicionales del archivo"""
        try:
            stat = os.stat(file_path)
            
            metadata = {
                'created_time': stat.st_ctime,
                'modified_time': stat.st_mtime,
                'file_extension': file_extension,
                'file_name': Path(file_path).name,
                'file_stem': Path(file_path).stem
            }
            
            # Metadatos específicos por tipo
            if file_extension in ['jpg', 'jpeg'] and PIL_AVAILABLE:
                try:
                    with Image.open(file_path) as img:
                        exif = img._getexif()
                        if exif:
                            metadata['has_exif'] = True
                            metadata['exif_keys'] = list(exif.keys())[:10]  # Primeras 10 claves
                except:
                    pass
            
            return metadata
            
        except Exception as e:
            logging.warning(f"Error extrayendo metadatos: {e}")
            return {}
    
    def _create_basic_analysis(self, file_path: str, error_msg: str) -> FileAnalysis:
        """Crear análisis básico en caso de error"""
        try:
            file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
            file_extension = Path(file_path).suffix.lower().lstrip('.')
            
            return FileAnalysis(
                file_path=file_path,
                file_type=file_extension,
                file_size=file_size,
                content_type='unknown',
                complexity_score=0.5,
                quality_indicators={'error': error_msg},
                recommended_formats=[
                    {'format': 'pdf', 'score': 0.8, 'reasons': ['Formato universal'], 'estimated_quality': 'high'}
                ],
                metadata={'analysis_error': error_msg}
            )
            
        except Exception as e:
            logging.error(f"Error creando análisis básico: {e}")
            return FileAnalysis(
                file_path=file_path,
                file_type='unknown',
                file_size=0,
                content_type='unknown',
                complexity_score=0.5,
                quality_indicators={},
                recommended_formats=[]
            )

# Instancia global del analizador IA
ai_file_analyzer = AIFileAnalyzer()
