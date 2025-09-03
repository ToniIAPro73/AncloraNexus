import os
import tempfile
import pandas as pd
import logging

# Importar librerías para visualización
try:
    import matplotlib.pyplot as plt
    import seaborn as sns
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False
    logging.warning("Matplotlib/Seaborn no disponible para CSV→SVG")

try:
    import plotly.express as px
    import plotly.graph_objects as go
    from plotly.offline import plot
    PLOTLY_AVAILABLE = True
except ImportError:
    PLOTLY_AVAILABLE = False
    logging.warning("Plotly no disponible para CSV→SVG")

CONVERSION = ('csv', 'svg')

def convert(input_path, output_path):
    """Convierte CSV a SVG usando visualización inteligente"""
    
    # Método 1: Plotly (RECOMENDADO - SVG interactivo de alta calidad)
    if PLOTLY_AVAILABLE:
        try:
            success, message = convert_with_plotly(input_path, output_path)
            if success:
                return True, f"Conversión CSV→SVG exitosa con Plotly - {message}"
        except Exception as e:
            logging.warning(f"Plotly falló para CSV→SVG: {e}")
    
    # Método 2: Matplotlib (Fallback - SVG estático)
    if MATPLOTLIB_AVAILABLE:
        try:
            success, message = convert_with_matplotlib(input_path, output_path)
            if success:
                return True, f"Conversión CSV→SVG exitosa con Matplotlib - {message}"
        except Exception as e:
            logging.warning(f"Matplotlib falló para CSV→SVG: {e}")
    
    # Método 3: SVG manual básico
    return convert_with_manual_svg(input_path, output_path)

def convert_with_plotly(input_path, output_path):
    """Conversión usando Plotly (SVG interactivo de alta calidad)"""
    try:
        # Leer CSV con pandas
        df = pd.read_csv(input_path, encoding='utf-8')
        
        if df.empty:
            return False, "CSV vacío"
        
        # Análisis inteligente del tipo de gráfico
        chart_type = analyze_best_chart_type(df)
        
        # Crear gráfico según el tipo detectado
        if chart_type == 'line':
            fig = create_line_chart(df)
        elif chart_type == 'bar':
            fig = create_bar_chart(df)
        elif chart_type == 'scatter':
            fig = create_scatter_chart(df)
        elif chart_type == 'pie':
            fig = create_pie_chart(df)
        else:
            fig = create_table_chart(df)  # Fallback
        
        # Configurar para SVG de alta calidad
        fig.update_layout(
            font=dict(family="Arial, sans-serif", size=12),
            plot_bgcolor='white',
            paper_bgcolor='white',
            margin=dict(l=50, r=50, t=50, b=50)
        )
        
        # Exportar como SVG
        fig.write_image(output_path, format='svg', width=800, height=600)
        
        return True, f"Gráfico {chart_type} generado con {len(df)} filas"
        
    except Exception as e:
        return False, f"Error con Plotly: {str(e)}"

def convert_with_matplotlib(input_path, output_path):
    """Conversión usando Matplotlib (SVG estático)"""
    try:
        # Leer CSV
        df = pd.read_csv(input_path, encoding='utf-8')
        
        if df.empty:
            return False, "CSV vacío"
        
        # Configurar matplotlib para SVG
        plt.figure(figsize=(10, 6))
        plt.style.use('default')
        
        # Crear gráfico simple
        if len(df.columns) >= 2:
            # Gráfico de líneas si hay datos numéricos
            numeric_cols = df.select_dtypes(include=['number']).columns
            if len(numeric_cols) >= 2:
                plt.plot(df[numeric_cols[0]], df[numeric_cols[1]], marker='o')
                plt.xlabel(numeric_cols[0])
                plt.ylabel(numeric_cols[1])
            else:
                # Gráfico de barras para datos categóricos
                df.iloc[:, 0].value_counts().head(10).plot(kind='bar')
                plt.xlabel(df.columns[0])
                plt.ylabel('Frecuencia')
        else:
            # Histograma simple
            df.iloc[:, 0].hist(bins=20)
            plt.xlabel(df.columns[0])
            plt.ylabel('Frecuencia')
        
        plt.title(f'Visualización de {os.path.basename(input_path)}')
        plt.tight_layout()
        
        # Guardar como SVG
        plt.savefig(output_path, format='svg', bbox_inches='tight', dpi=300)
        plt.close()
        
        return True, f"Gráfico generado con {len(df)} filas"
        
    except Exception as e:
        return False, f"Error con Matplotlib: {str(e)}"

def convert_with_manual_svg(input_path, output_path):
    """Conversión manual a SVG básico (tabla)"""
    try:
        # Leer CSV
        df = pd.read_csv(input_path, encoding='utf-8')
        
        if df.empty:
            return False, "CSV vacío"
        
        # Generar SVG manual como tabla
        svg_content = generate_svg_table(df)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(svg_content)
        
        return True, f"Tabla SVG generada con {len(df)} filas"
        
    except Exception as e:
        return False, f"Error en conversión manual: {str(e)}"

def analyze_best_chart_type(df):
    """Analiza el DataFrame para determinar el mejor tipo de gráfico"""
    numeric_cols = df.select_dtypes(include=['number']).columns
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns
    
    if len(numeric_cols) >= 2:
        return 'scatter'
    elif len(numeric_cols) == 1 and len(categorical_cols) >= 1:
        return 'bar'
    elif len(categorical_cols) == 1 and df[categorical_cols[0]].nunique() <= 10:
        return 'pie'
    elif len(numeric_cols) >= 1:
        return 'line'
    else:
        return 'table'

def create_line_chart(df):
    """Crear gráfico de líneas con Plotly"""
    numeric_cols = df.select_dtypes(include=['number']).columns
    fig = px.line(df, x=df.index, y=numeric_cols[0], 
                  title=f'Evolución de {numeric_cols[0]}')
    return fig

def create_bar_chart(df):
    """Crear gráfico de barras con Plotly"""
    categorical_cols = df.select_dtypes(include=['object']).columns
    numeric_cols = df.select_dtypes(include=['number']).columns
    
    if len(categorical_cols) > 0 and len(numeric_cols) > 0:
        # Agrupar y sumar
        grouped = df.groupby(categorical_cols[0])[numeric_cols[0]].sum().head(10)
        fig = px.bar(x=grouped.index, y=grouped.values,
                     title=f'{numeric_cols[0]} por {categorical_cols[0]}')
    else:
        fig = px.bar(x=df.index, y=df.iloc[:, 0].head(20),
                     title=f'Valores de {df.columns[0]}')
    return fig

def create_scatter_chart(df):
    """Crear gráfico de dispersión con Plotly"""
    numeric_cols = df.select_dtypes(include=['number']).columns
    fig = px.scatter(df, x=numeric_cols[0], y=numeric_cols[1],
                     title=f'{numeric_cols[1]} vs {numeric_cols[0]}')
    return fig

def create_pie_chart(df):
    """Crear gráfico circular con Plotly"""
    categorical_cols = df.select_dtypes(include=['object']).columns
    if len(categorical_cols) > 0:
        value_counts = df[categorical_cols[0]].value_counts().head(8)
        fig = px.pie(values=value_counts.values, names=value_counts.index,
                     title=f'Distribución de {categorical_cols[0]}')
    else:
        fig = px.pie(values=[1], names=['Datos'], title='Datos CSV')
    return fig

def create_table_chart(df):
    """Crear tabla visual con Plotly"""
    fig = go.Figure(data=[go.Table(
        header=dict(values=list(df.columns),
                    fill_color='paleturquoise',
                    align='left'),
        cells=dict(values=[df[col].head(20) for col in df.columns],
                   fill_color='lavender',
                   align='left'))
    ])
    fig.update_layout(title='Tabla de Datos CSV')
    return fig

def generate_svg_table(df):
    """Genera una tabla SVG manual"""
    rows, cols = min(len(df), 20), len(df.columns)
    cell_width, cell_height = 120, 25
    width = cols * cell_width + 20
    height = (rows + 2) * cell_height + 40
    
    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
    <style>
        .header {{ fill: #4CAF50; font-family: Arial; font-size: 12px; font-weight: bold; }}
        .cell {{ fill: #f9f9f9; font-family: Arial; font-size: 10px; }}
        .border {{ stroke: #ddd; stroke-width: 1; fill: none; }}
    </style>
    <title>Datos CSV</title>
'''
    
    # Encabezados
    for i, col in enumerate(df.columns):
        x = 10 + i * cell_width
        svg += f'    <rect x="{x}" y="10" width="{cell_width}" height="{cell_height}" class="header"/>\n'
        svg += f'    <text x="{x + 5}" y="28" class="header">{col[:15]}</text>\n'
    
    # Datos
    for row_idx in range(min(rows, len(df))):
        for col_idx, col in enumerate(df.columns):
            x = 10 + col_idx * cell_width
            y = 35 + row_idx * cell_height
            value = str(df.iloc[row_idx, col_idx])[:15]
            svg += f'    <rect x="{x}" y="{y}" width="{cell_width}" height="{cell_height}" class="cell"/>\n'
            svg += f'    <text x="{x + 5}" y="{y + 17}" class="cell">{value}</text>\n'
    
    svg += '</svg>'
    return svg
