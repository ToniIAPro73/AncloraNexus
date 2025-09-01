# ================================
# ANCLORA NEXUS - AI CONVERSION ENGINE
# Motor de conversión inteligente con IA
# ================================

import os
import json
import time
import hashlib
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import google.generativeai as genai
from pathlib import Path

@dataclass
class ConversionPath:
    """Representa una ruta de conversión optimizada"""
    source_format: str
    target_format: str
    intermediate_steps: List[str]
    quality_score: float  # 0-100
    speed_score: float    # 0-100
    cost_credits: int
    ai_confidence: float  # 0-1
    description: str
    estimated_time_seconds: float
    use_case_optimization: str  # 'quality', 'speed', 'balanced'
    visual_path: str = ""  # Representación visual de la ruta

    def __post_init__(self):
        """Genera visual_path automáticamente si no se proporciona"""
        if not self.visual_path:
            steps = [self.source_format] + self.intermediate_steps + [self.target_format]
            self.visual_path = ' → '.join([s.upper() for s in steps])

@dataclass
class FileAnalysis:
    """Análisis inteligente de archivo"""
    file_type: str
    content_type: str  # 'document', 'image', 'presentation', 'data', 'creative'
    complexity_level: str  # 'simple', 'medium', 'complex'
    quality_indicators: Dict[str, float]
    metadata_richness: float
    ai_recommendations: List[str]
    optimal_targets: List[str]
    security_level: str  # 'public', 'sensitive', 'confidential'

class AIConversionEngine:
    """Motor de conversión inteligente con IA de Anclora Nexus"""
    
    def __init__(self):
        self.name = "Anclora Nexus AI Conversion Engine"
        self.version = "2.0.0"
        
        # Configurar Gemini AI
        api_key = os.environ.get('GEMINI_API_KEY')
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
        else:
            self.model = None
            print("⚠️ Gemini API key not found. AI features will be limited.")
        
        # Cache de análisis para optimizar rendimiento
        self.analysis_cache = {}
        
        # Patrones de calidad por tipo de archivo
        self.quality_patterns = {
            'document': {
                'pdf': {'text_clarity': 0.9, 'layout_preservation': 0.95, 'metadata_retention': 0.8},
                'docx': {'editability': 0.95, 'formatting': 0.9, 'compatibility': 0.85},
                'html': {'web_compatibility': 0.95, 'accessibility': 0.8, 'seo_friendly': 0.9}
            },
            'image': {
                'pdf': {'quality_retention': 0.85, 'compression': 0.7, 'searchability': 0.9},
                'jpg': {'compression': 0.9, 'compatibility': 0.95, 'quality': 0.8},
                'png': {'quality': 0.95, 'transparency': 1.0, 'compression': 0.6}
            }
        }

    async def analyze_file_with_ai(self, file_path: str, filename: str) -> FileAnalysis:
        """Análisis inteligente de archivo usando IA"""
        
        # Generar hash para cache
        file_hash = self._generate_file_hash(file_path)
        if file_hash in self.analysis_cache:
            return self.analysis_cache[file_hash]
        
        # Análisis básico del archivo
        file_stats = os.stat(file_path)
        file_extension = filename.split('.')[-1].lower()
        
        # Leer muestra del contenido para análisis
        content_sample = self._extract_content_sample(file_path, file_extension)
        
        # Análisis con IA si está disponible
        ai_analysis = await self._analyze_with_gemini(content_sample, filename, file_extension)
        
        # Combinar análisis técnico y de IA
        analysis = FileAnalysis(
            file_type=file_extension,
            content_type=ai_analysis.get('content_type', 'document'),
            complexity_level=ai_analysis.get('complexity', 'medium'),
            quality_indicators=self._calculate_quality_indicators(file_path, file_extension),
            metadata_richness=self._assess_metadata_richness(file_path, file_extension),
            ai_recommendations=ai_analysis.get('recommendations', []),
            optimal_targets=ai_analysis.get('optimal_targets', []),
            security_level=ai_analysis.get('security_level', 'public')
        )
        
        # Guardar en cache
        self.analysis_cache[file_hash] = analysis
        return analysis

    async def get_optimal_conversion_paths(self, source_format: str, target_format: str, 
                                         file_analysis: FileAnalysis) -> List[ConversionPath]:
        """Obtiene rutas de conversión optimizadas con IA"""
        
        paths = []
        
        # Ruta directa
        direct_path = self._create_direct_path(source_format, target_format, file_analysis)
        if direct_path:
            paths.append(direct_path)
        
        # Rutas con pasos intermedios (máximo 2)
        intermediate_paths = await self._find_intelligent_intermediate_paths(
            source_format, target_format, file_analysis
        )
        paths.extend(intermediate_paths)
        
        # Ordenar por puntuación combinada (calidad + velocidad + IA confidence)
        paths.sort(key=lambda p: (p.quality_score * 0.4 + p.speed_score * 0.3 + p.ai_confidence * 0.3), reverse=True)
        
        return paths[:3]  # Devolver top 3 opciones

    async def _analyze_with_gemini(self, content_sample: str, filename: str, extension: str) -> Dict[str, Any]:
        """Análisis de contenido usando Gemini AI"""
        
        if not self.model:
            return self._fallback_analysis(extension)
        
        try:
            prompt = f"""
            Analiza este archivo y proporciona un análisis detallado en formato JSON:
            
            Archivo: {filename}
            Extensión: {extension}
            Muestra de contenido: {content_sample[:1000]}
            
            Proporciona:
            1. content_type: 'document', 'image', 'presentation', 'data', 'creative'
            2. complexity: 'simple', 'medium', 'complex'
            3. recommendations: lista de 3 recomendaciones específicas
            4. optimal_targets: lista de 3 formatos objetivo óptimos
            5. security_level: 'public', 'sensitive', 'confidential'
            6. use_case: caso de uso principal detectado
            7. quality_factors: factores que afectan la calidad de conversión
            
            Responde SOLO con JSON válido.
            """
            
            response = self.model.generate_content(prompt)
            
            # Parsear respuesta JSON
            try:
                return json.loads(response.text)
            except json.JSONDecodeError:
                # Extraer JSON de la respuesta si está envuelto en texto
                import re
                json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())
                else:
                    return self._fallback_analysis(extension)
                    
        except Exception as e:
            print(f"Error en análisis con Gemini: {e}")
            return self._fallback_analysis(extension)

    def _fallback_analysis(self, extension: str) -> Dict[str, Any]:
        """Análisis de respaldo sin IA"""
        
        content_types = {
            'pdf': 'document', 'doc': 'document', 'docx': 'document', 'txt': 'document',
            'md': 'document', 'html': 'document', 'rtf': 'document',
            'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image',
            'mp4': 'video', 'avi': 'video', 'mov': 'video'
        }
        
        return {
            'content_type': content_types.get(extension, 'document'),
            'complexity': 'medium',
            'recommendations': [
                f'Conversión estándar desde {extension.upper()}',
                'Considera la calidad vs velocidad',
                'Revisa el resultado antes de usar'
            ],
            'optimal_targets': ['pdf', 'html', 'txt'],
            'security_level': 'public',
            'use_case': 'general',
            'quality_factors': ['format_compatibility', 'content_preservation']
        }

    async def _find_intelligent_intermediate_paths(self, source: str, target: str, 
                                                 analysis: FileAnalysis) -> List[ConversionPath]:
        """Encuentra rutas inteligentes con pasos intermedios"""
        
        paths = []
        
        # Rutas inteligentes basadas en el tipo de contenido
        if analysis.content_type == 'document':
            if source in ['doc', 'docx'] and target == 'pdf':
                # Ruta optimizada: DOC → HTML → PDF (mejor calidad)
                paths.append(ConversionPath(
                    source_format=source,
                    target_format=target,
                    intermediate_steps=['html'],
                    quality_score=92.0,
                    speed_score=75.0,
                    cost_credits=6,
                    ai_confidence=0.9,
                    description="Conversión optimizada vía HTML para mejor preservación de formato",
                    estimated_time_seconds=8.5,
                    use_case_optimization='quality'
                ))
            
            elif source == 'pdf' and target in ['doc', 'docx']:
                # Ruta optimizada: PDF → TXT → DOCX (mejor editabilidad)
                paths.append(ConversionPath(
                    source_format=source,
                    target_format=target,
                    intermediate_steps=['txt'],
                    quality_score=85.0,
                    speed_score=80.0,
                    cost_credits=7,
                    ai_confidence=0.85,
                    description="Conversión optimizada vía texto para mejor editabilidad",
                    estimated_time_seconds=12.0,
                    use_case_optimization='quality'
                ))
        
        elif analysis.content_type == 'image':
            if source in ['jpg', 'jpeg'] and target == 'pdf':
                # Ruta optimizada: JPG → PNG → PDF (mejor calidad)
                paths.append(ConversionPath(
                    source_format=source,
                    target_format=target,
                    intermediate_steps=['png'],
                    quality_score=88.0,
                    speed_score=70.0,
                    cost_credits=4,
                    ai_confidence=0.8,
                    description="Conversión optimizada vía PNG para mejor calidad en PDF",
                    estimated_time_seconds=6.0,
                    use_case_optimization='quality'
                ))
        
        return paths

    def _create_direct_path(self, source: str, target: str, analysis: FileAnalysis) -> Optional[ConversionPath]:
        """Crea ruta de conversión directa"""
        
        # Calcular puntuaciones basadas en el análisis
        quality_score = self._calculate_direct_quality_score(source, target, analysis)
        speed_score = 95.0  # Las conversiones directas son más rápidas
        cost_credits = self._get_base_conversion_cost(source, target)
        
        return ConversionPath(
            source_format=source,
            target_format=target,
            intermediate_steps=[],
            quality_score=quality_score,
            speed_score=speed_score,
            cost_credits=cost_credits,
            ai_confidence=0.7,
            description=f"Conversión directa {source.upper()} → {target.upper()}",
            estimated_time_seconds=3.0,
            use_case_optimization='speed'
        )

    def _extract_content_sample(self, file_path: str, extension: str) -> str:
        """Extrae muestra de contenido para análisis"""
        
        try:
            if extension in ['txt', 'md', 'html', 'rtf']:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    return f.read(2000)  # Primeros 2KB
            elif extension == 'pdf':
                # Para PDF, extraer texto de la primera página
                try:
                    from pypdf import PdfReader
                    reader = PdfReader(file_path)
                    if reader.pages:
                        return reader.pages[0].extract_text()[:2000]
                except:
                    pass
            
            return f"Archivo binario de tipo {extension}"
            
        except Exception as e:
            return f"Error leyendo archivo: {str(e)}"

    def _generate_file_hash(self, file_path: str) -> str:
        """Genera hash único para el archivo"""
        
        stat = os.stat(file_path)
        content = f"{file_path}_{stat.st_size}_{stat.st_mtime}"
        return hashlib.md5(content.encode()).hexdigest()

    def _calculate_quality_indicators(self, file_path: str, extension: str) -> Dict[str, float]:
        """Calcula indicadores de calidad del archivo"""
        
        indicators = {}
        file_size = os.path.getsize(file_path)
        
        # Indicadores básicos
        indicators['file_size_score'] = min(1.0, 10_000_000 / max(file_size, 1))  # Mejor para archivos < 10MB
        indicators['format_maturity'] = self._get_format_maturity_score(extension)
        
        # Indicadores específicos por tipo
        if extension in ['txt', 'md', 'html']:
            indicators['text_encoding_quality'] = self._assess_text_encoding(file_path)
        elif extension in ['jpg', 'jpeg', 'png', 'gif']:
            indicators['image_quality'] = self._assess_image_quality(file_path)
        
        return indicators

    def _assess_metadata_richness(self, file_path: str, extension: str) -> float:
        """Evalúa la riqueza de metadatos del archivo"""
        
        try:
            if extension == 'pdf':
                from pypdf import PdfReader
                reader = PdfReader(file_path)
                metadata = reader.metadata
                return len(metadata) / 10.0 if metadata else 0.1
            elif extension in ['jpg', 'jpeg']:
                from PIL import Image
                from PIL.ExifTags import TAGS
                image = Image.open(file_path)
                exif = image.getexif()
                return len(exif) / 20.0 if exif else 0.1
            
            return 0.5  # Valor por defecto
            
        except Exception:
            return 0.1

    def _calculate_direct_quality_score(self, source: str, target: str, analysis: FileAnalysis) -> float:
        """Calcula puntuación de calidad para conversión directa"""
        
        base_scores = {
            ('txt', 'pdf'): 85.0,
            ('txt', 'html'): 90.0,
            ('md', 'html'): 95.0,
            ('md', 'pdf'): 80.0,
            ('html', 'pdf'): 85.0,
            ('pdf', 'txt'): 70.0,
            ('docx', 'pdf'): 90.0,
            ('jpg', 'pdf'): 85.0,
            ('png', 'pdf'): 88.0
        }
        
        base_score = base_scores.get((source, target), 75.0)
        
        # Ajustar basado en análisis
        if analysis.complexity_level == 'simple':
            base_score += 5.0
        elif analysis.complexity_level == 'complex':
            base_score -= 10.0
        
        # Ajustar basado en calidad del archivo
        avg_quality = sum(analysis.quality_indicators.values()) / len(analysis.quality_indicators)
        base_score += (avg_quality - 0.5) * 20
        
        return min(100.0, max(0.0, base_score))

    def _get_base_conversion_cost(self, source: str, target: str) -> int:
        """Obtiene costo base de conversión"""
        
        costs = {
            ('txt', 'pdf'): 1, ('txt', 'html'): 1, ('md', 'html'): 1, ('md', 'pdf'): 2,
            ('html', 'pdf'): 2, ('pdf', 'txt'): 4, ('docx', 'pdf'): 4, ('jpg', 'pdf'): 3
        }
        
        return costs.get((source, target), 3)

    def _get_format_maturity_score(self, extension: str) -> float:
        """Puntuación de madurez del formato"""
        
        maturity_scores = {
            'pdf': 0.95, 'html': 0.9, 'txt': 0.85, 'docx': 0.9, 'jpg': 0.9,
            'png': 0.85, 'gif': 0.7, 'md': 0.8, 'rtf': 0.6, 'odt': 0.7
        }
        
        return maturity_scores.get(extension, 0.5)

    def _assess_text_encoding(self, file_path: str) -> float:
        """Evalúa la calidad de codificación de texto"""
        
        try:
            with open(file_path, 'rb') as f:
                raw_data = f.read(1024)
            
            # Intentar decodificar como UTF-8
            try:
                raw_data.decode('utf-8')
                return 1.0  # Perfecto UTF-8
            except UnicodeDecodeError:
                # Intentar otras codificaciones
                encodings = ['latin-1', 'cp1252', 'iso-8859-1']
                for encoding in encodings:
                    try:
                        raw_data.decode(encoding)
                        return 0.7  # Codificación legacy pero válida
                    except:
                        continue
                return 0.3  # Problemas de codificación
                
        except Exception:
            return 0.5

    def _assess_image_quality(self, file_path: str) -> float:
        """Evalúa la calidad de imagen"""
        
        try:
            from PIL import Image
            image = Image.open(file_path)
            
            # Factores de calidad
            width, height = image.size
            pixel_count = width * height
            
            # Puntuación basada en resolución
            if pixel_count > 2_000_000:  # > 2MP
                resolution_score = 1.0
            elif pixel_count > 500_000:  # > 0.5MP
                resolution_score = 0.8
            else:
                resolution_score = 0.6
            
            # Puntuación basada en modo de color
            mode_scores = {'RGB': 1.0, 'RGBA': 0.95, 'L': 0.7, 'P': 0.6}
            mode_score = mode_scores.get(image.mode, 0.5)
            
            return (resolution_score + mode_score) / 2
            
        except Exception:
            return 0.5

# Instancia global del motor de IA
ai_conversion_engine = AIConversionEngine()
