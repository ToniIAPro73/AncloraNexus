"""
Analizador de complejidad HTML para selección inteligente de método de conversión PDF
Analiza el contenido HTML y recomienda la biblioteca más adecuada
"""

import re
import os
from bs4 import BeautifulSoup
from typing import Dict, List, Tuple
import logging

# Import optimization system
try:
    from ...services.intelligent_optimization import get_cached_analysis, cache_analysis, record_performance
    OPTIMIZATION_AVAILABLE = True
except ImportError:
    OPTIMIZATION_AVAILABLE = False
    logging.warning("Sistema de optimización no disponible")

logger = logging.getLogger(__name__)

class HTMLComplexityAnalyzer:
    """Analiza la complejidad de un archivo HTML para recomendar el mejor método de conversión"""
    
    def __init__(self):
        self.complexity_score = 0
        self.features = {
            'custom_fonts': False,
            'gradients': False,
            'background_images': False,
            'complex_css': False,
            'javascript': False,
            'svg_content': False,
            'advanced_layout': False,
            'animations': False,
            'external_resources': False,
            'print_styles': False
        }
        
    def analyze_html_file(self, html_path: str) -> Dict:
        """Analiza un archivo HTML y retorna recomendación de método de conversión"""
        try:
            # Intentar obtener análisis desde cache
            if OPTIMIZATION_AVAILABLE:
                cached_result = get_cached_analysis(html_path)
                if cached_result:
                    logger.info(f"Usando análisis cacheado para {html_path}")
                    return cached_result

            # Realizar análisis completo
            with open(html_path, 'r', encoding='utf-8') as f:
                html_content = f.read()

            analysis_result = self.analyze_html_content(html_content, os.path.dirname(html_path))

            # Cachear resultado si el sistema de optimización está disponible
            if OPTIMIZATION_AVAILABLE:
                cache_analysis(html_path, analysis_result)
                logger.info(f"Análisis cacheado para {html_path}")

            return analysis_result

        except Exception as e:
            logger.error(f"Error analizando HTML: {str(e)}")
            return self._get_fallback_recommendation()
    
    def analyze_html_content(self, html_content: str, base_path: str = "") -> Dict:
        """Analiza el contenido HTML y retorna recomendación"""
        self.complexity_score = 0
        self._reset_features()
        
        # Parsear HTML
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Analizar diferentes aspectos
        self._analyze_fonts(html_content, soup)
        self._analyze_css_complexity(html_content, soup)
        self._analyze_images_and_media(soup, base_path)
        self._analyze_layout_complexity(soup)
        self._analyze_javascript(soup)
        self._analyze_external_resources(soup)
        self._analyze_print_styles(html_content)
        
        # Calcular puntuación final
        total_score = self._calculate_total_score()
        
        # Determinar recomendación
        recommendation = self._get_method_recommendation(total_score)
        
        return {
            'complexity_score': total_score,
            'complexity_level': self._get_complexity_level(total_score),
            'features_detected': {k: v for k, v in self.features.items() if v},
            'recommended_method': recommendation['method'],
            'method_priority': recommendation['priority'],
            'reasoning': recommendation['reasoning'],
            'estimated_time': recommendation['estimated_time'],
            'quality_expectation': recommendation['quality']
        }
    
    def _reset_features(self):
        """Resetea las características detectadas"""
        for key in self.features:
            self.features[key] = False
    
    def _analyze_fonts(self, html_content: str, soup: BeautifulSoup):
        """Analiza el uso de fuentes personalizadas"""
        # Google Fonts
        if 'fonts.googleapis.com' in html_content or 'fonts.gstatic.com' in html_content:
            self.features['custom_fonts'] = True
            self.complexity_score += 15
        
        # Font-face declarations
        if '@font-face' in html_content:
            self.features['custom_fonts'] = True
            self.complexity_score += 20
        
        # Web fonts
        font_patterns = [r'font-family\s*:\s*["\'][^"\']*["\']', r'@import.*font']
        for pattern in font_patterns:
            if re.search(pattern, html_content, re.IGNORECASE):
                self.features['custom_fonts'] = True
                self.complexity_score += 10
                break
    
    def _analyze_css_complexity(self, html_content: str, soup: BeautifulSoup):
        """Analiza la complejidad del CSS"""
        # Gradientes
        gradient_patterns = [
            r'linear-gradient', r'radial-gradient', r'conic-gradient',
            r'-webkit-gradient', r'-moz-linear-gradient'
        ]
        for pattern in gradient_patterns:
            if re.search(pattern, html_content, re.IGNORECASE):
                self.features['gradients'] = True
                self.complexity_score += 25
                break
        
        # CSS avanzado
        advanced_css = [
            r'transform:', r'transition:', r'animation:', r'@keyframes',
            r'box-shadow:', r'text-shadow:', r'border-radius:',
            r'backdrop-filter:', r'filter:', r'clip-path:'
        ]
        advanced_count = 0
        for pattern in advanced_css:
            if re.search(pattern, html_content, re.IGNORECASE):
                advanced_count += 1
        
        if advanced_count > 0:
            self.features['complex_css'] = True
            self.complexity_score += min(advanced_count * 8, 40)
        
        # Animaciones
        if re.search(r'@keyframes|animation:', html_content, re.IGNORECASE):
            self.features['animations'] = True
            self.complexity_score += 20
    
    def _analyze_images_and_media(self, soup: BeautifulSoup, base_path: str):
        """Analiza imágenes y contenido multimedia"""
        # Imágenes de fondo en CSS
        if soup.find_all(attrs={"style": re.compile(r'background.*image', re.I)}):
            self.features['background_images'] = True
            self.complexity_score += 15
        
        # SVG inline
        if soup.find_all('svg'):
            self.features['svg_content'] = True
            self.complexity_score += 20
        
        # Múltiples imágenes
        images = soup.find_all(['img', 'picture', 'source'])
        if len(images) > 5:
            self.complexity_score += min(len(images) * 2, 30)
    
    def _analyze_layout_complexity(self, soup: BeautifulSoup):
        """Analiza la complejidad del layout"""
        # CSS Grid y Flexbox
        layout_indicators = soup.find_all(attrs={"style": re.compile(r'display:\s*(grid|flex)', re.I)})
        if layout_indicators:
            self.features['advanced_layout'] = True
            self.complexity_score += 15
        
        # Múltiples columnas
        if soup.find_all(attrs={"class": re.compile(r'col|grid|flex', re.I)}):
            self.features['advanced_layout'] = True
            self.complexity_score += 10
        
        # Elementos posicionados
        positioned = soup.find_all(attrs={"style": re.compile(r'position:\s*(absolute|fixed|sticky)', re.I)})
        if positioned:
            self.complexity_score += len(positioned) * 5
    
    def _analyze_javascript(self, soup: BeautifulSoup):
        """Analiza la presencia de JavaScript"""
        scripts = soup.find_all('script')
        if scripts:
            self.features['javascript'] = True
            self.complexity_score += 10  # JS puede afectar el renderizado
    
    def _analyze_external_resources(self, soup: BeautifulSoup):
        """Analiza recursos externos"""
        external_links = soup.find_all('link', href=True)
        external_scripts = soup.find_all('script', src=True)
        
        if external_links or external_scripts:
            self.features['external_resources'] = True
            self.complexity_score += 10
    
    def _analyze_print_styles(self, html_content: str):
        """Analiza estilos específicos para impresión"""
        if re.search(r'@media\s+print|@page', html_content, re.IGNORECASE):
            self.features['print_styles'] = True
            self.complexity_score += 15
    
    def _calculate_total_score(self) -> int:
        """Calcula la puntuación total de complejidad"""
        return min(self.complexity_score, 200)  # Máximo 200 puntos
    
    def _get_complexity_level(self, score: int) -> str:
        """Determina el nivel de complejidad basado en la puntuación"""
        if score <= 30:
            return "SIMPLE"
        elif score <= 70:
            return "MODERADA"
        elif score <= 120:
            return "COMPLEJA"
        else:
            return "MUY_COMPLEJA"
    
    def _get_method_recommendation(self, score: int) -> Dict:
        """Recomienda el método de conversión basado en la complejidad"""
        
        if score <= 20:
            # HTML simple - FPDF es suficiente y más rápido
            return {
                'method': 'fpdf',
                'priority': ['fpdf', 'weasyprint', 'playwright'],
                'reasoning': 'HTML simple con texto básico. FPDF es eficiente y suficiente.',
                'estimated_time': '< 1s',
                'quality': 'BUENA'
            }
        
        elif score <= 50:
            # HTML moderado - WeasyPrint es ideal
            return {
                'method': 'weasyprint',
                'priority': ['weasyprint', 'wkhtmltopdf', 'playwright', 'fpdf'],
                'reasoning': 'HTML con CSS moderado. WeasyPrint ofrece buen balance calidad/velocidad.',
                'estimated_time': '2-4s',
                'quality': 'MUY_BUENA'
            }
        
        elif score <= 90:
            # HTML complejo - wkhtmltopdf o Playwright
            return {
                'method': 'wkhtmltopdf',
                'priority': ['wkhtmltopdf', 'playwright', 'weasyprint', 'fpdf'],
                'reasoning': 'HTML complejo con CSS avanzado. wkhtmltopdf maneja bien la mayoría de casos.',
                'estimated_time': '3-6s',
                'quality': 'EXCELENTE'
            }
        
        else:
            # HTML muy complejo - Playwright es necesario
            return {
                'method': 'playwright',
                'priority': ['playwright', 'wkhtmltopdf', 'weasyprint', 'fpdf'],
                'reasoning': 'HTML muy complejo con CSS moderno, gradientes y elementos avanzados. Solo Playwright garantiza fidelidad completa.',
                'estimated_time': '5-10s',
                'quality': 'MÁXIMA'
            }
    
    def _get_fallback_recommendation(self) -> Dict:
        """Retorna recomendación por defecto en caso de error"""
        return {
            'complexity_score': 50,
            'complexity_level': 'MODERADA',
            'features_detected': {},
            'recommended_method': 'weasyprint',
            'method_priority': ['weasyprint', 'playwright', 'fpdf'],
            'reasoning': 'No se pudo analizar el HTML. Usando método balanceado.',
            'estimated_time': '2-4s',
            'quality': 'BUENA'
        }

def analyze_html_complexity(html_path: str) -> Dict:
    """Función de conveniencia para analizar complejidad HTML"""
    analyzer = HTMLComplexityAnalyzer()
    return analyzer.analyze_html_file(html_path)

# Ejemplo de uso
if __name__ == "__main__":
    # Test con el archivo de diseño de Anclora
    test_file = "../../docs/design/Anclora Brand & Design System Guide (A4).html"
    if os.path.exists(test_file):
        result = analyze_html_complexity(test_file)
        print("=== ANÁLISIS DE COMPLEJIDAD HTML ===")
        print(f"Archivo: {test_file}")
        print(f"Complejidad: {result['complexity_level']} (Score: {result['complexity_score']})")
        print(f"Método recomendado: {result['recommended_method']}")
        print(f"Razón: {result['reasoning']}")
        print(f"Tiempo estimado: {result['estimated_time']}")
        print(f"Calidad esperada: {result['quality_expectation']}")
        print(f"Características detectadas: {list(result['features_detected'].keys())}")
    else:
        print(f"Archivo no encontrado: {test_file}")
