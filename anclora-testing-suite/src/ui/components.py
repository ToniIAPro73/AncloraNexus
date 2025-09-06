# src/ui/components.py - Componentes visuales avanzados para el dashboard
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import pandas as pd
from typing import Dict, List, Any

def render_metric_card(title: str, value: str, delta: str = None, delta_color: str = "normal", icon: str = "📊"):
    """Renderizar tarjeta de métrica con estilo personalizado"""
    delta_html = ""
    if delta:
        color_map = {
            "normal": "#28a745",
            "inverse": "#dc3545", 
            "off": "#6c757d"
        }
        color = color_map.get(delta_color, "#28a745")
        delta_html = f'<div style="color: {color}; font-size: 0.8em; margin-top: 5px;">{delta}</div>'
    
    card_html = f"""
    <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        border-radius: 15px;
        color: white;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        text-align: center;
        margin: 10px 0;
    ">
        <div style="font-size: 2em; margin-bottom: 10px;">{icon}</div>
        <div style="font-size: 0.9em; opacity: 0.9; margin-bottom: 5px;">{title}</div>
        <div style="font-size: 2.2em; font-weight: bold; margin-bottom: 5px;">{value}</div>
        {delta_html}
    </div>
    """
    st.markdown(card_html, unsafe_allow_html=True)

def render_status_indicator(status: str, label: str = ""):
    """Renderizar indicador de estado con colores"""
    status_config = {
        "online": {"color": "#28a745", "icon": "🟢", "text": "En Línea"},
        "offline": {"color": "#dc3545", "icon": "🔴", "text": "Desconectado"},
        "warning": {"color": "#ffc107", "icon": "🟡", "text": "Advertencia"},
        "processing": {"color": "#17a2b8", "icon": "🔵", "text": "Procesando"}
    }
    
    config = status_config.get(status, status_config["offline"])
    display_text = label if label else config["text"]
    
    indicator_html = f"""
    <div style="
        display: inline-flex;
        align-items: center;
        background: {config['color']}20;
        color: {config['color']};
        padding: 8px 15px;
        border-radius: 20px;
        border: 2px solid {config['color']};
        font-weight: bold;
        margin: 5px;
    ">
        <span style="margin-right: 8px; font-size: 1.2em;">{config['icon']}</span>
        {display_text}
    </div>
    """
    st.markdown(indicator_html, unsafe_allow_html=True)

def render_progress_ring(percentage: float, title: str, color: str = "#3498db"):
    """Renderizar anillo de progreso circular"""
    fig = go.Figure(go.Indicator(
        mode = "gauge+number+delta",
        value = percentage,
        domain = {'x': [0, 1], 'y': [0, 1]},
        title = {'text': title, 'font': {'size': 16}},
        delta = {'reference': 90, 'increasing': {'color': "green"}, 'decreasing': {'color': "red"}},
        gauge = {
            'axis': {'range': [None, 100], 'tickwidth': 1, 'tickcolor': "darkblue"},
            'bar': {'color': color, 'thickness': 0.3},
            'bgcolor': "white",
            'borderwidth': 2,
            'bordercolor': "gray",
            'steps': [
                {'range': [0, 50], 'color': '#ffebee'},
                {'range': [50, 80], 'color': '#fff3e0'},
                {'range': [80, 100], 'color': '#e8f5e8'}
            ],
            'threshold': {
                'line': {'color': "red", 'width': 4},
                'thickness': 0.75,
                'value': 90
            }
        }
    ))
    
    fig.update_layout(
        height=300,
        margin=dict(l=20, r=20, t=40, b=20),
        font={'color': "darkblue", 'family': "Arial"}
    )
    
    return fig

def render_heatmap_calendar(data: Dict[str, float], title: str = "Actividad Diaria"):
    """Renderizar mapa de calor tipo calendario"""
    # Convertir datos a formato de calendario
    dates = list(data.keys())
    values = list(data.values())
    
    # Crear DataFrame para el heatmap
    df = pd.DataFrame({
        'date': pd.to_datetime(dates),
        'value': values
    })
    
    df['day_of_week'] = df['date'].dt.day_name()
    df['week'] = df['date'].dt.isocalendar().week
    
    fig = px.density_heatmap(
        df, 
        x='week', 
        y='day_of_week',
        z='value',
        color_continuous_scale='Viridis',
        title=title
    )
    
    fig.update_layout(
        height=300,
        xaxis_title="Semana",
        yaxis_title="Día de la Semana"
    )
    
    return fig

def render_real_time_chart(data: List[Dict], title: str = "Actividad en Tiempo Real"):
    """Renderizar gráfico de actividad en tiempo real"""
    df = pd.DataFrame(data)
    
    fig = go.Figure()
    
    # Agregar línea principal
    fig.add_trace(go.Scatter(
        x=df['timestamp'],
        y=df['value'],
        mode='lines+markers',
        name='Actividad',
        line=dict(color='#3498db', width=3),
        marker=dict(size=8, color='#e74c3c'),
        fill='tonexty'
    ))
    
    fig.update_layout(
        title=title,
        xaxis_title="Tiempo",
        yaxis_title="Actividad",
        height=300,
        showlegend=False,
        hovermode='x unified'
    )
    
    return fig

def render_comparison_radar(data: Dict[str, List], categories: List[str], title: str = "Análisis Comparativo"):
    """Renderizar gráfico de radar para comparaciones"""
    fig = go.Figure()
    
    colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6']
    
    for i, (tool, values) in enumerate(data.items()):
        fig.add_trace(go.Scatterpolar(
            r=values,
            theta=categories,
            fill='toself',
            name=tool,
            line_color=colors[i % len(colors)]
        ))
    
    fig.update_layout(
        polar=dict(
            radialaxis=dict(
                visible=True,
                range=[0, 100]
            )),
        showlegend=True,
        title=title,
        height=500
    )
    
    return fig

def render_waterfall_chart(data: Dict[str, float], title: str = "Análisis de Flujo"):
    """Renderizar gráfico de cascada"""
    categories = list(data.keys())
    values = list(data.values())
    
    fig = go.Figure(go.Waterfall(
        name="Flujo",
        orientation="v",
        measure=["relative"] * (len(categories) - 1) + ["total"],
        x=categories,
        textposition="outside",
        text=[f"{v:+.1f}" for v in values],
        y=values,
        connector={"line": {"color": "rgb(63, 63, 63)"}},
    ))
    
    fig.update_layout(
        title=title,
        showlegend=False,
        height=400
    )
    
    return fig

def render_animated_counter(target_value: int, label: str, duration: int = 2):
    """Renderizar contador animado"""
    placeholder = st.empty()
    
    import time
    steps = 20
    step_value = target_value / steps
    
    for i in range(steps + 1):
        current_value = int(step_value * i)
        placeholder.metric(label, f"{current_value:,}")
        time.sleep(duration / steps)

def render_timeline_chart(events: List[Dict], title: str = "Línea de Tiempo"):
    """Renderizar gráfico de línea de tiempo"""
    fig = go.Figure()
    
    for i, event in enumerate(events):
        fig.add_trace(go.Scatter(
            x=[event['timestamp']],
            y=[i],
            mode='markers+text',
            marker=dict(
                size=15,
                color=event.get('color', '#3498db'),
                symbol='circle'
            ),
            text=event['title'],
            textposition="middle right",
            name=event['title'],
            showlegend=False
        ))
    
    fig.update_layout(
        title=title,
        xaxis_title="Tiempo",
        yaxis=dict(showticklabels=False),
        height=400,
        hovermode='closest'
    )
    
    return fig

def render_performance_dashboard(metrics: Dict[str, Any]):
    """Renderizar dashboard completo de rendimiento"""
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        render_metric_card(
            "Tasa de Éxito",
            f"{metrics.get('success_rate', 0):.1f}%",
            "+2.3% vs ayer",
            "normal",
            "🎯"
        )
    
    with col2:
        render_metric_card(
            "Tests Ejecutados",
            f"{metrics.get('total_tests', 0):,}",
            "+45 vs ayer",
            "normal",
            "🧪"
        )
    
    with col3:
        render_metric_card(
            "Tiempo Promedio",
            f"{metrics.get('avg_time', 0):.1f}s",
            "-0.2s vs ayer",
            "normal",
            "⏱️"
        )
    
    with col4:
        render_metric_card(
            "Uso de CPU",
            f"{metrics.get('cpu_usage', 0):.1f}%",
            "+5.2% vs ayer",
            "inverse",
            "💻"
        )

def render_alert_banner(message: str, alert_type: str = "info"):
    """Renderizar banner de alerta"""
    type_config = {
        "info": {"color": "#17a2b8", "icon": "ℹ️", "bg": "linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)"},
        "success": {"color": "#28a745", "icon": "✅", "bg": "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)"},
        "warning": {"color": "#ffc107", "icon": "⚠️", "bg": "linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)"},
        "error": {"color": "#dc3545", "icon": "❌", "bg": "linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)"}
    }

    config = type_config.get(alert_type, type_config["info"])

    banner_html = f"""
    <div style="
        background: {config['bg']};
        border-left: 5px solid {config['color']};
        padding: 15px 20px;
        margin: 15px 0;
        border-radius: 10px;
        display: flex;
        align-items: center;
        font-weight: bold;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        animation: fadeIn 0.6s ease-out;
    ">
        <span style="font-size: 1.5em; margin-right: 15px;">{config['icon']}</span>
        <span style="color: {config['color']};">{message}</span>
    </div>
    """
    st.markdown(banner_html, unsafe_allow_html=True)

def render_advanced_metric_grid(metrics: Dict[str, Any]):
    """Renderizar grid avanzado de métricas con animaciones"""
    grid_html = """
    <style>
    @keyframes countUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .metric-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin: 20px 0;
    }

    .advanced-metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 25px;
        border-radius: 15px;
        text-align: center;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        animation: countUp 0.8s ease-out;
        position: relative;
        overflow: hidden;
    }

    .advanced-metric-card::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
        transform: rotate(45deg);
        transition: all 0.5s;
        opacity: 0;
    }

    .advanced-metric-card:hover::before {
        animation: shine 0.8s ease-in-out;
        opacity: 1;
    }

    .advanced-metric-card:hover {
        transform: translateY(-10px) scale(1.02);
        box-shadow: 0 15px 35px rgba(0,0,0,0.2);
    }

    @keyframes shine {
        0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
        100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
    }

    .metric-icon {
        font-size: 3em;
        margin-bottom: 15px;
        display: block;
    }

    .metric-title {
        font-size: 0.9em;
        opacity: 0.9;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .metric-value {
        font-size: 2.5em;
        font-weight: bold;
        margin-bottom: 10px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .metric-delta {
        font-size: 0.8em;
        opacity: 0.8;
    }
    </style>

    <div class="metric-grid">
    """

    for key, data in metrics.items():
        icon = data.get('icon', '📊')
        title = data.get('title', key.title())
        value = data.get('value', '0')
        delta = data.get('delta', '')

        grid_html += f"""
        <div class="advanced-metric-card">
            <span class="metric-icon">{icon}</span>
            <div class="metric-title">{title}</div>
            <div class="metric-value">{value}</div>
            <div class="metric-delta">{delta}</div>
        </div>
        """

    grid_html += "</div>"
    st.markdown(grid_html, unsafe_allow_html=True)

def render_interactive_timeline(events: List[Dict], title: str = "Timeline de Actividades"):
    """Renderizar timeline interactivo con eventos"""
    timeline_html = f"""
    <style>
    .timeline-container {{
        background: white;
        border-radius: 15px;
        padding: 25px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        margin: 20px 0;
    }}

    .timeline-title {{
        font-size: 1.5em;
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 25px;
        text-align: center;
    }}

    .timeline {{
        position: relative;
        padding-left: 30px;
    }}

    .timeline::before {{
        content: '';
        position: absolute;
        left: 15px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: linear-gradient(to bottom, #3498db, #2ecc71);
    }}

    .timeline-item {{
        position: relative;
        margin-bottom: 25px;
        background: #f8f9fa;
        padding: 15px 20px;
        border-radius: 10px;
        border-left: 4px solid #3498db;
        transition: all 0.3s ease;
        animation: slideIn 0.5s ease-out;
    }}

    .timeline-item:hover {{
        transform: translateX(10px);
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        background: white;
    }}

    .timeline-item::before {{
        content: '';
        position: absolute;
        left: -37px;
        top: 20px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #3498db;
        border: 3px solid white;
        box-shadow: 0 0 0 3px #3498db;
    }}

    .timeline-time {{
        font-size: 0.8em;
        color: #7f8c8d;
        margin-bottom: 5px;
    }}

    .timeline-title-item {{
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 5px;
    }}

    .timeline-description {{
        color: #5a6c7d;
        font-size: 0.9em;
    }}

    @keyframes slideIn {{
        from {{ opacity: 0; transform: translateX(-20px); }}
        to {{ opacity: 1; transform: translateX(0); }}
    }}
    </style>

    <div class="timeline-container">
        <div class="timeline-title">{title}</div>
        <div class="timeline">
    """

    for i, event in enumerate(events):
        timeline_html += f"""
        <div class="timeline-item" style="animation-delay: {i * 0.1}s;">
            <div class="timeline-time">{event.get('timestamp', 'Ahora')}</div>
            <div class="timeline-title-item">{event.get('status', '🔄')} {event.get('action', 'Acción')}</div>
            <div class="timeline-description">{event.get('details', 'Sin detalles')} - {event.get('duration', '0s')}</div>
        </div>
        """

    timeline_html += """
        </div>
    </div>
    """

    st.markdown(timeline_html, unsafe_allow_html=True)
