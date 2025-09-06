# src/ui/mobile_first_app.py - Interfaz Web Mobile-First con Branding Anclora
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional
import json
import time

# Imports del sistema
import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from src.config import config, TEST_SUITES_CONFIG
from src.models import TestStatus, TestPriority
from src.mocks.mock_anclora_client import MockAncloraClient
from src.mocks.mock_fixture_generator import MockFixtureGenerator

# Configuración de página mobile-first
st.set_page_config(
    page_title="🧪 Anclora Testing Suite",
    page_icon="🧪",
    layout="wide",
    initial_sidebar_state="collapsed",  # Mobile-first: sidebar colapsado
    menu_items={
        'Get Help': 'https://anclora.com/help',
        'Report a bug': 'https://anclora.com/support', 
        'About': "Anclora Nexus Testing Suite - Sistema de testing robusto y escalable"
    }
)

# Tema y branding Anclora con soporte dark/light/system
def apply_anclora_theme():
    """Aplicar tema personalizado Anclora con modo dark/light responsive"""
    
    # Detectar preferencia del sistema o configuración del usuario
    theme_preference = st.session_state.get('theme_mode', 'system')
    
    # CSS personalizado con variables CSS para temas
    anclora_css = """
    <style>
    /* Variables CSS para temas */
    :root {
        --anclora-primary: #2E86AB;
        --anclora-secondary: #A23B72;
        --anclora-accent: #F18F01;
        --anclora-success: #C73E1D;
        --anclora-background: #FFFFFF;
        --anclora-surface: #F5F7FA;
        --anclora-text: #2C3E50;
        --anclora-text-secondary: #7F8C8D;
        --anclora-border: #E1E8ED;
        --anclora-shadow: rgba(46, 134, 171, 0.1);
    }
    
    /* Tema Dark */
    [data-theme="dark"] {
        --anclora-primary: #4A9ECC;
        --anclora-secondary: #C45A8A;
        --anclora-accent: #FFB347;
        --anclora-success: #FF6B5A;
        --anclora-background: #0E1117;
        --anclora-surface: #1E2329;
        --anclora-text: #FAFAFA;
        --anclora-text-secondary: #B0BEC5;
        --anclora-border: #30363D;
        --anclora-shadow: rgba(0, 0, 0, 0.3);
    }
    
    /* Sistema detecta preferencia automáticamente */
    @media (prefers-color-scheme: dark) {
        :root[data-theme="system"] {
            --anclora-primary: #4A9ECC;
            --anclora-secondary: #C45A8A;
            --anclora-accent: #FFB347;
            --anclora-success: #FF6B5A;
            --anclora-background: #0E1117;
            --anclora-surface: #1E2329;
            --anclora-text: #FAFAFA;
            --anclora-text-secondary: #B0BEC5;
            --anclora-border: #30363D;
            --anclora-shadow: rgba(0, 0, 0, 0.3);
        }
    }
    
    /* Reseteo y base mobile-first */
    * {
        box-sizing: border-box;
    }
    
    .main .block-container {
        padding-top: 1rem !important;
        padding-left: 1rem !important;
        padding-right: 1rem !important;
        max-width: 100% !important;
    }
    
    /* Header principal Anclora */
    .anclora-header {
        background: linear-gradient(135deg, var(--anclora-primary), var(--anclora-secondary));
        color: white;
        padding: 1.5rem;
        border-radius: 16px;
        margin-bottom: 1.5rem;
        text-align: center;
        box-shadow: 0 8px 32px var(--anclora-shadow);
        position: relative;
        overflow: hidden;
    }
    
    .anclora-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
        z-index: 0;
    }
    
    .anclora-header-content {
        position: relative;
        z-index: 1;
    }
    
    .anclora-logo {
        font-size: 2.5rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    
    .anclora-subtitle {
        font-size: 1.1rem;
        opacity: 0.9;
        font-weight: 400;
    }
    
    /* Cards mobile-first */
    .anclora-card {
        background: var(--anclora-surface);
        border: 1px solid var(--anclora-border);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 2px 8px var(--anclora-shadow);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }
    
    .anclora-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px var(--anclora-shadow);
        border-color: var(--anclora-primary);
    }
    
    .anclora-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: linear-gradient(to bottom, var(--anclora-primary), var(--anclora-secondary));
        transition: width 0.3s ease;
    }
    
    .anclora-card:hover::before {
        width: 6px;
    }
    
    /* Métricas responsive */
    .anclora-metric {
        background: white;
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
        box-shadow: 0 2px 4px var(--anclora-shadow);
        border: 1px solid var(--anclora-border);
        margin-bottom: 0.5rem;
    }
    
    .anclora-metric-value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--anclora-primary);
        margin-bottom: 0.25rem;
        display: block;
    }
    
    .anclora-metric-label {
        font-size: 0.875rem;
        color: var(--anclora-text-secondary);
        text-transform: uppercase;
        font-weight: 600;
        letter-spacing: 0.5px;
    }
    
    /* Botones Anclora */
    .anclora-btn-primary {
        background: linear-gradient(135deg, var(--anclora-primary), var(--anclora-secondary)) !important;
        color: white !important;
        border: none !important;
        border-radius: 8px !important;
        padding: 0.75rem 1.5rem !important;
        font-weight: 600 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
        box-shadow: 0 4px 12px var(--anclora-shadow) !important;
        transition: all 0.3s ease !important;
        width: 100% !important;
        margin-bottom: 0.5rem !important;
    }
    
    .anclora-btn-secondary {
        background: var(--anclora-surface) !important;
        color: var(--anclora-primary) !important;
        border: 2px solid var(--anclora-primary) !important;
        border-radius: 8px !important;
        padding: 0.75rem 1.5rem !important;
        font-weight: 600 !important;
        width: 100% !important;
        margin-bottom: 0.5rem !important;
    }
    
    /* Status indicators */
    .status-healthy { 
        color: #27AE60 !important; 
        font-weight: 600 !important; 
    }
    .status-warning { 
        color: var(--anclora-accent) !important; 
        font-weight: 600 !important; 
    }
    .status-error { 
        color: var(--anclora-success) !important; 
        font-weight: 600 !important; 
    }
    
    /* Navigation mobile */
    .anclora-nav {
        background: var(--anclora-surface);
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1rem;
        box-shadow: 0 2px 8px var(--anclora-shadow);
    }
    
    .anclora-nav-item {
        padding: 0.75rem;
        margin: 0.25rem 0;
        border-radius: 8px;
        background: var(--anclora-background);
        border: 1px solid var(--anclora-border);
        transition: all 0.3s ease;
        cursor: pointer;
        text-align: center;
        font-weight: 500;
    }
    
    .anclora-nav-item:hover {
        background: var(--anclora-primary);
        color: white;
        transform: scale(1.02);
    }
    
    .anclora-nav-item.active {
        background: var(--anclora-primary);
        color: white;
        font-weight: 600;
    }
    
    /* Progress bars */
    .anclora-progress {
        background: var(--anclora-border);
        border-radius: 8px;
        height: 8px;
        overflow: hidden;
        margin: 1rem 0;
    }
    
    .anclora-progress-fill {
        background: linear-gradient(90deg, var(--anclora-primary), var(--anclora-accent));
        height: 100%;
        border-radius: 8px;
        transition: width 0.3s ease;
    }
    
    /* Theme selector */
    .anclora-theme-selector {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 1000;
        background: var(--anclora-surface);
        border-radius: 8px;
        padding: 0.5rem;
        box-shadow: 0 4px 12px var(--anclora-shadow);
        border: 1px solid var(--anclora-border);
    }
    
    /* Responsive breakpoints */
    @media (min-width: 768px) {
        .main .block-container {
            padding-left: 2rem !important;
            padding-right: 2rem !important;
            max-width: 1200px !important;
        }
        
        .anclora-header {
            padding: 2rem;
        }
        
        .anclora-logo {
            font-size: 3rem;
        }
        
        .anclora-btn-primary, .anclora-btn-secondary {
            width: auto !important;
            display: inline-block !important;
            margin-right: 1rem !important;
        }
    }
    
    @media (min-width: 1024px) {
        .anclora-card {
            padding: 2rem;
        }
        
        .anclora-metric {
            padding: 1.5rem;
        }
        
        .anclora-metric-value {
            font-size: 2.5rem;
        }
    }
    
    /* Animaciones */
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .anclora-fade-in {
        animation: fadeInUp 0.6s ease-out;
    }
    
    /* Scrollbar personalizado */
    ::-webkit-scrollbar {
        width: 8px;
    }
    
    ::-webkit-scrollbar-track {
        background: var(--anclora-surface);
    }
    
    ::-webkit-scrollbar-thumb {
        background: var(--anclora-primary);
        border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: var(--anclora-secondary);
    }
    
    /* Ocultar elementos de Streamlit */
    .viewerBadge_container__1QSob {
        display: none !important;
    }
    
    #MainMenu {
        visibility: hidden;
    }
    
    footer {
        visibility: hidden;
    }
    
    .stDeployButton {
        display: none;
    }
    </style>
    """
    
    st.markdown(anclora_css, unsafe_allow_html=True)
    
    # Script para manejar tema del sistema
    theme_script = f"""
    <script>
    document.documentElement.setAttribute('data-theme', '{theme_preference}');
    
    // Detectar cambios en preferencia del sistema
    if ('{theme_preference}' === 'system') {{
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addListener(function(e) {{
            document.documentElement.setAttribute('data-theme', 'system');
        }});
    }}
    </script>
    """
    
    st.markdown(theme_script, unsafe_allow_html=True)

class MobileFirstTestingUI:
    """Interfaz mobile-first para Anclora Testing Suite"""
    
    def __init__(self):
        apply_anclora_theme()
        self.initialize_session_state()
        
    def initialize_session_state(self):
        """Inicializar estado de la sesión"""
        if 'theme_mode' not in st.session_state:
            st.session_state.theme_mode = 'system'
        if 'current_page' not in st.session_state:
            st.session_state.current_page = 'dashboard'
        if 'test_results' not in st.session_state:
            st.session_state.test_results = {}
        if 'anclora_status' not in st.session_state:
            st.session_state.anclora_status = None
        if 'mock_mode' not in st.session_state:
            st.session_state.mock_mode = True  # Usar mocks por defecto
    
    def render_header(self):
        """Renderizar header principal con branding Anclora"""
        header_html = """
        <div class="anclora-header anclora-fade-in">
            <div class="anclora-header-content">
                <div class="anclora-logo">🧪 ANCLORA NEXUS</div>
                <div class="anclora-subtitle">Testing Suite • Mobile-First • Visualmente Impecable</div>
            </div>
        </div>
        """
        st.markdown(header_html, unsafe_allow_html=True)
    
    def render_theme_selector(self):
        """Renderizar selector de tema flotante"""
        theme_html = """
        <div class="anclora-theme-selector">
        """
        st.markdown(theme_html, unsafe_allow_html=True)
        
        # Selector de tema en columnas
        col1, col2, col3 = st.columns(3)
        
        with col1:
            if st.button("☀️", key="light_theme", help="Tema Claro"):
                st.session_state.theme_mode = 'light'
                st.rerun()
        
        with col2:
            if st.button("🌙", key="dark_theme", help="Tema Oscuro"):
                st.session_state.theme_mode = 'dark'
                st.rerun()
        
        with col3:
            if st.button("💻", key="system_theme", help="Seguir Sistema"):
                st.session_state.theme_mode = 'system'
                st.rerun()
        
        st.markdown("</div>", unsafe_allow_html=True)
    
    def render_mobile_navigation(self):
        """Navegación mobile-first con botones tactiles"""
        nav_html = """
        <div class="anclora-nav">
        """
        st.markdown(nav_html, unsafe_allow_html=True)
        
        # Navegación en grid responsive
        col1, col2 = st.columns(2)
        
        with col1:
            if st.button("🏠 Dashboard", key="nav_dashboard", use_container_width=True):
                st.session_state.current_page = 'dashboard'
                st.rerun()
            
            if st.button("📊 Métricas", key="nav_metrics", use_container_width=True):
                st.session_state.current_page = 'metrics'
                st.rerun()
            
            if st.button("🏭 Generar", key="nav_generate", use_container_width=True):
                st.session_state.current_page = 'generate'
                st.rerun()
        
        with col2:
            if st.button("🚀 Ejecutar", key="nav_execute", use_container_width=True):
                st.session_state.current_page = 'execute'
                st.rerun()
            
            if st.button("📋 Reportes", key="nav_reports", use_container_width=True):
                st.session_state.current_page = 'reports'
                st.rerun()
            
            if st.button("⚙️ Config", key="nav_config", use_container_width=True):
                st.session_state.current_page = 'config'
                st.rerun()
        
        st.markdown("</div>", unsafe_allow_html=True)
    
    def render_status_banner(self):
        """Banner de estado del sistema responsive"""
        # Verificar estado con mock
        if st.session_state.mock_mode:
            mock_client = MockAncloraClient(config)
            status = {
                'status': 'healthy',
                'response_time_ms': 45.2,
                'version': '2.0.0-mock',
                'mock_mode': True
            }
        else:
            # En producción usaría cliente real
            status = st.session_state.anclora_status or {'status': 'unknown'}
        
        # Determinar estado visual
        if status.get('status') == 'healthy':
            status_class = "status-healthy"
            status_icon = "🟢"
            status_text = "CONECTADO"
        else:
            status_class = "status-error"
            status_icon = "🔴"
            status_text = "DESCONECTADO"
        
        # Renderizar banner responsive
        col1, col2, col3 = st.columns([1, 2, 1])
        
        with col1:
            st.markdown(f"<div class='anclora-metric'><span class='anclora-metric-value {status_class}'>{status_icon}</span><div class='anclora-metric-label'>Estado</div></div>", unsafe_allow_html=True)
        
        with col2:
            st.markdown(f"<div class='anclora-metric'><span class='anclora-metric-value {status_class}'>{status_text}</span><div class='anclora-metric-label'>Anclora Nexus</div></div>", unsafe_allow_html=True)
        
        with col3:
            response_time = status.get('response_time_ms', 0)
            st.markdown(f"<div class='anclora-metric'><span class='anclora-metric-value'>{response_time:.0f}ms</span><div class='anclora-metric-label'>Latencia</div></div>", unsafe_allow_html=True)
        
        # Mostrar modo mock si está activo
        if status.get('mock_mode'):
            st.info("🎭 **Modo Simulación Activado** - Usando mocks para desarrollo sin dependencias externas")
    
    def render_dashboard_page(self):
        """Página principal del dashboard mobile-first"""
        st.markdown("<div class='anclora-fade-in'>", unsafe_allow_html=True)
        
        # Métricas principales en grid responsive
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("""
            <div class="anclora-card">
                <div class="anclora-metric">
                    <span class="anclora-metric-value">800+</span>
                    <div class="anclora-metric-label">Tests Totales</div>
                </div>
            </div>
            """, unsafe_allow_html=True)
            
            st.markdown("""
            <div class="anclora-card">
                <div class="anclora-metric">
                    <span class="anclora-metric-value">89.2%</span>
                    <div class="anclora-metric-label">Tasa Éxito</div>
                </div>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            st.markdown("""
            <div class="anclora-card">
                <div class="anclora-metric">
                    <span class="anclora-metric-value">47</span>
                    <div class="anclora-metric-label">Conversiones</div>
                </div>
            </div>
            """, unsafe_allow_html=True)
            
            st.markdown("""
            <div class="anclora-card">
                <div class="anclora-metric">
                    <span class="anclora-metric-value">23.4s</span>
                    <div class="anclora-metric-label">Tiempo Prom</div>
                </div>
            </div>
            """, unsafe_allow_html=True)
        
        # Suites overview mobile-optimized
        st.markdown("### 📋 Suites de Testing")
        
        suites_data = [
            {"name": "Documents", "tests": 290, "success": 92, "priority": "🔥"},
            {"name": "Images", "tests": 190, "success": 88, "priority": "⚠️"},
            {"name": "Sequential", "tests": 115, "success": 78, "priority": "🔥"},
            {"name": "Integration", "tests": 80, "success": 85, "priority": "📋"}
        ]
        
        for suite in suites_data:
            success_color = "status-healthy" if suite["success"] >= 85 else "status-warning"
            
            st.markdown(f"""
            <div class="anclora-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div>
                        <h4 style="margin: 0; color: var(--anclora-text);">{suite["priority"]} {suite["name"]}</h4>
                        <small style="color: var(--anclora-text-secondary);">{suite["tests"]} tests</small>
                    </div>
                    <div style="text-align: right;">
                        <div class="anclora-metric-value {success_color}" style="font-size: 1.5rem;">{suite["success"]}%</div>
                    </div>
                </div>
                <div class="anclora-progress">
                    <div class="anclora-progress-fill" style="width: {suite["success"]}%;"></div>
                </div>
            </div>
            """, unsafe_allow_html=True)
        
        # Acciones rápidas mobile
        st.markdown("### ⚡ Acciones Rápidas")
        
        col1, col2 = st.columns(2)
        
        with col1:
            if st.button("🧪 Test Rápido", key="quick_test_dash", use_container_width=True):
                self.run_quick_test_simulation()
        
        with col2:
            if st.button("🏭 Generar Fixtures", key="gen_fixtures_dash", use_container_width=True):
                st.session_state.current_page = 'generate'
                st.rerun()
        
        st.markdown("</div>", unsafe_allow_html=True)
    
    def render_execute_page(self):
        """Página de ejecución mobile-optimized"""
        st.markdown("### 🚀 Ejecutar Tests")
        
        # Selector de suites touch-friendly
        st.markdown("#### 🎯 Seleccionar Suites")
        
        suites_options = list(TEST_SUITES_CONFIG.keys())
        selected_suites = []
        
        # Grid de suites con checkboxes grandes
        cols = st.columns(2)
        for i, suite in enumerate(suites_options):
            with cols[i % 2]:
                if st.checkbox(f"📋 {suite.title()}", key=f"suite_{suite}"):
                    selected_suites.append(suite)
        
        # Configuración simplificada para mobile
        st.markdown("#### ⚙️ Configuración")
        
        col1, col2 = st.columns(2)
        
        with col1:
            workers = st.select_slider(
                "Workers",
                options=[1, 2, 4, 8],
                value=4,
                key="workers_mobile"
            )
        
        with col2:
            timeout = st.select_slider(
                "Timeout (min)",
                options=[5, 10, 15, 30],
                value=10,
                key="timeout_mobile"
            )
        
        # Botones de ejecución grandes
        st.markdown("#### 🎮 Ejecutar")
        
        col1, col2 = st.columns(2)
        
        with col1:
            if st.button("🚀 Ejecutar Seleccionadas", key="run_selected", use_container_width=True, type="primary"):
                if selected_suites:
                    self.run_suites_simulation(selected_suites)
                else:
                    st.error("Selecciona al menos una suite")
        
        with col2:
            if st.button("⚡ Test Rápido", key="run_quick", use_container_width=True):
                self.run_quick_test_simulation()
    
    def run_quick_test_simulation(self):
        """Simular ejecución de test rápido"""
        st.info("🧪 **Iniciando Test Rápido...**")
        
        # Simular progreso con barra visual
        progress_bar = st.progress(0)
        status_text = st.empty()
        
        steps = [
            ("🔍 Verificando conexión...", 0.1),
            ("🏭 Preparando fixtures...", 0.3), 
            ("🧪 Ejecutando tests (20)...", 0.7),
            ("📊 Generando reporte...", 0.9),
            ("✅ Completado!", 1.0)
        ]
        
        for step_text, progress in steps:
            status_text.text(step_text)
            progress_bar.progress(progress)
            time.sleep(0.8)  # Simular tiempo de procesamiento
        
        # Mostrar resultados simulados
        st.success("🎉 **Test Rápido Completado!**")
        
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("✅ Exitosos", "18", "+2")
        with col2:
            st.metric("❌ Fallidos", "2", "-1")
        with col3:
            st.metric("⏱️ Tiempo", "45.2s", "-5.3s")
    
    def run_suites_simulation(self, suites: List[str]):
        """Simular ejecución de suites seleccionadas"""
        st.info(f"🚀 **Ejecutando {len(suites)} suites seleccionadas...**")
        
        progress_bar = st.progress(0)
        status_text = st.empty()
        
        total_steps = len(suites) * 3  # 3 pasos por suite
        current_step = 0
        
        for suite in suites:
            # Preparación
            current_step += 1
            status_text.text(f"🏭 Preparando suite '{suite}'...")
            progress_bar.progress(current_step / total_steps)
            time.sleep(0.5)
            
            # Ejecución
            current_step += 1
            status_text.text(f"🧪 Ejecutando tests de '{suite}'...")
            progress_bar.progress(current_step / total_steps)
            time.sleep(1.2)
            
            # Finalización
            current_step += 1
            status_text.text(f"✅ Suite '{suite}' completada")
            progress_bar.progress(current_step / total_steps)
            time.sleep(0.3)
        
        st.success(f"🎉 **{len(suites)} Suites Completadas!**")
    
    def render_metrics_page(self):
        """Página de métricas mobile-optimized"""
        st.markdown("### 📊 Métricas y Analytics")
        
        # Gráfico mobile-friendly
        success_data = [92, 88, 95, 78, 85]
        suites = ['Documents', 'Images', 'Data', 'Sequential', 'Integration']
        
        fig = px.bar(
            x=suites,
            y=success_data,
            title="🎯 Tasa de Éxito por Suite",
            color=success_data,
            color_continuous_scale="RdYlGn",
            height=300  # Altura reducida para mobile
        )
        
        fig.update_layout(
            showlegend=False,
            margin=dict(l=0, r=0, t=40, b=0),
            font=dict(size=10),
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)'
        )
        
        st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})
        
        # Métricas en cards mobile
        st.markdown("#### 📈 Estadísticas Clave")
        
        metrics_data = [
            {"label": "Tests Hoy", "value": "156", "change": "+12", "icon": "🧪"},
            {"label": "Tiempo Prom", "value": "23.4s", "change": "-2.1s", "icon": "⏱️"},
            {"label": "Calidad", "value": "94.2%", "change": "+1.5%", "icon": "🏆"},
            {"label": "Archivos", "value": "847", "change": "+23", "icon": "📁"}
        ]
        
        cols = st.columns(2)
        for i, metric in enumerate(metrics_data):
            with cols[i % 2]:
                st.markdown(f"""
                <div class="anclora-card" style="text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">{metric["icon"]}</div>
                    <div class="anclora-metric-value">{metric["value"]}</div>
                    <div class="anclora-metric-label">{metric["label"]}</div>
                    <small class="status-healthy">{metric["change"]}</small>
                </div>
                """, unsafe_allow_html=True)
    
    def render_current_page(self):
        """Renderizar página actual según navegación"""
        if st.session_state.current_page == 'dashboard':
            self.render_dashboard_page()
        elif st.session_state.current_page == 'execute':
            self.render_execute_page()
        elif st.session_state.current_page == 'metrics':
            self.render_metrics_page()
        elif st.session_state.current_page == 'generate':
            st.markdown("### 🏭 Generar Fixtures")
            st.info("Página de generación en desarrollo - Optimizada para mobile")
        elif st.session_state.current_page == 'reports':
            st.markdown("### 📋 Reportes")
            st.info("Página de reportes en desarrollo - Exportación mobile-friendly")
        elif st.session_state.current_page == 'config':
            st.markdown("### ⚙️ Configuración")
            st.info("Página de configuración en desarrollo - Touch-optimized")
    
    def run(self):
        """Ejecutar aplicación mobile-first"""
        self.render_header()
        self.render_theme_selector()
        self.render_status_banner()
        self.render_mobile_navigation()
        
        # Contenido principal responsive
        self.render_current_page()
        
        # Footer mobile-friendly
        st.markdown("---")
        st.markdown("""
        <div style="text-align: center; color: var(--anclora-text-secondary); padding: 1rem;">
            <small>🧪 Anclora Nexus Testing Suite v2.0 • Mobile-First • Visualmente Impecable</small><br>
            <small>Tema: {theme} • Responsive • 100% Legible</small>
        </div>
        """.format(theme=st.session_state.theme_mode.title()), unsafe_allow_html=True)

# Ejecutar aplicación
def main():
    ui = MobileFirstTestingUI()
    ui.run()

if __name__ == "__main__":
    main()