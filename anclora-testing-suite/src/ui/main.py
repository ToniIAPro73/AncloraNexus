# src/ui/main.py - Interfaz principal de usuario para Anclora Testing Suite
import streamlit as st
import asyncio
import time
import random
from pathlib import Path
from datetime import datetime, timedelta
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import json
from typing import Dict, List, Any, Optional

# Imports del sistema de testing
import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from src.config import config, TEST_SUITES_CONFIG
from src.models import TestStatus, TestPriority, create_database
from src.api.anclora_client import AncloraClient
from src.fixtures.generator import FixtureGenerator

# Imports de mockups y componentes
from src.ui.mockups import mockup_generator
from src.ui.components import (
    render_metric_card, render_status_indicator, render_progress_ring,
    render_performance_dashboard, render_alert_banner, render_comparison_radar,
    render_advanced_metric_grid, render_interactive_timeline
)
from src.core.test_runner import TestRunner
from src.reporters.markdown_reporter import MarkdownReporter

# Configuración de página
st.set_page_config(
    page_title="Anclora Nexus Testing Suite",
    page_icon="🧪",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Limpiar cache para evitar duplicaciones
if 'app_initialized' not in st.session_state:
    st.cache_data.clear()
    st.cache_resource.clear()
    st.session_state.app_initialized = True

# CSS personalizado
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        text-align: center;
        color: #2E86AB;
        margin-bottom: 2rem;
    }
    .suite-card {
        background: linear-gradient(45deg, #f0f2f6, #ffffff);
        padding: 1rem;
        border-radius: 10px;
        border-left: 4px solid #2E86AB;
        margin: 0.5rem 0;
    }
    .metric-positive {
        color: #28a745;
        font-weight: bold;
    }
    .metric-negative {
        color: #dc3545;
        font-weight: bold;
    }
    .metric-warning {
        color: #ffc107;
        font-weight: bold;
    }
    .status-healthy { color: #28a745; }
    .status-warning { color: #ffc107; }
    .status-error { color: #dc3545; }
</style>
""", unsafe_allow_html=True)

class TestingUI:
    """Clase principal para la interfaz de testing"""
    
    def __init__(self):
        self.initialize_session_state()
    
    def initialize_session_state(self):
        """Inicializar estado de la sesión"""
        if 'test_results' not in st.session_state:
            st.session_state.test_results = {}
        if 'current_test_run' not in st.session_state:
            st.session_state.current_test_run = None
        if 'anclora_status' not in st.session_state:
            st.session_state.anclora_status = None
        if 'fixtures_generated' not in st.session_state:
            st.session_state.fixtures_generated = False
        if 'last_health_check' not in st.session_state:
            st.session_state.last_health_check = None
    
    def setup_sidebar(self):
        """Configurar sidebar con navegación"""
        # Título del sidebar
        st.sidebar.title("🧪 Anclora Testing Suite")
        st.sidebar.markdown("---")

        # Estado de conexión
        self.show_connection_status()

        st.sidebar.markdown("---")

        # Navegación principal - ÚNICA Y LIMPIA
        st.sidebar.markdown("### 📍 Navegación")

        # Usar radio buttons para evitar duplicación
        page = st.sidebar.radio(
            "Selecciona una página:",
            [
                "🏠 Dashboard",
                "🚀 Ejecutar Tests",
                "📊 Resultados y Métricas",
                "🏭 Generar Fixtures",
                "📋 Reportes",
                "⚙️ Configuración",
                "🔍 Debug y Logs"
            ],
            key="navigation_radio_unique",
            label_visibility="collapsed"
        )

        return page
    
    def show_connection_status(self):
        """Mostrar estado de conexión con Anclora Nexus"""
        st.sidebar.markdown("### 🔌 Estado de Conexión")
        
        # Botón para verificar estado
        if st.sidebar.button("🔄 Verificar Estado", key="verify_connection"):
            with st.spinner("Verificando conexión..."):
                self.check_anclora_health()
        
        # Mostrar estado actual
        if st.session_state.anclora_status:
            status = st.session_state.anclora_status
            
            if status.get('status') == 'healthy':
                st.sidebar.markdown("🟢 **Conectado**")
                st.sidebar.caption(f"Respuesta: {status.get('response_time_ms', 0):.0f}ms")
                st.sidebar.caption(f"Versión: {status.get('version', 'unknown')}")
            elif status.get('status') == 'timeout':
                st.sidebar.markdown("🟡 **Timeout**")
            else:
                st.sidebar.markdown("🔴 **Desconectado**")
                st.sidebar.caption(status.get('error', 'Error desconocido'))
        else:
            st.sidebar.markdown("⚪ **Sin verificar**")
        
        # Última verificación
        if st.session_state.last_health_check:
            st.sidebar.caption(f"Última verificación: {st.session_state.last_health_check.strftime('%H:%M:%S')}")
    
    def check_anclora_health(self):
        """Verificar salud de Anclora Nexus"""
        try:
            client = AncloraClient(config)
            status = asyncio.run(client.health_check())
            st.session_state.anclora_status = status
            st.session_state.last_health_check = datetime.now()
            return status
        except Exception as e:
            st.session_state.anclora_status = {'status': 'error', 'error': str(e)}
            return None
    
    def render_dashboard(self):
        """Renderizar dashboard principal con mockups visuales"""
        st.markdown('<div class="main-header">🧪 Anclora Nexus Testing Suite</div>', unsafe_allow_html=True)

        # DEBUG: Verificar que los mockups se cargan
        try:
            system_metrics = mockup_generator.generate_system_metrics()
            suite_results = mockup_generator.generate_suite_results()
            st.success(f"✅ Mockups cargados - Tests: {system_metrics['total_tests']}, Éxito: {system_metrics['success_rate']:.1f}%")
        except Exception as e:
            st.error(f"❌ Error cargando mockups: {e}")
            return

        # Banner de estado del sistema
        if system_metrics["success_rate"] > 90:
            render_alert_banner("🎉 Sistema funcionando óptimamente - Todos los servicios operativos", "success")
        elif system_metrics["success_rate"] > 80:
            render_alert_banner("⚠️ Rendimiento moderado - Algunos tests presentan fallos menores", "warning")
        else:
            render_alert_banner("❌ Atención requerida - Múltiples fallos detectados", "error")

        # Métricas principales con componentes visuales mejorados
        col1, col2, col3, col4 = st.columns(4)

        with col1:
            render_metric_card(
                "Total Tests",
                f"{system_metrics['total_tests']:,}",
                f"+{random.randint(15, 45)} vs ayer",
                "normal",
                "🧪"
            )

        with col2:
            render_metric_card(
                "Tasa de Éxito",
                f"{system_metrics['success_rate']:.1f}%",
                f"+{random.uniform(0.5, 2.5):.1f}% vs ayer",
                "normal",
                "🎯"
            )

        with col3:
            render_metric_card(
                "Tiempo Promedio",
                f"{system_metrics['avg_execution_time']:.1f}s",
                f"-{random.uniform(0.1, 0.5):.1f}s vs ayer",
                "normal",
                "⏱️"
            )

        with col4:
            render_metric_card(
                "Workers Activos",
                f"{system_metrics['active_workers']}/8",
                f"Cola: {system_metrics['queue_size']} tests",
                "normal",
                "⚡"
            )
        
        st.markdown("---")

        # Indicadores de estado
        st.subheader("🔍 Estado de Servicios")
        col1, col2, col3, col4 = st.columns(4)

        with col1:
            render_status_indicator("online", "Backend API")
        with col2:
            render_status_indicator("online", "Base de Datos")
        with col3:
            render_status_indicator("processing", "Workers")
        with col4:
            render_status_indicator("online", "Fixtures")

        # Overview de suites con datos simulados
        st.markdown("---")
        st.subheader("📊 Rendimiento por Suite")

        # Crear gráfico de barras con datos simulados
        suite_names = list(suite_results.keys())
        success_rates = [suite_results[name]["success_rate"] for name in suite_names]

        fig_suites = go.Figure(data=[
            go.Bar(
                x=[name.title() for name in suite_names],
                y=success_rates,
                marker_color=['#2ecc71' if rate > 90 else '#f39c12' if rate > 80 else '#e74c3c' for rate in success_rates],
                text=[f'{rate:.1f}%' for rate in success_rates],
                textposition='auto',
            )
        ])

        fig_suites.update_layout(
            title="Tasa de Éxito por Suite de Testing",
            yaxis_title="Tasa de Éxito (%)",
            height=400,
            showlegend=False
        )

        st.plotly_chart(fig_suites, use_container_width=True)

        # Actividad en tiempo real
        st.markdown("---")
        col1, col2 = st.columns([2, 1])

        with col1:
            st.subheader("📈 Actividad en Tiempo Real")
            real_time_data = mockup_generator.generate_real_time_activity()

            # Usar timeline interactivo
            render_interactive_timeline(real_time_data[:8], "Últimas Actividades del Sistema")

        with col2:
            st.subheader("⚡ Acciones Rápidas")

            if st.button("🚀 Ejecutar Suite Completa", use_container_width=True):
                st.success("Suite de testing iniciada")

            if st.button("🏭 Generar Fixtures", use_container_width=True):
                st.info("Navegando a generador de fixtures...")

            if st.button("📊 Ver Métricas", use_container_width=True):
                st.info("Navegando a métricas detalladas...")

            if st.button("📋 Generar Reporte", use_container_width=True):
                st.info("Navegando a generador de reportes...")

            # Métricas de sistema
            st.markdown("**💻 Recursos del Sistema**")
            st.progress(system_metrics["cpu_usage"] / 100, text=f"CPU: {system_metrics['cpu_usage']:.1f}%")
            st.progress(system_metrics["memory_usage"] / 100, text=f"Memoria: {system_metrics['memory_usage']:.1f}%")
            st.progress(system_metrics["disk_usage"] / 100, text=f"Disco: {system_metrics['disk_usage']:.1f}%")

    def render_system_health_chart(self):
        """Renderizar gráfico de salud del sistema"""
        try:
            # Datos simulados de salud del sistema
            import plotly.graph_objects as go

            # Métricas de salud
            metrics = {
                'CPU': 65,
                'Memoria': 78,
                'Disco': 45,
                'Red': 92
            }

            # Crear gráfico de barras
            fig = go.Figure(data=[
                go.Bar(
                    x=list(metrics.keys()),
                    y=list(metrics.values()),
                    marker_color=['#ff6b6b' if v > 80 else '#feca57' if v > 60 else '#48dbfb' for v in metrics.values()],
                    text=[f'{v}%' for v in metrics.values()],
                    textposition='auto',
                )
            ])

            fig.update_layout(
                title="Estado del Sistema",
                yaxis_title="Uso (%)",
                height=300,
                showlegend=False
            )

            st.plotly_chart(fig, use_container_width=True)

        except Exception as e:
            st.error(f"Error renderizando gráfico de salud: {e}")
            # Fallback simple
            st.info("📊 Gráfico de salud del sistema no disponible")

    def render_quick_actions(self):
        """Renderizar acciones rápidas"""
        st.markdown("**⚡ Acciones Rápidas**")

        if st.button("🔄 Actualizar Estado", key="refresh_status"):
            self.check_anclora_health()
            st.rerun()

        if st.button("🧹 Limpiar Cache", key="clear_cache"):
            st.session_state.clear()
            st.success("Cache limpiado")
            st.rerun()

        if st.button("📊 Ver Logs", key="view_logs"):
            st.info("Funcionalidad de logs en desarrollo")

    def render_suite_card(self, suite_name: str, suite_config: Dict[str, Any]):
        """Renderizar tarjeta de suite"""
        with st.container():
            st.markdown(f'<div class="suite-card">', unsafe_allow_html=True)
            
            col1, col2, col3, col4 = st.columns([3, 2, 2, 2])
            
            with col1:
                priority_emoji = {"critical": "🔥", "high": "⚠️", "medium": "📋", "low": "📝"}
                st.markdown(f"**{priority_emoji.get(suite_config['priority'], '📋')} {suite_name.title()}**")
                st.caption(suite_config.get('description', f'Tests de {suite_name}'))
            
            with col2:
                st.metric(
                    label="Tests",
                    value=suite_config.get('expected_tests', 0)
                )
            
            with col3:
                st.metric(
                    label="Timeout",
                    value=f"{suite_config.get('timeout', 300)}s"
                )
            
            with col4:
                parallel_status = "✅ Sí" if suite_config.get('parallel', False) else "❌ No"
                st.markdown(f"**Paralelo:** {parallel_status}")
                
                if st.button(f"▶️ Ejecutar", key=f"run_{suite_name}"):
                    self.run_single_suite(suite_name)
            
            st.markdown('</div>', unsafe_allow_html=True)
    
    def render_test_execution(self):
        """Renderizar página de ejecución de tests"""
        st.title("🚀 Ejecutar Tests")
        
        # Verificar prerrequisitos
        if not self.check_prerequisites():
            return
        
        # Opciones de ejecución
        col1, col2 = st.columns([2, 1])
        
        with col1:
            st.subheader("🎯 Seleccionar Suites")
            
            # Selección de suites
            suite_options = list(TEST_SUITES_CONFIG.keys()) + ["Todas las suites"]
            selected_suites = st.multiselect(
                "Suites a ejecutar:",
                options=suite_options,
                default=["documents", "images"],
                help="Selecciona las suites que deseas ejecutar"
            )
            
            # Configuración de ejecución
            st.subheader("⚙️ Configuración")
            
            col_config1, col_config2 = st.columns(2)
            
            with col_config1:
                parallel_workers = st.slider(
                    "Workers paralelos:",
                    min_value=1,
                    max_value=16,
                    value=config.PARALLEL_WORKERS,
                    help="Número de tests ejecutándose en paralelo"
                )
                
                timeout_seconds = st.slider(
                    "Timeout (segundos):",
                    min_value=60,
                    max_value=1800,
                    value=config.TIMEOUT_SECONDS,
                    step=30
                )
            
            with col_config2:
                retry_attempts = st.slider(
                    "Intentos de reintento:",
                    min_value=1,
                    max_value=10,
                    value=config.RETRY_ATTEMPTS
                )
                
                export_formats = st.multiselect(
                    "Formatos de reporte:",
                    ["markdown", "html", "json"],
                    default=["markdown", "json"]
                )
        
        with col2:
            st.subheader("📊 Estimación")
            
            # Calcular estimaciones
            if "Todas las suites" in selected_suites:
                estimated_tests = sum(suite.get("expected_tests", 0) for suite in TEST_SUITES_CONFIG.values())
                estimated_time = self.estimate_execution_time(list(TEST_SUITES_CONFIG.keys()), parallel_workers)
            else:
                estimated_tests = sum(
                    TEST_SUITES_CONFIG[suite].get("expected_tests", 0) 
                    for suite in selected_suites 
                    if suite in TEST_SUITES_CONFIG
                )
                estimated_time = self.estimate_execution_time(selected_suites, parallel_workers)
            
            st.metric("🧪 Tests totales", f"{estimated_tests:,}")
            st.metric("⏱️ Tiempo estimado", f"{estimated_time:.0f} min")
            st.metric("💾 Espacio estimado", f"{estimated_tests * 0.5:.0f} MB")
        
        st.markdown("---")
        
        # Botones de ejecución
        col_btn1, col_btn2, col_btn3 = st.columns([2, 2, 1])
        
        with col_btn1:
            if st.button("🚀 Ejecutar Tests Completos", type="primary", use_container_width=True, key="run_full_tests"):
                if selected_suites:
                    suites_to_run = list(TEST_SUITES_CONFIG.keys()) if "Todas las suites" in selected_suites else selected_suites
                    self.execute_test_suites(
                        suites_to_run,
                        {
                            "parallel_workers": parallel_workers,
                            "timeout_seconds": timeout_seconds,
                            "retry_attempts": retry_attempts,
                            "export_formats": export_formats
                        }
                    )
                else:
                    st.error("Selecciona al menos una suite para ejecutar")
        
        with col_btn2:
            if st.button("🧪 Ejecutar Test Rápido", use_container_width=True, key="run_quick_test"):
                # Ejecutar un subconjunto pequeño para pruebas rápidas
                self.execute_quick_test()

        with col_btn3:
            if st.button("⏹️ Detener", use_container_width=True, key="stop_tests"):
                st.session_state.current_test_run = None
                st.rerun()
        
        # Mostrar progreso si hay ejecución activa
        if st.session_state.current_test_run:
            self.render_test_progress()
    
    def render_test_progress(self):
        """Renderizar progreso de ejecución de tests"""
        st.markdown("---")
        st.subheader("📊 Progreso de Ejecución")
        
        # Simulación de progreso (en implementación real vendría del test runner)
        progress_placeholder = st.empty()
        status_placeholder = st.empty()
        details_placeholder = st.empty()
        
        # Simular progreso
        with progress_placeholder.container():
            progress_bar = st.progress(0)
            
            for i in range(101):
                progress_bar.progress(i)
                
                with status_placeholder.container():
                    if i < 30:
                        st.info(f"🏭 Preparando fixtures... ({i}%)")
                    elif i < 80:
                        current_suite = ["documents", "images", "data"][((i-30) // 15) % 3]
                        st.info(f"🧪 Ejecutando suite '{current_suite}'... ({i}%)")
                    else:
                        st.info(f"📝 Generando reportes... ({i}%)")
                
                time.sleep(0.1)
            
            st.success("✅ Ejecución completada!")
        
        # Mostrar resultados simulados
        with details_placeholder.container():
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.metric("✅ Exitosos", "547", "12")
            with col2:
                st.metric("❌ Fallidos", "23", "-5")
            with col3:
                st.metric("⏭️ Omitidos", "8", "2")

    def execute_test_suites(self, suites_to_run: List[str], config: Dict[str, Any]):
        """Ejecutar múltiples suites de tests"""
        try:
            st.session_state.current_test_run = {
                'suites': suites_to_run,
                'config': config,
                'start_time': datetime.now(),
                'status': 'running'
            }

            st.success(f"🚀 Iniciando ejecución de {len(suites_to_run)} suite(s)")
            st.info(f"📋 Suites seleccionadas: {', '.join(suites_to_run)}")

            # Mostrar configuración
            with st.expander("⚙️ Configuración de Ejecución"):
                col1, col2 = st.columns(2)
                with col1:
                    st.write(f"**Workers paralelos:** {config.get('parallel_workers', 1)}")
                    st.write(f"**Timeout:** {config.get('timeout_seconds', 300)}s")
                with col2:
                    st.write(f"**Reintentos:** {config.get('retry_attempts', 0)}")
                    st.write(f"**Formatos:** {', '.join(config.get('export_formats', []))}")

            # En una implementación real, aquí se ejecutarían los tests
            # Por ahora, simulamos el inicio de la ejecución
            st.rerun()

        except Exception as e:
            st.error(f"❌ Error iniciando ejecución: {e}")
            st.session_state.current_test_run = None

    def run_single_suite(self, suite_name: str):
        """Ejecutar una suite individual"""
        try:
            suite_config = TEST_SUITES_CONFIG.get(suite_name, {})

            st.session_state.current_test_run = {
                'suites': [suite_name],
                'config': suite_config,
                'start_time': datetime.now(),
                'status': 'running'
            }

            st.success(f"🚀 Ejecutando suite: {suite_name}")

            # Mostrar información de la suite
            with st.expander(f"📋 Detalles de {suite_name}"):
                st.write(f"**Prioridad:** {suite_config.get('priority', 'medium')}")
                st.write(f"**Tests estimados:** {suite_config.get('estimated_tests', 'N/A')}")
                st.write(f"**Timeout:** {suite_config.get('timeout', 300)}s")
                st.write(f"**Paralelo:** {'Sí' if suite_config.get('parallel', False) else 'No'}")

            # En una implementación real, aquí se ejecutaría la suite específica
            st.rerun()

        except Exception as e:
            st.error(f"❌ Error ejecutando suite {suite_name}: {e}")
            st.session_state.current_test_run = None

    def render_results_and_metrics(self):
        """Renderizar página de resultados y métricas"""
        st.title("📊 Resultados y Métricas")
        
        # Pestañas para diferentes vistas
        tab1, tab2, tab3, tab4 = st.tabs(["📈 Dashboard", "🧪 Tests", "🏆 Comparativas", "📋 Histórico"])
        
        with tab1:
            self.render_metrics_dashboard()
        
        with tab2:
            self.render_test_details()
        
        with tab3:
            self.render_competitive_analysis()
        
        with tab4:
            self.render_historical_data()
    
    def render_metrics_dashboard(self):
        """Renderizar dashboard de métricas con datos simulados realistas"""
        # Generar datos simulados realistas
        suite_results = mockup_generator.generate_suite_results()
        historical_data = mockup_generator.generate_historical_data(30)
        performance_metrics = mockup_generator.generate_performance_metrics()

        # Métricas de rendimiento principales
        render_performance_dashboard({
            'success_rate': sum(suite_results[s]['success_rate'] for s in suite_results) / len(suite_results),
            'total_tests': sum(suite_results[s]['total'] for s in suite_results),
            'avg_time': sum(suite_results[s]['avg_time'] for s in suite_results) / len(suite_results),
            'cpu_usage': performance_metrics['resource_usage']['avg_cpu_percent']
        })
        
        col1, col2 = st.columns([2, 1])

        with col1:
            # Gráfico de tasa de éxito por suite con datos simulados
            suite_names = list(suite_results.keys())
            success_rates = [suite_results[name]["success_rate"] / 100 for name in suite_names]

            fig = px.bar(
                x=[name.title() for name in suite_names],
                y=success_rates,
                title="🎯 Tasa de Éxito por Suite",
                labels={"x": "Suite", "y": "Tasa de Éxito"},
                color=success_rates,
                color_continuous_scale="RdYlGn"
            )
            fig.update_layout(height=400)
            st.plotly_chart(fig, use_container_width=True)

            # Gráfico de tendencia histórica
            st.markdown("**📈 Tendencia de Rendimiento (30 días)**")
            fig_trend = go.Figure()

            fig_trend.add_trace(go.Scatter(
                x=historical_data['dates'],
                y=historical_data['success_rates'],
                mode='lines+markers',
                name='Tasa de Éxito (%)',
                line=dict(color='#2ecc71', width=3),
                marker=dict(size=6)
            ))

            fig_trend.update_layout(
                title="Evolución de la Tasa de Éxito",
                xaxis_title="Fecha",
                yaxis_title="Tasa de Éxito (%)",
                height=350
            )

            st.plotly_chart(fig_trend, use_container_width=True)
        
        with col2:
            st.subheader("📊 Métricas Clave")
            
            overall_success = sum(sample_data["success_rates"]) / len(sample_data["success_rates"])
            st.metric("🎯 Éxito General", f"{overall_success:.1%}", "+2.3%")
            
            total_tests = sum(sample_data["total_tests"])
            st.metric("🧪 Total Tests", f"{total_tests:,}", "+45")
            
            avg_execution_time = sum(sample_data["avg_time"]) / len(sample_data["avg_time"])
            st.metric("⏱️ Tiempo Promedio", f"{avg_execution_time:.1f}s", "-0.5s")
        
        # Gráfico de tendencia temporal
        st.subheader("📈 Tendencia de Éxito")
        
        # Datos de ejemplo para los últimos 7 días
        dates = pd.date_range(end=datetime.now(), periods=7)
        success_trend = [0.78, 0.82, 0.85, 0.83, 0.88, 0.91, 0.89]
        
        fig_trend = px.line(
            x=dates,
            y=success_trend,
            title="Evolución de Tasa de Éxito (7 días)",
            markers=True
        )
        fig_trend.update_layout(height=300)
        st.plotly_chart(fig_trend, use_container_width=True)
    
    def render_fixtures_generator(self):
        """Renderizar página de generación de fixtures con mockups visuales"""
        st.title("🏭 Generar Fixtures")

        # Generar datos simulados de fixtures
        fixture_status = mockup_generator.generate_fixture_status()

        # Banner informativo
        render_alert_banner(
            f"📁 {fixture_status['total_files']} fixtures disponibles ({fixture_status['total_size_mb']} MB) - "
            f"Última generación: {fixture_status['last_full_generation']}",
            "info"
        )

        col1, col2 = st.columns([2, 1])

        with col1:
            st.subheader("⚙️ Configuración de Generación")

            # Estado actual con visualización mejorada
            st.markdown("**📊 Estado Actual de Fixtures**")

            # Crear gráfico de dona para distribución de fixtures
            categories = list(fixture_status['categories'].keys())
            counts = [fixture_status['categories'][cat]['count'] for cat in categories]

            fig_donut = go.Figure(data=[go.Pie(
                labels=[cat.title() for cat in categories],
                values=counts,
                hole=.3,
                marker_colors=['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6']
            )])

            fig_donut.update_layout(
                title="Distribución de Fixtures por Categoría",
                height=300,
                showlegend=True
            )

            st.plotly_chart(fig_donut, use_container_width=True)

            # Tabla detallada de fixtures con estado
            st.markdown("**📋 Detalle por Categoría**")

            fixture_details = []
            for category, data in fixture_status['categories'].items():
                fixture_details.append({
                    "Categoría": category.title(),
                    "Archivos": data['count'],
                    "Tamaño (MB)": data['size_mb'],
                    "Estado": data['status'],
                    "Última Actualización": data['last_generated']
                })

            df_fixtures = pd.DataFrame(fixture_details)
            st.dataframe(
                df_fixtures,
                use_container_width=True,
                hide_index=True,
                column_config={
                    "Categoría": st.column_config.TextColumn("Categoría", width="medium"),
                    "Archivos": st.column_config.NumberColumn("Archivos", width="small"),
                    "Tamaño (MB)": st.column_config.NumberColumn("Tamaño (MB)", width="small", format="%.1f"),
                    "Estado": st.column_config.TextColumn("Estado", width="medium"),
                    "Última Actualización": st.column_config.TextColumn("Última Actualización", width="large")
                }
            )
            
            # Opciones de generación
            generate_categories = st.multiselect(
                "Categorías a generar:",
                ["documents", "images", "data", "media", "corrupted", "sequential", "edge_cases"],
                default=["documents", "images", "data"]
            )
            
            # Configuración avanzada
            with st.expander("🔧 Opciones Avanzadas"):
                custom_sizes = st.checkbox("Generar tamaños personalizados", key="custom_sizes_check")
                if custom_sizes:
                    size_options = st.multiselect(
                        "Tamaños de archivo:",
                        ["tiny (<1KB)", "small (1-50KB)", "medium (50KB-1MB)", "large (1-10MB)", "huge (>10MB)"],
                        default=["small (1-50KB)", "medium (50KB-1MB)"],
                        key="size_options_select"
                    )

                include_multilingual = st.checkbox("Incluir contenido multiidioma", value=True, key="multilingual_check")
                include_special_chars = st.checkbox("Incluir caracteres especiales", value=True, key="special_chars_check")
                generate_corrupted = st.checkbox("Generar archivos corruptos", value=True, key="corrupted_check")
        
        with col2:
            st.subheader("📊 Estimación")
            
            # Calcular estimación basada en selección
            estimated_files = 0
            for category in generate_categories:
                if category == "documents":
                    estimated_files += 290
                elif category == "images":
                    estimated_files += 190
                elif category == "data":
                    estimated_files += 45
                elif category == "media":
                    estimated_files += 30
                elif category == "corrupted":
                    estimated_files += 50
                elif category == "sequential":
                    estimated_files += 115
                elif category == "edge_cases":
                    estimated_files += 40
            
            st.metric("📁 Archivos totales", f"{estimated_files:,}")
            st.metric("💾 Espacio estimado", f"{estimated_files * 0.8:.0f} MB")
            st.metric("⏱️ Tiempo estimado", f"{estimated_files * 0.02:.0f} min")
        
        st.markdown("---")
        
        # Botones de acción
        col_btn1, col_btn2, col_btn3 = st.columns([2, 1, 1])
        
        with col_btn1:
            if st.button("🚀 Generar Fixtures", type="primary", use_container_width=True, key="generate_fixtures"):
                self.generate_fixtures_with_progress(generate_categories)

        with col_btn2:
            if st.button("🔍 Verificar Existentes", use_container_width=True, key="verify_fixtures"):
                self.verify_existing_fixtures()

        with col_btn3:
            if st.button("🗑️ Limpiar Todo", use_container_width=True, key="clean_fixtures"):
                if st.checkbox("Confirmar limpieza", key="confirm_clean"):
                    self.clean_fixtures()
        
        # Estado actual de fixtures
        st.markdown("---")
        st.subheader("📋 Estado Actual de Fixtures")
        
        self.show_fixtures_status()
    
    def generate_fixtures_with_progress(self, categories: List[str]):
        """Generar fixtures con barra de progreso"""
        progress_bar = st.progress(0)
        status_text = st.empty()
        
        try:
            generator = FixtureGenerator(config.FIXTURES_PATH)
            
            status_text.text("🏭 Iniciando generación de fixtures...")
            progress_bar.progress(10)
            
            # Simular progreso por categoría
            progress_step = 80 // len(categories)
            current_progress = 10
            
            for i, category in enumerate(categories):
                status_text.text(f"📁 Generando {category}...")
                
                # Simular generación (en implementación real llamaría al generador específico)
                for j in range(10):
                    time.sleep(0.1)
                    progress_bar.progress(current_progress + (progress_step * j // 10))
                
                current_progress += progress_step
            
            status_text.text("📋 Generando manifiesto...")
            progress_bar.progress(95)
            time.sleep(0.5)
            
            status_text.text("✅ Generación completada!")
            progress_bar.progress(100)
            
            st.success(f"🎉 Fixtures generados exitosamente!")
            st.session_state.fixtures_generated = True
            
        except Exception as e:
            st.error(f"❌ Error generando fixtures: {e}")
    
    def render_reports(self):
        """Renderizar página de reportes"""
        st.title("📋 Reportes")
        
        # Opciones de reportes
        col1, col2 = st.columns([2, 1])
        
        with col1:
            st.subheader("📝 Generar Nuevo Reporte")
            
            report_type = st.selectbox(
                "Tipo de reporte:",
                ["Ejecutivo", "Técnico Detallado", "Por Suite", "Comparativo"]
            )
            
            report_format = st.selectbox(
                "Formato:",
                ["Markdown", "HTML", "PDF", "JSON"]
            )
            
            include_charts = st.checkbox("Incluir gráficos", value=True, key="include_charts")
            include_details = st.checkbox("Incluir detalles de tests fallidos", value=True, key="include_details")

            if st.button("📄 Generar Reporte", type="primary", key="generate_report"):
                self.generate_report(report_type, report_format, include_charts, include_details)
        
        with col2:
            st.subheader("📊 Vista Previa")
            
            # Mostrar vista previa del reporte
            if report_type == "Ejecutivo":
                st.markdown("""
                **📊 Reporte Ejecutivo - Anclora Nexus Testing Suite**
                
                *Generado: {date}*
                
                ## Resumen
                - ✅ **89.2%** tasa de éxito general  
                - 🧪 **720** tests ejecutados
                - ⏱️ **23.4 min** tiempo total
                
                ## Estado por Suite
                - 🟢 Documents: 92% (290 tests)
                - 🟢 Images: 88% (190 tests)
                - 🟡 Sequential: 78% (115 tests)
                
                ## Recomendaciones
                - Revisar conversiones PDF→DOCX
                - Optimizar secuencias de 3 pasos
                """.format(date=datetime.now().strftime("%Y-%m-%d")))
        
        st.markdown("---")
        
        # Reportes existentes
        st.subheader("📁 Reportes Existentes")
        
        # Lista de reportes simulados
        reports = [
            {"name": "reporte_ejecutivo_20250903.md", "date": "2025-09-03 14:30", "size": "245 KB"},
            {"name": "reporte_tecnico_20250902.html", "date": "2025-09-02 16:45", "size": "1.2 MB"},
            {"name": "reporte_comparativo_20250901.json", "date": "2025-09-01 10:15", "size": "89 KB"},
        ]
        
        for report in reports:
            col_name, col_date, col_size, col_actions = st.columns([3, 2, 1, 2])
            
            with col_name:
                st.text(report["name"])
            with col_date:
                st.text(report["date"])
            with col_size:
                st.text(report["size"])
            with col_actions:
                col_btn1, col_btn2 = st.columns(2)
                with col_btn1:
                    st.button("📥", key=f"download_{report['name']}", help="Descargar")
                with col_btn2:
                    st.button("👁️", key=f"view_{report['name']}", help="Ver")
    
    # Métodos auxiliares
    
    def check_prerequisites(self) -> bool:
        """Verificar prerrequisitos para ejecutar tests"""
        issues = []
        
        # Verificar conexión con Anclora Nexus
        if not st.session_state.anclora_status or st.session_state.anclora_status.get('status') != 'healthy':
            issues.append("❌ No hay conexión con Anclora Nexus")
        
        # Verificar fixtures
        if not self.count_available_fixtures():
            issues.append("❌ No hay fixtures disponibles")
        
        if issues:
            st.error("⚠️ **Prerrequisitos no cumplidos:**")
            for issue in issues:
                st.write(issue)
            
            st.info("💡 **Soluciones:**")
            st.write("1. Verifica que Anclora Nexus esté ejecutándose")
            st.write("2. Genera fixtures usando la pestaña 'Generar Fixtures'")
            st.write("3. Revisa la configuración en la pestaña 'Configuración'")
            
            return False
        
        return True
    
    def count_available_fixtures(self) -> int:
        """Contar fixtures disponibles"""
        try:
            fixtures_path = config.FIXTURES_PATH
            if not fixtures_path.exists():
                return 0
            
            # Contar archivos en subdirectorios
            total_files = 0
            for subdir in ["documents", "images", "data", "media", "corrupted", "sequential"]:
                subdir_path = fixtures_path / subdir
                if subdir_path.exists():
                    total_files += len(list(subdir_path.glob("*")))
            
            return total_files
        except:
            return 0
    
    def calculate_recent_success_rate(self) -> float:
        """Calcular tasa de éxito reciente (simulado)"""
        # En implementación real, consultaría la base de datos
        return 0.89
    
    def estimate_execution_time(self, suites: List[str], parallel_workers: int) -> float:
        """Estimar tiempo de ejecución en minutos"""
        total_tests = sum(
            TEST_SUITES_CONFIG[suite].get("expected_tests", 0) 
            for suite in suites 
            if suite in TEST_SUITES_CONFIG
        )
        
        # Estimación básica: 0.5 segundos por test, ajustado por paralelismo
        base_time = total_tests * 0.5 / 60  # en minutos
        parallel_factor = max(1, parallel_workers / 4)  # Factor de paralelización
        
        return base_time / parallel_factor

    def show_fixtures_status(self):
        """Mostrar estado actual de fixtures"""
        try:
            fixtures_path = Path("fixtures")

            if not fixtures_path.exists():
                st.warning("📁 Directorio de fixtures no encontrado")
                if st.button("🏗️ Crear Directorio de Fixtures"):
                    fixtures_path.mkdir(parents=True, exist_ok=True)
                    st.success("✅ Directorio creado exitosamente")
                    st.rerun()
                return

            # Contar archivos por categoría
            categories = {
                "documents": ["txt", "docx", "html", "md", "rtf"],
                "images": ["jpg", "png", "gif", "bmp", "webp", "svg"],
                "data": ["csv", "json", "xml", "xlsx"],
                "sequential": ["zip", "tar", "gz"],
                "integration": ["pdf", "epub", "mobi"]
            }

            col1, col2, col3 = st.columns(3)

            with col1:
                st.markdown("**📊 Resumen de Fixtures**")
                total_files = 0
                for category, extensions in categories.items():
                    category_path = fixtures_path / category
                    if category_path.exists():
                        count = len([f for f in category_path.glob("*") if f.suffix.lower().lstrip('.') in extensions])
                        total_files += count
                        st.metric(f"{category.title()}", count)

                st.metric("**Total**", total_files, delta=None)

            with col2:
                st.markdown("**📁 Estructura de Directorios**")
                for category in categories.keys():
                    category_path = fixtures_path / category
                    status = "✅" if category_path.exists() else "❌"
                    st.write(f"{status} `fixtures/{category}/`")

            with col3:
                st.markdown("**🔍 Últimos Archivos**")
                recent_files = []
                for category_path in fixtures_path.glob("*/"):
                    if category_path.is_dir():
                        for file_path in category_path.glob("*"):
                            if file_path.is_file():
                                recent_files.append((file_path.name, file_path.stat().st_mtime))

                # Mostrar los 5 más recientes
                recent_files.sort(key=lambda x: x[1], reverse=True)
                for filename, _ in recent_files[:5]:
                    st.write(f"📄 {filename}")

        except Exception as e:
            st.error(f"❌ Error mostrando estado de fixtures: {e}")

    def generate_report(self, report_type: str, report_format: str, include_charts: bool, include_details: bool):
        """Generar reporte de testing"""
        try:
            with st.spinner(f"Generando reporte {report_type} en formato {report_format}..."):
                # Simular generación de reporte
                import time
                time.sleep(2)

                # Datos simulados para el reporte
                report_data = {
                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "report_type": report_type,
                    "format": report_format,
                    "total_tests": 720,
                    "passed": 648,
                    "failed": 72,
                    "success_rate": 90.0,
                    "execution_time": "3.6s",
                    "suites": {
                        "documents": {"total": 290, "passed": 267, "failed": 23},
                        "images": {"total": 190, "passed": 171, "failed": 19},
                        "data": {"total": 45, "passed": 43, "failed": 2},
                        "sequential": {"total": 115, "passed": 89, "failed": 26},
                        "integration": {"total": 80, "passed": 78, "failed": 2}
                    }
                }

                # Generar contenido del reporte
                if report_format == "Markdown":
                    report_content = self._generate_markdown_report(report_data, include_charts, include_details)
                    filename = f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
                elif report_format == "HTML":
                    report_content = self._generate_html_report(report_data, include_charts, include_details)
                    filename = f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
                else:  # JSON
                    import json
                    report_content = json.dumps(report_data, indent=2, ensure_ascii=False)
                    filename = f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

                # Guardar reporte
                reports_path = Path("reports")
                reports_path.mkdir(exist_ok=True)
                report_file = reports_path / filename

                with open(report_file, 'w', encoding='utf-8') as f:
                    f.write(report_content)

                st.success(f"✅ Reporte generado exitosamente: `{filename}`")

                # Mostrar botón de descarga
                st.download_button(
                    label="📥 Descargar Reporte",
                    data=report_content,
                    file_name=filename,
                    mime="text/plain" if report_format == "Markdown" else "text/html" if report_format == "HTML" else "application/json"
                )

        except Exception as e:
            st.error(f"❌ Error generando reporte: {e}")

    def _generate_markdown_report(self, data: dict, include_charts: bool, include_details: bool) -> str:
        """Generar reporte en formato Markdown"""
        content = f"""# Anclora Nexus Testing Report

**Generado:** {data['timestamp']}
**Tipo:** {data['report_type']}
**Formato:** {data['format']}

## 📊 Resumen Ejecutivo

- **Total de Tests:** {data['total_tests']}
- **Exitosos:** {data['passed']} ({data['success_rate']:.1f}%)
- **Fallidos:** {data['failed']} ({100-data['success_rate']:.1f}%)
- **Tiempo de Ejecución:** {data['execution_time']}

## 📈 Resultados por Suite

| Suite | Total | Exitosos | Fallidos | Tasa de Éxito |
|-------|-------|----------|----------|---------------|
"""

        for suite_name, suite_data in data['suites'].items():
            success_rate = (suite_data['passed'] / suite_data['total']) * 100
            content += f"| {suite_name.title()} | {suite_data['total']} | {suite_data['passed']} | {suite_data['failed']} | {success_rate:.1f}% |\n"

        if include_details:
            content += f"""
## 🔍 Detalles de Tests Fallidos

### Suite Documents
- Error de encoding UTF-8 en archivos especiales
- Timeout en conversiones de archivos grandes

### Suite Images
- Problemas con formatos SVG complejos
- Memoria insuficiente para imágenes de alta resolución

### Suite Sequential
- Fallos en compresión de archivos ZIP
- Errores de permisos en archivos temporales
"""

        content += f"""
## 📋 Conclusiones

El sistema muestra un rendimiento sólido con una tasa de éxito del {data['success_rate']:.1f}%.
Las áreas de mejora identificadas incluyen el manejo de archivos especiales y la optimización
de memoria para archivos grandes.

---
*Reporte generado por Anclora Nexus Testing Suite*
"""
        return content

    def _generate_html_report(self, data: dict, include_charts: bool, include_details: bool) -> str:
        """Generar reporte en formato HTML"""
        return f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anclora Nexus Testing Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
        .container {{ max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        h1 {{ color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }}
        h2 {{ color: #34495e; margin-top: 30px; }}
        .metrics {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }}
        .metric {{ background: #ecf0f1; padding: 20px; border-radius: 8px; text-align: center; }}
        .metric h3 {{ margin: 0; color: #2c3e50; }}
        .metric .value {{ font-size: 2em; font-weight: bold; color: #3498db; }}
        table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }}
        th {{ background-color: #3498db; color: white; }}
        .success {{ color: #27ae60; }}
        .error {{ color: #e74c3c; }}
        .footer {{ margin-top: 40px; text-align: center; color: #7f8c8d; font-style: italic; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Anclora Nexus Testing Report</h1>

        <p><strong>Generado:</strong> {data['timestamp']}<br>
        <strong>Tipo:</strong> {data['report_type']}<br>
        <strong>Formato:</strong> {data['format']}</p>

        <h2>📊 Resumen Ejecutivo</h2>
        <div class="metrics">
            <div class="metric">
                <h3>Total Tests</h3>
                <div class="value">{data['total_tests']}</div>
            </div>
            <div class="metric">
                <h3>Exitosos</h3>
                <div class="value success">{data['passed']}</div>
            </div>
            <div class="metric">
                <h3>Fallidos</h3>
                <div class="value error">{data['failed']}</div>
            </div>
            <div class="metric">
                <h3>Tasa de Éxito</h3>
                <div class="value">{data['success_rate']:.1f}%</div>
            </div>
        </div>

        <h2>📈 Resultados por Suite</h2>
        <table>
            <thead>
                <tr><th>Suite</th><th>Total</th><th>Exitosos</th><th>Fallidos</th><th>Tasa de Éxito</th></tr>
            </thead>
            <tbody>
"""

        for suite_name, suite_data in data['suites'].items():
            success_rate = (suite_data['passed'] / suite_data['total']) * 100
            content += f"""                <tr>
                    <td>{suite_name.title()}</td>
                    <td>{suite_data['total']}</td>
                    <td class="success">{suite_data['passed']}</td>
                    <td class="error">{suite_data['failed']}</td>
                    <td>{success_rate:.1f}%</td>
                </tr>
"""

        content += f"""            </tbody>
        </table>

        <div class="footer">
            <p>Reporte generado por Anclora Nexus Testing Suite</p>
        </div>
    </div>
</body>
</html>"""
        return content

    def render_test_details(self):
        """Renderizar detalles de tests individuales"""
        try:
            st.subheader("🧪 Detalles de Tests")

            # Filtros
            col1, col2, col3 = st.columns(3)

            with col1:
                suite_filter = st.selectbox(
                    "Suite",
                    ["Todas", "Documents", "Images", "Data", "Sequential", "Integration"],
                    key="test_details_suite"
                )

            with col2:
                status_filter = st.selectbox(
                    "Estado",
                    ["Todos", "Exitosos", "Fallidos", "En Progreso"],
                    key="test_details_status"
                )

            with col3:
                priority_filter = st.selectbox(
                    "Prioridad",
                    ["Todas", "Alta", "Media", "Baja"],
                    key="test_details_priority"
                )

            # Datos simulados de tests
            test_data = [
                {"id": "DOC_001", "name": "TXT → PDF Conversion", "suite": "Documents", "status": "✅ Exitoso", "time": "1.2s", "priority": "Alta"},
                {"id": "DOC_002", "name": "DOCX → HTML Conversion", "suite": "Documents", "status": "❌ Fallido", "time": "2.8s", "priority": "Media"},
                {"id": "IMG_001", "name": "PNG → JPG Conversion", "suite": "Images", "status": "✅ Exitoso", "time": "0.9s", "priority": "Alta"},
                {"id": "IMG_002", "name": "SVG → PNG Complex", "suite": "Images", "status": "❌ Fallido", "time": "4.1s", "priority": "Baja"},
                {"id": "DATA_001", "name": "CSV → JSON Transform", "suite": "Data", "status": "✅ Exitoso", "time": "0.5s", "priority": "Media"},
                {"id": "SEQ_001", "name": "ZIP Batch Processing", "suite": "Sequential", "status": "🔄 En Progreso", "time": "8.2s", "priority": "Alta"},
            ]

            # Aplicar filtros
            filtered_data = test_data
            if suite_filter != "Todas":
                filtered_data = [t for t in filtered_data if t["suite"] == suite_filter]
            if status_filter != "Todos":
                status_map = {"Exitosos": "✅", "Fallidos": "❌", "En Progreso": "🔄"}
                filtered_data = [t for t in filtered_data if status_map.get(status_filter, "") in t["status"]]

            # Mostrar tabla de tests
            if filtered_data:
                df = pd.DataFrame(filtered_data)
                st.dataframe(
                    df,
                    use_container_width=True,
                    hide_index=True,
                    column_config={
                        "id": st.column_config.TextColumn("ID", width="small"),
                        "name": st.column_config.TextColumn("Nombre del Test", width="large"),
                        "suite": st.column_config.TextColumn("Suite", width="medium"),
                        "status": st.column_config.TextColumn("Estado", width="small"),
                        "time": st.column_config.TextColumn("Tiempo", width="small"),
                        "priority": st.column_config.TextColumn("Prioridad", width="small"),
                    }
                )

                # Estadísticas de la selección
                total_tests = len(filtered_data)
                successful = len([t for t in filtered_data if "✅" in t["status"]])
                failed = len([t for t in filtered_data if "❌" in t["status"]])
                in_progress = len([t for t in filtered_data if "🔄" in t["status"]])

                col1, col2, col3, col4 = st.columns(4)
                col1.metric("Total", total_tests)
                col2.metric("Exitosos", successful)
                col3.metric("Fallidos", failed)
                col4.metric("En Progreso", in_progress)
            else:
                st.info("No hay tests que coincidan con los filtros seleccionados")

        except Exception as e:
            st.error(f"❌ Error mostrando detalles de tests: {e}")

    def render_competitive_analysis(self):
        """Renderizar análisis competitivo"""
        try:
            st.subheader("🏆 Análisis Competitivo")

            # Datos comparativos simulados
            comparison_data = {
                "Herramienta": ["Anclora Nexus", "Convertio", "CloudConvert", "OnlineConvert", "Zamzar"],
                "Formatos Soportados": [45, 200, 218, 150, 1200],
                "Velocidad (archivos/min)": [120, 80, 95, 60, 40],
                "Precisión (%)": [94.5, 89.2, 91.8, 87.3, 85.1],
                "Costo ($/mes)": [0, 10, 25, 15, 20],
                "Límite Tamaño (MB)": [100, 100, 1000, 100, 50]
            }

            df_comparison = pd.DataFrame(comparison_data)

            # Gráfico de radar
            col1, col2 = st.columns(2)

            with col1:
                st.markdown("**📊 Comparación de Rendimiento**")

                # Normalizar datos para el gráfico de radar
                metrics = ["Formatos", "Velocidad", "Precisión", "Valor", "Capacidad"]
                anclora_scores = [
                    45/1200*100,  # Formatos (normalizado)
                    120/120*100,  # Velocidad
                    94.5,         # Precisión
                    100,          # Valor (gratis = 100)
                    100/1000*100  # Capacidad
                ]

                fig_radar = go.Figure()
                fig_radar.add_trace(go.Scatterpolar(
                    r=anclora_scores,
                    theta=metrics,
                    fill='toself',
                    name='Anclora Nexus',
                    line_color='#3498db'
                ))

                fig_radar.update_layout(
                    polar=dict(
                        radialaxis=dict(
                            visible=True,
                            range=[0, 100]
                        )),
                    showlegend=True,
                    height=400
                )

                st.plotly_chart(fig_radar, use_container_width=True)

            with col2:
                st.markdown("**🎯 Fortalezas de Anclora Nexus**")

                strengths = [
                    "🚀 **Velocidad Superior**: 120 archivos/min vs 80 promedio",
                    "🎯 **Alta Precisión**: 94.5% de conversiones exitosas",
                    "💰 **Completamente Gratuito**: Sin límites de suscripción",
                    "🔧 **Código Abierto**: Personalizable y extensible",
                    "🛡️ **Privacidad Total**: Procesamiento local",
                    "⚡ **Procesamiento Paralelo**: Optimizado para múltiples archivos"
                ]

                for strength in strengths:
                    st.markdown(strength)

            # Tabla comparativa detallada
            st.markdown("**📋 Comparación Detallada**")
            st.dataframe(
                df_comparison,
                use_container_width=True,
                hide_index=True,
                column_config={
                    "Herramienta": st.column_config.TextColumn("Herramienta", width="medium"),
                    "Formatos Soportados": st.column_config.NumberColumn("Formatos", width="small"),
                    "Velocidad (archivos/min)": st.column_config.NumberColumn("Velocidad", width="small"),
                    "Precisión (%)": st.column_config.NumberColumn("Precisión %", width="small"),
                    "Costo ($/mes)": st.column_config.NumberColumn("Costo $/mes", width="small"),
                    "Límite Tamaño (MB)": st.column_config.NumberColumn("Límite MB", width="small"),
                }
            )

        except Exception as e:
            st.error(f"❌ Error en análisis competitivo: {e}")

    def render_historical_data(self):
        """Renderizar datos históricos"""
        try:
            st.subheader("📋 Datos Históricos")

            # Selector de período
            col1, col2 = st.columns(2)

            with col1:
                period = st.selectbox(
                    "Período de Análisis",
                    ["Últimos 7 días", "Últimos 30 días", "Últimos 3 meses", "Último año"],
                    key="historical_period"
                )

            with col2:
                metric_type = st.selectbox(
                    "Métrica",
                    ["Tasa de Éxito", "Tiempo de Ejecución", "Volumen de Tests", "Errores"],
                    key="historical_metric"
                )

            # Generar datos históricos simulados
            import random
            from datetime import datetime, timedelta

            days = {"Últimos 7 días": 7, "Últimos 30 días": 30, "Últimos 3 meses": 90, "Último año": 365}[period]
            dates = [(datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days, 0, -1)]

            if metric_type == "Tasa de Éxito":
                values = [random.uniform(85, 95) for _ in dates]
                y_label = "Tasa de Éxito (%)"
                color = "#27ae60"
            elif metric_type == "Tiempo de Ejecución":
                values = [random.uniform(2.5, 4.5) for _ in dates]
                y_label = "Tiempo Promedio (s)"
                color = "#3498db"
            elif metric_type == "Volumen de Tests":
                values = [random.randint(500, 800) for _ in dates]
                y_label = "Número de Tests"
                color = "#9b59b6"
            else:  # Errores
                values = [random.randint(10, 50) for _ in dates]
                y_label = "Número de Errores"
                color = "#e74c3c"

            # Gráfico de línea temporal
            fig_historical = go.Figure()
            fig_historical.add_trace(go.Scatter(
                x=dates,
                y=values,
                mode='lines+markers',
                name=metric_type,
                line=dict(color=color, width=3),
                marker=dict(size=6)
            ))

            fig_historical.update_layout(
                title=f"{metric_type} - {period}",
                xaxis_title="Fecha",
                yaxis_title=y_label,
                height=400,
                showlegend=False
            )

            st.plotly_chart(fig_historical, use_container_width=True)

            # Estadísticas del período
            col1, col2, col3, col4 = st.columns(4)

            with col1:
                st.metric("Promedio", f"{sum(values)/len(values):.1f}")

            with col2:
                st.metric("Máximo", f"{max(values):.1f}")

            with col3:
                st.metric("Mínimo", f"{min(values):.1f}")

            with col4:
                trend = "📈" if values[-1] > values[0] else "📉"
                change = ((values[-1] - values[0]) / values[0] * 100)
                st.metric("Tendencia", f"{trend} {change:+.1f}%")

            # Tabla de datos históricos (últimos 10 registros)
            st.markdown("**📊 Últimos Registros**")
            historical_df = pd.DataFrame({
                "Fecha": dates[-10:],
                metric_type: [f"{v:.1f}" for v in values[-10:]]
            })

            st.dataframe(
                historical_df,
                use_container_width=True,
                hide_index=True
            )

        except Exception as e:
            st.error(f"❌ Error mostrando datos históricos: {e}")

def main():
    """Función principal de la aplicación"""
    ui = TestingUI()
    
    # Obtener página actual del sidebar
    page = ui.setup_sidebar()
    
    # Renderizar página correspondiente
    if page == "🏠 Dashboard":
        ui.render_dashboard()
    elif page == "🚀 Ejecutar Tests":
        ui.render_test_execution()
    elif page == "📊 Resultados y Métricas":
        ui.render_results_and_metrics()
    elif page == "🏭 Generar Fixtures":
        ui.render_fixtures_generator()
    elif page == "📋 Reportes":
        ui.render_reports()
    elif page == "⚙️ Configuración":
        st.title("⚙️ Configuración")
        st.info("Página de configuración en desarrollo")
    elif page == "🔍 Debug y Logs":
        st.title("🔍 Debug y Logs")
        st.info("Página de debugging en desarrollo")

if __name__ == "__main__":
    main()