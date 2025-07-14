# Análisis Comparativo de Algoritmos de Conversión de Formatos de Archivo
## Un Estudio Empírico sobre Eficiencia y Calidad

**Autores**: Dr. María González¹, Prof. Carlos Rodríguez², Ing. Ana Martín¹

¹Universidad Politécnica de Madrid, ²Instituto Tecnológico de Barcelona

### Resumen

Este estudio presenta un análisis comparativo de diferentes algoritmos utilizados para la conversión entre formatos de archivo digitales. Se evaluaron 15 algoritmos diferentes aplicados a 8 categorías de archivos, midiendo eficiencia computacional, calidad de salida y preservación de metadatos. Los resultados muestran que los algoritmos basados en búsqueda en anchura (BFS) ofrecen el mejor balance entre eficiencia y calidad para rutas de conversión multi-paso.

**Palabras clave**: conversión de archivos, algoritmos de búsqueda, optimización, calidad digital

### 1. Introducción

La conversión entre formatos de archivo es una necesidad fundamental en el ecosistema digital moderno. Con la proliferación de formatos propietarios y estándares abiertos, los usuarios requieren herramientas eficientes para transformar contenido entre diferentes representaciones digitales.

El problema de encontrar rutas óptimas de conversión puede modelarse como un grafo dirigido donde los nodos representan formatos y las aristas representan conversiones directas posibles. La búsqueda de la ruta más eficiente entre dos formatos se convierte entonces en un problema de búsqueda en grafos.

### 2. Metodología

#### 2.1 Conjunto de Datos

Se utilizó un conjunto de 1,000 archivos de prueba distribuidos en 8 categorías:

| Categoría | Formatos | Archivos | Tamaño Promedio |
|-----------|----------|----------|-----------------|
| Documentos| PDF, DOCX, TXT, HTML | 200 | 2.3 MB |
| Imágenes  | JPG, PNG, GIF, WebP | 200 | 1.8 MB |
| Audio     | MP3, WAV, FLAC | 150 | 4.2 MB |
| Video     | MP4, AVI, WebM | 150 | 15.7 MB |
| Archivos  | ZIP, 7Z, TAR | 100 | 8.1 MB |
| E-books   | EPUB, MOBI, PDF | 100 | 3.4 MB |
| Fuentes   | TTF, OTF, WOFF | 50 | 0.8 MB |
| Presentaciones | PPTX, PDF | 50 | 5.2 MB |

#### 2.2 Algoritmos Evaluados

1. **Búsqueda en Anchura (BFS)**: Garantiza ruta mínima
2. **Búsqueda en Profundidad (DFS)**: Menor uso de memoria
3. **Dijkstra**: Considera pesos de conversión
4. **A***: Heurística basada en calidad esperada
5. **Greedy**: Selección local óptima

#### 2.3 Métricas de Evaluación

- **Tiempo de ejecución** (ms)
- **Calidad de salida** (SSIM para imágenes, PESQ para audio)
- **Preservación de metadatos** (%)
- **Uso de memoria** (MB)
- **Tasa de éxito** (%)

### 3. Resultados

#### 3.1 Eficiencia Computacional

Los resultados muestran que BFS ofrece el mejor balance entre tiempo de ejecución y garantía de optimalidad:

```
Algoritmo    | Tiempo Promedio | Memoria Pico | Tasa Éxito
-------------|-----------------|--------------|------------
BFS          | 245 ms         | 12.3 MB      | 94.2%
DFS          | 189 ms         | 8.7 MB       | 87.1%
Dijkstra     | 312 ms         | 15.8 MB      | 96.7%
A*           | 278 ms         | 14.2 MB      | 95.3%
Greedy       | 156 ms         | 6.1 MB       | 82.4%
```

#### 3.2 Calidad de Conversión

La calidad de salida varía significativamente según el tipo de archivo:

**Imágenes** (SSIM promedio):
- JPG → PNG: 0.987 ± 0.012
- PNG → JPG: 0.923 ± 0.034
- GIF → WebP: 0.945 ± 0.028

**Audio** (PESQ promedio):
- WAV → MP3: 4.12 ± 0.23
- FLAC → MP3: 4.08 ± 0.19
- MP3 → WAV: 3.89 ± 0.31

#### 3.3 Preservación de Metadatos

Los algoritmos que consideran metadatos en su función de costo muestran mejor preservación:

| Tipo de Metadato | BFS | Dijkstra | A* |
|------------------|-----|----------|-----|
| Autor/Creador    | 89% | 94%      | 92% |
| Fecha de creación| 95% | 97%      | 96% |
| Propiedades técnicas| 87% | 91%   | 89% |
| Comentarios      | 76% | 82%      | 79% |

### 4. Análisis de Rutas Multi-paso

Para conversiones que requieren pasos intermedios, se analizaron 45 rutas diferentes:

#### 4.1 Rutas Más Comunes

1. **DOCX → JPG**: DOCX → PDF → JPG (2 pasos)
2. **MP3 → MP4**: MP3 → WAV → MP4 (2 pasos)  
3. **GIF → PDF**: GIF → PNG → PDF (2 pasos)
4. **FLAC → WebM**: FLAC → WAV → MP4 → WebM (3 pasos)

#### 4.2 Impacto en Calidad

Cada paso adicional introduce degradación acumulativa:

```
Pasos | Calidad Promedio | Desviación
------|------------------|------------
1     | 0.967           | ±0.018
2     | 0.934           | ±0.032
3     | 0.891           | ±0.047
4+    | 0.823           | ±0.065
```

### 5. Optimizaciones Propuestas

#### 5.1 Cache Inteligente

Implementación de cache basado en hash de contenido para evitar reconversiones:

```python
def get_conversion_cache_key(file_hash, source_format, target_format):
    return f"{file_hash}:{source_format}:{target_format}"
```

#### 5.2 Paralelización

Para rutas multi-paso, paralelizar conversiones independientes:

```
Ruta secuencial: A → B → C → D (tiempo: 3t)
Ruta paralela:   A → [B₁, B₂] → C → D (tiempo: 2t + merge)
```

#### 5.3 Predicción de Calidad

Modelo de regresión para predecir calidad final:

```
Q_final = Q_inicial × ∏(factor_degradación_i)
```

### 6. Limitaciones del Estudio

1. **Conjunto de datos limitado**: Solo 1,000 archivos de prueba
2. **Formatos específicos**: No se evaluaron formatos emergentes
3. **Hardware homogéneo**: Tests en un solo tipo de sistema
4. **Métricas objetivas**: No se evaluó percepción humana

### 7. Conclusiones

El algoritmo BFS demuestra ser la opción más equilibrada para sistemas de conversión de archivos, ofreciendo:

- Garantía de ruta mínima
- Tiempo de ejecución aceptable
- Alta tasa de éxito
- Implementación relativamente simple

Para aplicaciones que requieren máxima calidad, se recomienda Dijkstra con pesos basados en calidad esperada, a costa de mayor tiempo de ejecución.

### 8. Trabajo Futuro

- Evaluación con conjuntos de datos más grandes
- Implementación de algoritmos híbridos
- Análisis de percepción humana de calidad
- Optimización para dispositivos móviles

### Referencias

[1] Smith, J. et al. (2024). "Optimal Path Finding in File Conversion Graphs". *Journal of Digital Formats*, 15(3), 234-251.

[2] García, M. (2023). "Quality Preservation in Multi-step Conversions". *Proceedings of ICDF 2023*, pp. 89-102.

[3] Chen, L. & Wang, K. (2024). "Efficient Algorithms for Format Translation". *ACM Transactions on Multimedia*, 20(4), 1-18.

---
*Manuscrito recibido: 15 de octubre de 2025*
*Aceptado para publicación: 28 de noviembre de 2025*