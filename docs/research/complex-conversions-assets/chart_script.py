import plotly.graph_objects as go
import pandas as pd

# Data provided
data = {
    "conversiones": [
        "Texto plano con formato simple (Word a PDF)",
        "Documentos con tablas simples (PDF a Excel)",
        "Formularios con campos interactivos a formatos planos",
        "Documentos multiidioma con escrituras no latinas",
        "Presentaciones con animaciones y multimedia a documentos estáticos",
        "PDFs con gráficos vectoriales complejos a formatos editables",
        "Documentos manuscritos y notas técnicas (OCR)",
        "PDFs escaneados con tablas complejas y múltiples columnas (OCR)",
        "Documentos científicos con notaciones especiales a Word/texto plano",
        "Fórmulas matemáticas complejas (LaTeX) a formatos reflowables (EPUB)",
        "Documentos CAD/Técnicos con vectores y modelos 3D a formatos editables"
    ],
    "complejidad": [2.0, 4.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5]
}

# Create DataFrame
df = pd.DataFrame(data)

# Sort by complexity (descending - highest on top)
df_sorted = df.sort_values('complejidad', ascending=True)  # ascending=True for horizontal bars puts highest at top

# Function to assign colors based on complexity (4 distinct levels)
def get_color(complexity):
    if complexity >= 8.0:  # Very complex
        return '#DB4545'  # Bright red
    elif complexity >= 6.5:  # Complex
        return '#964325'  # Dark orange
    elif complexity >= 4.0:  # Medium
        return '#D2BA4C'  # Moderate yellow
    else:  # Simple
        return '#2E8B57'  # Sea green

# Create colors for each bar
colors = [get_color(comp) for comp in df_sorted['complejidad']]

# Create better abbreviations that are more readable
abbreviated_names = []
for name in df_sorted['conversiones']:
    if "CAD" in name:
        abbreviated_names.append("CAD 3D Models")
    elif "LaTeX" in name:
        abbreviated_names.append("LaTeX to EPUB")
    elif "científicos" in name:
        abbreviated_names.append("Scientific Docs")
    elif "escaneados" in name:
        abbreviated_names.append("Scanned PDFs")
    elif "manuscritos" in name:
        abbreviated_names.append("Handwritten OCR")
    elif "vectoriales" in name:
        abbreviated_names.append("Vector PDFs")
    elif "animaciones" in name:
        abbreviated_names.append("Multimedia PPT")
    elif "multiidioma" in name:
        abbreviated_names.append("Multi-language")
    elif "interactivos" in name:
        abbreviated_names.append("Interactive Forms")
    elif "tablas simples" in name:
        abbreviated_names.append("Simple Tables")
    elif "formato simple" in name:
        abbreviated_names.append("Plain Text")
    else:
        abbreviated_names.append(name[:15])

# Create horizontal bar chart
fig = go.Figure(data=go.Bar(
    x=df_sorted['complejidad'],
    y=abbreviated_names,
    orientation='h',
    marker=dict(color=colors),
    hovertemplate='<b>%{y}</b><br>Complexity: %{x}<extra></extra>'
))

# Update layout
fig.update_layout(
    title='Doc Conversion Complexity Ranking',
    xaxis_title='Complexity',
    yaxis_title='Conversion Type',
    showlegend=False
)

# Update traces
fig.update_traces(cliponaxis=False)

# Update axes
fig.update_xaxes(range=[0, 10])
fig.update_yaxes(categoryorder='array', categoryarray=abbreviated_names[::-1])  # Reverse order for descending

# Save the chart
fig.write_image("document_conversion_complexity.png")