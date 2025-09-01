import os
import importlib
import pkgutil
import tempfile
from collections import deque
from pathlib import Path

from src.ws import emit_progress, Phase
from src.encoding_normalizer import normalize_to_utf8
from src.models.user import Conversion, CreditTransaction


TEXT_EXTENSIONS = {
    'txt', 'md', 'html', 'rtf', 'odt', 'doc', 'docx', 'tex'
}

class ConversionEngine:
    """Motor de conversiÃ³n de Anclora Nexus"""

    def __init__(self):
        self.name = 'Anclora Nexus Conversion Engine'
        self.version = '1.0.0'

        # Conversiones soportadas y sus costos en crÃ©ditos
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
                'gif': 3,
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
                'gif': 2,
                'webp': 2
            },
            'gif': {
                'jpg': 1,
                'png': 1,
                'pdf': 3,
                'mp4': 4
            },
            'svg': {
                'png': 2
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
            },
            'md': {
                'html': 1,
                'pdf': 2,
                'txt': 1,
                'doc': 3,
                'docx': 3
            },
            'html': {
                'pdf': 2,
                'txt': 1,
                'md': 1,
                'doc': 3,
                'docx': 3
            },
            # === NUEVAS CONVERSIONES IMPLEMENTADAS ===
            'csv': {
                'html': 1,
                'pdf': 2,
                'json': 1,
                'txt': 1
            },
            'json': {
                'html': 1,
                'csv': 1,
                'txt': 1,
                'pdf': 2
            },
            'epub': {
                'html': 2,
                'pdf': 3,
                'txt': 2,
                'md': 2
            },
            'rtf': {
                'docx': 2,
                'pdf': 2,
                'txt': 1,
                'html': 2
            },
            'odt': {
                'pdf': 2,
                'docx': 3,
                'txt': 2,
                'html': 2
            },
            'webp': {
                'jpg': 1,
                'png': 1,
                'gif': 2,
                'pdf': 2
            },
            'tiff': {
                'jpg': 1,
                'png': 1,
                'pdf': 2
            },
            'bmp': {
                'jpg': 1,
                'png': 1,
                'pdf': 2
            }
        }

        # Registro dinÃ¡mico de plugins
        self.conversion_methods = {}
        self.load_plugins()

        # Integración con servicios de IA
        self.ai_enabled = True
        self.quality_threshold = 0.8  # Umbral mínimo de calidad IA
        self.enable_intelligent_sequences = True

    def load_plugins(self):
        """Carga todos los plugins de conversiÃ³n disponibles."""
        package = importlib.import_module('src.models.conversions')
        package_path = Path(package.__file__).parent
        for _, name, _ in pkgutil.iter_modules([str(package_path)]):
            module = importlib.import_module(f'{package.__name__}.{name}')
            conv = getattr(module, 'CONVERSION', None)
            func = getattr(module, 'convert', None)
            if conv and func:
                self.conversion_methods[tuple(map(str.lower, conv))] = func

    def get_supported_formats(self, source_format):
        """Obtiene los formatos de destino soportados para un formato origen"""
        return list(self.supported_conversions.get(source_format.lower(), {}).keys())

    def get_all_supported_formats(self):
        """Obtiene todos los formatos soportados (entrada y salida)"""
        input_formats = set(self.supported_conversions.keys())
        output_formats = set()

        for targets in self.supported_conversions.values():
            output_formats.update(targets.keys())

        return {
            'input': input_formats,
            'output': output_formats
        }

    def get_conversion_cost(self, source_format, target_format):
        """Calcula el costo en crÃ©ditos de una conversiÃ³n"""
        source = source_format.lower().replace('.', '')
        target = target_format.lower().replace('.', '')
        return self.supported_conversions.get(source, {}).get(target, 2)

    def validate_file(self, file_path, max_size_mb=100):
        """Valida un archivo antes de la conversiÃ³n"""
        if not os.path.exists(file_path):
            return False, "El archivo no existe"
        file_size = os.path.getsize(file_path)
        if file_size == 0:
            return False, "El archivo estÃ¡ vacÃ­o"
        if file_size > max_size_mb * 1024 * 1024:
            return False, f"El archivo es demasiado grande (mÃ¡ximo {max_size_mb}MB)"
        return True, "Archivo vÃ¡lido"

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
        if file_extension == 'txt':
            analysis['recommendations'] = [
                'Para documentos formales, recomendamos PDF',
                'Para web, HTML es la mejor opciÃ³n',
                'Para desarrolladores, Markdown es ideal'
            ]
        elif file_extension == 'pdf':
            analysis['recommendations'] = [
                'Para ediciÃ³n, convierte a DOC',
                'Para imÃ¡genes, JPG o PNG son ideales'
            ]
        elif file_extension in ['jpg', 'png']:
            analysis['recommendations'] = [
                'Para documentos, PDF mantiene la calidad',
                'Para web, considera optimizaciÃ³n de tamaÃ±o'
            ]

        return analysis

    def find_conversion_path(self, src_format: str, dst_format: str):
        """Busca una ruta de conversiÃ³n usando BFS con hasta dos intermediarios.

        Devuelve una lista de formatos que representa el camino desde src_format
        hasta dst_format, inclusive. Si no se encuentra una ruta vÃ¡lida dentro
        del lÃ­mite de profundidad, devuelve None.
        """
        src = src_format.lower()
        dst = dst_format.lower()

        if src == dst:
            return [src]

        max_depth = 3  # nÃºmero mÃ¡ximo de pasos (edges): src -> a -> b -> dst
        queue = deque([(src, [src])])
        visited = {src}

        while queue:
            current, path = queue.popleft()
            depth = len(path) - 1
            if depth >= max_depth:
                continue
            for neighbor in self.supported_conversions.get(current, {}):
                if neighbor in visited:
                    continue
                new_path = path + [neighbor]
                if neighbor == dst:
                    return new_path
                visited.add(neighbor)
                queue.append((neighbor, new_path))

        return None

    def convert_file(self, input_path, output_path, source_format, target_format):
        """Realiza la conversiÃ³n de archivo"""
        try:
            source = source_format.lower().replace('.', '')
            logs = []

            if source in TEXT_EXTENSIONS:
                log_entry = normalize_to_utf8(input_path)
                logs.append(
                    f"normalized:{log_entry.get('from')}->{log_entry.get('to')}"
                )

            target = target_format.lower()
            method = self.conversion_methods.get((source, target))
            if method:
                success, msg = method(input_path, output_path)
                logs.append(f"{source}->{target}: {msg}")
                return success, " | ".join(logs)

            path = self.find_conversion_path(source, target)
            if not path:
                return False, f"ConversiÃ³n {source_format} â†’ {target_format} no implementada aÃºn"

            temp_files = []
            current_input = input_path

            try:
                for i in range(len(path) - 1):
                    src_fmt = path[i]
                    dst_fmt = path[i + 1]
                    step_method = self.conversion_methods.get((src_fmt, dst_fmt))
                    if not step_method:
                        return False, f"ConversiÃ³n {src_fmt} â†’ {dst_fmt} no implementada"

                    if src_fmt in TEXT_EXTENSIONS:
                        log_entry = normalize_to_utf8(current_input)
                        logs.append(
                            f"normalized:{log_entry.get('from')}->{log_entry.get('to')}"
                        )

                    if i == len(path) - 2:
                        current_output = output_path
                    else:
                        fd, current_output = tempfile.mkstemp(suffix=f'.{dst_fmt}')
                        os.close(fd)
                        temp_files.append(current_output)

                    success, msg = step_method(current_input, current_output)
                    logs.append(f"{src_fmt}->{dst_fmt}: {msg}")
                    if not success:
                        return False, f"Fallo en {src_fmt}->{dst_fmt}: {msg}"

                    current_input = current_output

                return True, " | ".join(logs)
            finally:
                for tmp in temp_files:
                    if os.path.exists(tmp):
                        os.remove(tmp)
        except Exception as e:
            return False, f"Error durante la conversiÃ³n: {str(e)}"

    def convert_batch(self, tasks):
        """Procesa un lote de conversiones."""
        results = []
        for task in tasks:
            conversion_id = task.get('conversion_id')
            if conversion_id is not None:
                emit_progress(conversion_id, Phase.PREPROCESS, 0)
                emit_progress(conversion_id, Phase.PREPROCESS, 100)
                emit_progress(conversion_id, Phase.CONVERT, 0)

            success, message = self.convert_file(
                task['input_path'],
                task['output_path'],
                task.get('source_format') or task['input_path'].split('.')[-1],
                task['target_format']
            )

            if conversion_id is not None:
                emit_progress(conversion_id, Phase.CONVERT, 100)
                emit_progress(conversion_id, Phase.POSTPROCESS, 0)
                emit_progress(conversion_id, Phase.POSTPROCESS, 100)

            results.append({
                'input_path': task['input_path'],
                'output_path': task['output_path'],
                'success': success,
                'message': message
            })
        return results

    async def convert_with_ai_optimization(self, input_path, output_path, source_format, target_format,
                                         optimization_type='balanced'):
        """Conversión con optimización IA"""
        try:
            # Importar servicios de IA (lazy loading para evitar errores de importación circular)
            from src.services.ai_conversion_engine import ai_conversion_engine
            from src.services.intelligent_conversion_sequences import intelligent_sequences

            if not self.ai_enabled:
                # Fallback a conversión estándar
                return self.convert_file(input_path, output_path, source_format, target_format)

            # Análisis IA del archivo
            filename = os.path.basename(input_path)
            file_analysis = await ai_conversion_engine.analyze_file_with_ai(input_path, filename)

            # Obtener rutas de conversión optimizadas
            conversion_paths = await ai_conversion_engine.get_optimal_conversion_paths(
                source_format, target_format, file_analysis
            )

            if not conversion_paths:
                # Fallback a conversión estándar
                return self.convert_file(input_path, output_path, source_format, target_format)

            # Seleccionar ruta basada en tipo de optimización
            if optimization_type == 'quality':
                selected_path = max(conversion_paths, key=lambda p: p.quality_score)
            elif optimization_type == 'speed':
                selected_path = max(conversion_paths, key=lambda p: p.speed_score)
            else:  # balanced
                selected_path = max(conversion_paths, key=lambda p:
                    (p.quality_score * 0.5 + p.speed_score * 0.3 + p.ai_confidence * 0.2))

            # Ejecutar secuencia inteligente si tiene pasos intermedios
            if selected_path.intermediate_steps:
                sequence_result = await intelligent_sequences.execute_intelligent_sequence(
                    input_path, target_format, selected_path
                )

                if sequence_result.success:
                    # Mover resultado final a la ruta de salida
                    import shutil
                    shutil.move(sequence_result.final_output_path, output_path)
                    return True, f"Conversión IA exitosa: {selected_path.description}"
                else:
                    return False, f"Error en secuencia IA: {sequence_result.error_message}"
            else:
                # Conversión directa optimizada
                return self.convert_file(input_path, output_path, source_format, target_format)

        except Exception as e:
            print(f"Error en conversión IA: {e}")
            # Fallback a conversión estándar
            return self.convert_file(input_path, output_path, source_format, target_format)


conversion_engine = ConversionEngine()


def validate_and_classify(*args, **kwargs):
    return True, {}

