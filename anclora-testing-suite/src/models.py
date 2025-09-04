# src/models.py - Modelos de datos para el sistema de testing
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, List, Dict, Any, Union, Tuple
from dataclasses import dataclass, field
from enum import Enum
import uuid
import json

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class TestStatus(Enum):
    """Estados posibles de un test"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"
    TIMEOUT = "timeout"

class TestPriority(Enum):
    """Prioridades de test"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

@dataclass
class TestCase:
    """Definición de un caso de test individual"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    description: str = ""
    source_format: str = ""
    target_format: str = ""
    input_file_path: Optional[Path] = None
    category: str = ""
    priority: TestPriority = TestPriority.MEDIUM
    timeout: int = 300
    expected_success: bool = True
    
    # Configuraciones especiales
    validate_quality: bool = False
    test_error_handling: bool = False
    expected_output_size_range: Optional[Tuple[int, int]] = None
    retry_attempts: int = 3
    
    # Metadata
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convertir a diccionario para serialización"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "source_format": self.source_format,
            "target_format": self.target_format,
            "input_file_path": str(self.input_file_path) if self.input_file_path else None,
            "category": self.category,
            "priority": self.priority.value,
            "timeout": self.timeout,
            "expected_success": self.expected_success,
            "validate_quality": self.validate_quality,
            "test_error_handling": self.test_error_handling,
            "metadata": self.metadata
        }

@dataclass
class SequentialTestCase:
    """Test case para secuencias de conversión múltiple"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    description: str = ""
    conversion_steps: List[Tuple[str, str]] = field(default_factory=list)  # [(source, target), ...]
    input_file_path: Optional[Path] = None
    category: str = "sequential"
    priority: TestPriority = TestPriority.HIGH
    timeout: int = 600
    expected_success: bool = True
    validate_each_step: bool = False
    
    @property
    def source_format(self) -> str:
        """Formato de origen de la secuencia"""
        return self.conversion_steps[0][0] if self.conversion_steps else ""
    
    @property
    def target_format(self) -> str:
        """Formato de destino final de la secuencia"""
        return self.conversion_steps[-1][1] if self.conversion_steps else ""
    
    def to_dict(self) -> Dict[str, Any]:
        """Convertir a diccionario"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "conversion_steps": self.conversion_steps,
            "input_file_path": str(self.input_file_path) if self.input_file_path else None,
            "category": self.category,
            "priority": self.priority.value,
            "timeout": self.timeout,
            "expected_success": self.expected_success,
            "validate_each_step": self.validate_each_step
        }

@dataclass
class TestResult:
    """Resultado de ejecución de un test"""
    test_id: str = ""
    test_case: Optional[Union[TestCase, SequentialTestCase]] = None
    status: TestStatus = TestStatus.PENDING
    success: bool = False
    execution_time: float = 0.0
    
    # Archivos y tamaños
    output_file_path: Optional[Path] = None
    file_size_input: Optional[int] = None
    file_size_output: Optional[int] = None
    
    # Calidad y métricas
    quality_metrics: Dict[str, float] = field(default_factory=dict)
    performance_metrics: Dict[str, Any] = field(default_factory=dict)
    
    # Errores
    error_message: Optional[str] = None
    error_details: Dict[str, Any] = field(default_factory=dict)
    
    # Timestamps
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convertir a diccionario"""
        return {
            "test_id": self.test_id,
            "status": self.status.value,
            "success": self.success,
            "execution_time": self.execution_time,
            "output_file_path": str(self.output_file_path) if self.output_file_path else None,
            "file_size_input": self.file_size_input,
            "file_size_output": self.file_size_output,
            "quality_metrics": self.quality_metrics,
            "performance_metrics": self.performance_metrics,
            "error_message": self.error_message,
            "error_details": self.error_details,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }

@dataclass
class TestSuiteResult:
    """Resultado de ejecución de una suite completa"""
    suite_name: str = ""
    total_tests: int = 0
    passed_tests: int = 0
    failed_tests: int = 0
    skipped_tests: int = 0
    execution_time: float = 0.0
    test_results: List[TestResult] = field(default_factory=list)
    
    @property
    def success_rate(self) -> float:
        """Calcular tasa de éxito"""
        if self.total_tests == 0:
            return 0.0
        return self.passed_tests / self.total_tests
    
    def to_dict(self) -> Dict[str, Any]:
        """Convertir a diccionario"""
        return {
            "suite_name": self.suite_name,
            "total_tests": self.total_tests,
            "passed_tests": self.passed_tests,
            "failed_tests": self.failed_tests,
            "skipped_tests": self.skipped_tests,
            "execution_time": self.execution_time,
            "success_rate": self.success_rate,
            "test_results": [result.to_dict() for result in self.test_results]
        }

# Modelos SQLAlchemy para persistencia

class TestRun(Base):
    """Modelo para almacenar ejecuciones de tests"""
    __tablename__ = 'test_runs'
    
    id = Column(Integer, primary_key=True)
    test_id = Column(String(50), nullable=False)
    test_name = Column(String(255), nullable=False)
    test_suite = Column(String(50), nullable=False)
    source_format = Column(String(20), nullable=False)
    target_format = Column(String(20), nullable=False)
    
    # Información del archivo
    original_filename = Column(String(255))
    file_size_mb = Column(Float)
    
    # Resultados
    status = Column(String(20), nullable=False)
    success = Column(Boolean, nullable=False)
    execution_time_seconds = Column(Float)
    error_message = Column(Text)
    
    # Métricas
    output_size_mb = Column(Float)
    quality_score = Column(Float)
    performance_data = Column(JSON)
    
    # Metadata
    test_timestamp = Column(DateTime, default=datetime.utcnow)
    anclora_version = Column(String(20))
    test_environment = Column(String(50), default="development")

class ConversionMetrics(Base):
    """Métricas agregadas por tipo de conversión"""
    __tablename__ = 'conversion_metrics'
    
    id = Column(Integer, primary_key=True)
    conversion_pair = Column(String(50), nullable=False, unique=True)  # "docx_to_pdf"
    
    # Estadísticas
    total_tests = Column(Integer, default=0)
    successful_tests = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)
    
    avg_execution_time = Column(Float, default=0.0)
    avg_quality_score = Column(Float, default=0.0)
    avg_file_size_reduction = Column(Float, default=0.0)
    
    # Timestamps
    last_updated = Column(DateTime, default=datetime.utcnow)
    last_test_run = Column(DateTime)

class SystemHealth(Base):
    """Estado de salud del sistema"""
    __tablename__ = 'system_health'
    
    id = Column(Integer, primary_key=True)
    check_timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Estado de Anclora Nexus
    anclora_api_status = Column(String(20), nullable=False)
    anclora_response_time_ms = Column(Float)
    anclora_version = Column(String(20))
    
    # Métricas del sistema de testing
    total_fixtures_available = Column(Integer, default=0)
    active_test_runs = Column(Integer, default=0)
    failed_tests_last_hour = Column(Integer, default=0)
    
    # Configuración actual
    parallel_workers = Column(Integer)
    timeout_seconds = Column(Integer)

# Factory para crear la base de datos
def create_database(database_url: str = "sqlite:///testing_metrics.db"):
    """Crear base de datos y retornar engine y session"""
    engine = create_engine(database_url, echo=False)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    return engine, Session

# Clases auxiliares para reportes

@dataclass
class OverallStats:
    """Estadísticas generales del testing"""
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    total_tests: int = 0
    total_passed: int = 0
    total_failed: int = 0
    total_skipped: int = 0
    execution_time: float = 0.0
    
    @property
    def overall_success_rate(self) -> float:
        """Tasa de éxito general"""
        if self.total_tests == 0:
            return 0.0
        return self.total_passed / self.total_tests
    
    def to_dict(self) -> Dict[str, Any]:
        """Convertir a diccionario"""
        return {
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "total_tests": self.total_tests,
            "total_passed": self.total_passed,
            "total_failed": self.total_failed,
            "total_skipped": self.total_skipped,
            "execution_time": self.execution_time,
            "overall_success_rate": self.overall_success_rate
        }

@dataclass
class TestReport:
    """Reporte completo de testing"""
    suite_results: Dict[str, TestSuiteResult] = field(default_factory=dict)
    overall_stats: OverallStats = field(default_factory=OverallStats)
    generated_at: datetime = field(default_factory=datetime.now)
    config_snapshot: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convertir a diccionario completo"""
        return {
            "suite_results": {name: suite.to_dict() for name, suite in self.suite_results.items()},
            "overall_stats": self.overall_stats.to_dict(),
            "generated_at": self.generated_at.isoformat(),
            "config_snapshot": self.config_snapshot
        }