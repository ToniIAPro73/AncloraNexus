# src/ui/mockups.py - Datos simulados realistas para el dashboard
import random
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any
import pandas as pd

class MockupDataGenerator:
    """Generador de datos simulados realistas para el dashboard"""
    
    def __init__(self):
        self.conversion_types = [
            "PDF → PNG", "DOCX → PDF", "TXT → HTML", "CSV → JSON", "PNG → JPG",
            "SVG → PNG", "HTML → PDF", "JSON → CSV", "ZIP → TAR", "EPUB → PDF",
            "XLS → CSV", "RTF → DOCX", "GIF → MP4", "WEBP → PNG", "MD → HTML"
        ]
        
        self.file_categories = {
            "documents": ["pdf", "docx", "txt", "html", "rtf", "md"],
            "images": ["png", "jpg", "gif", "svg", "webp", "bmp"],
            "data": ["csv", "json", "xml", "xlsx", "yaml"],
            "sequential": ["zip", "tar", "gz", "rar"],
            "integration": ["epub", "mobi", "azw3"]
        }
        
        self.error_types = [
            "Timeout en conversión", "Formato no soportado", "Archivo corrupto",
            "Memoria insuficiente", "Error de encoding", "Permisos denegados",
            "Tamaño excesivo", "Dependencia faltante"
        ]

    def generate_system_metrics(self) -> Dict[str, Any]:
        """Generar métricas del sistema en tiempo real"""
        return {
            "total_tests": random.randint(680, 750),
            "success_rate": round(random.uniform(85.0, 95.0), 1),
            "avg_execution_time": round(random.uniform(2.8, 4.2), 1),
            "active_workers": random.randint(4, 8),
            "queue_size": random.randint(0, 15),
            "memory_usage": round(random.uniform(45.0, 78.0), 1),
            "cpu_usage": round(random.uniform(35.0, 85.0), 1),
            "disk_usage": round(random.uniform(25.0, 65.0), 1),
            "network_latency": round(random.uniform(12.0, 45.0), 1)
        }

    def generate_suite_results(self) -> Dict[str, Dict[str, int]]:
        """Generar resultados por suite de testing"""
        suites = {}
        
        for suite_name, total_tests in [
            ("documents", random.randint(280, 320)),
            ("images", random.randint(180, 220)),
            ("data", random.randint(40, 60)),
            ("sequential", random.randint(100, 130)),
            ("integration", random.randint(70, 90))
        ]:
            success_rate = random.uniform(0.75, 0.95)
            passed = int(total_tests * success_rate)
            failed = total_tests - passed
            
            suites[suite_name] = {
                "total": total_tests,
                "passed": passed,
                "failed": failed,
                "success_rate": round(success_rate * 100, 1),
                "avg_time": round(random.uniform(1.5, 5.0), 1)
            }
        
        return suites

    def generate_test_details(self, count: int = 50) -> List[Dict[str, Any]]:
        """Generar detalles de tests individuales"""
        tests = []
        
        for i in range(count):
            suite = random.choice(list(self.file_categories.keys()))
            conversion = random.choice(self.conversion_types)
            status_weights = [0.85, 0.12, 0.03]  # exitoso, fallido, en progreso
            status = random.choices(
                ["✅ Exitoso", "❌ Fallido", "🔄 En Progreso"],
                weights=status_weights
            )[0]
            
            test = {
                "id": f"{suite.upper()[:3]}_{i+1:03d}",
                "name": conversion,
                "suite": suite.title(),
                "status": status,
                "time": f"{random.uniform(0.5, 8.0):.1f}s",
                "priority": random.choice(["Alta", "Media", "Baja"]),
                "file_size": f"{random.randint(10, 5000)} KB",
                "timestamp": (datetime.now() - timedelta(minutes=random.randint(0, 1440))).strftime("%H:%M:%S"),
                "error_message": random.choice(self.error_types) if "❌" in status else None
            }
            tests.append(test)
        
        return tests

    def generate_historical_data(self, days: int = 30) -> Dict[str, List]:
        """Generar datos históricos para gráficos temporales"""
        dates = []
        success_rates = []
        execution_times = []
        test_volumes = []
        error_counts = []
        
        base_success = 88.0
        base_time = 3.2
        base_volume = 650
        
        for i in range(days):
            date = (datetime.now() - timedelta(days=days-i-1)).strftime("%Y-%m-%d")
            dates.append(date)
            
            # Simular tendencias realistas
            trend_factor = 1 + (i / days) * 0.1  # Mejora gradual
            noise = random.uniform(-0.05, 0.05)
            
            success_rate = max(75, min(98, base_success * trend_factor + noise * 10))
            exec_time = max(1.5, base_time / trend_factor + noise * 2)
            volume = max(400, int(base_volume * (1 + noise * 0.3)))
            errors = max(0, int(volume * (1 - success_rate/100)))
            
            success_rates.append(round(success_rate, 1))
            execution_times.append(round(exec_time, 1))
            test_volumes.append(volume)
            error_counts.append(errors)
        
        return {
            "dates": dates,
            "success_rates": success_rates,
            "execution_times": execution_times,
            "test_volumes": test_volumes,
            "error_counts": error_counts
        }

    def generate_competitive_data(self) -> Dict[str, List]:
        """Generar datos de análisis competitivo"""
        return {
            "tools": ["Anclora Nexus", "Convertio", "CloudConvert", "OnlineConvert", "Zamzar"],
            "formats_supported": [45, 200, 218, 150, 1200],
            "speed_files_per_min": [120, 80, 95, 60, 40],
            "accuracy_percent": [94.5, 89.2, 91.8, 87.3, 85.1],
            "cost_per_month": [0, 10, 25, 15, 20],
            "max_file_size_mb": [100, 100, 1000, 100, 50],
            "privacy_score": [100, 70, 75, 65, 60],  # 100 = completamente privado
            "api_available": [True, True, True, False, True]
        }

    def generate_fixture_status(self) -> Dict[str, Any]:
        """Generar estado de fixtures"""
        fixtures = {}
        total_files = 0
        
        for category, extensions in self.file_categories.items():
            file_count = random.randint(15, 45)
            total_files += file_count
            
            fixtures[category] = {
                "count": file_count,
                "extensions": extensions,
                "last_generated": (datetime.now() - timedelta(hours=random.randint(1, 72))).strftime("%Y-%m-%d %H:%M"),
                "size_mb": round(random.uniform(5.0, 50.0), 1),
                "status": random.choice(["✅ Actualizado", "⚠️ Desactualizado", "🔄 Generando"])
            }
        
        return {
            "categories": fixtures,
            "total_files": total_files,
            "total_size_mb": round(sum(f["size_mb"] for f in fixtures.values()), 1),
            "last_full_generation": (datetime.now() - timedelta(days=random.randint(1, 7))).strftime("%Y-%m-%d"),
            "generation_time_estimate": f"{random.randint(3, 12)} minutos"
        }

    def generate_error_analysis(self) -> Dict[str, Any]:
        """Generar análisis de errores"""
        error_data = {}
        
        for error_type in self.error_types:
            error_data[error_type] = {
                "count": random.randint(1, 25),
                "percentage": round(random.uniform(2.0, 15.0), 1),
                "trend": random.choice(["📈 Aumentando", "📉 Disminuyendo", "➡️ Estable"]),
                "last_occurrence": (datetime.now() - timedelta(hours=random.randint(1, 48))).strftime("%H:%M")
            }
        
        return error_data

    def generate_performance_metrics(self) -> Dict[str, Any]:
        """Generar métricas de rendimiento detalladas"""
        return {
            "throughput": {
                "files_per_second": round(random.uniform(1.8, 3.2), 1),
                "mb_per_second": round(random.uniform(12.0, 28.0), 1),
                "peak_throughput": round(random.uniform(4.0, 6.5), 1)
            },
            "resource_usage": {
                "avg_cpu_percent": round(random.uniform(45.0, 75.0), 1),
                "peak_cpu_percent": round(random.uniform(85.0, 98.0), 1),
                "avg_memory_mb": random.randint(512, 1024),
                "peak_memory_mb": random.randint(1024, 2048)
            },
            "quality_metrics": {
                "conversion_accuracy": round(random.uniform(92.0, 97.0), 1),
                "file_integrity_score": round(random.uniform(95.0, 99.5), 1),
                "format_compliance": round(random.uniform(88.0, 96.0), 1)
            }
        }

    def generate_real_time_activity(self) -> List[Dict[str, Any]]:
        """Generar actividad en tiempo real"""
        activities = []
        
        for i in range(10):
            activity = {
                "timestamp": (datetime.now() - timedelta(seconds=random.randint(0, 300))).strftime("%H:%M:%S"),
                "action": random.choice([
                    "Conversión completada", "Test iniciado", "Fixture generado",
                    "Error detectado", "Suite finalizada", "Reporte generado"
                ]),
                "details": random.choice(self.conversion_types),
                "status": random.choice(["✅", "❌", "🔄", "⚠️"]),
                "duration": f"{random.uniform(0.5, 8.0):.1f}s"
            }
            activities.append(activity)
        
        return activities

# Instancia global del generador
mockup_generator = MockupDataGenerator()
