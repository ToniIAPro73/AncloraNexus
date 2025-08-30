# Anclora Nexus - Componentes Avanzados

Este repositorio contiene los nuevos componentes avanzados desarrollados para Anclora Nexus, nuestra plataforma de conversiÃ³n de archivos.

## Nuevos Componentes

### 1. BatchConversion

Convierte mÃºltiples archivos simultÃ¡neamente con seguimiento individual de progreso y resultados.

```jsx
<BatchConversion />
```

### 2. AdvancedSettings

Personaliza el proceso de conversiÃ³n con opciones detalladas y presets guardables.

```jsx
<AdvancedSettings
  formatFrom="PDF"
  formatTo="DOCX"
  settings={conversionSettings}
  onChange={handleApplySettings}
  isPremiumUser={true}
  onSavePreset={handleSavePreset}
  presets={conversionPresets}
  onSelectPreset={handleSelectPreset}
/>
```

### 3. UsageAnalytics

Visualiza estadÃ­sticas de uso de la plataforma con grÃ¡ficos y datos detallados.

```jsx
<UsageAnalytics
  userId="user-123"
  isPremiumUser={true}
  period="monthly"
  onChangePeriod={handleChangePeriod}
/>
```

### 4. FormatComparison

Compara diferentes formatos de archivo para elegir el mÃ¡s adecuado para cada necesidad.

```jsx
<FormatComparison
  onSelectFormat={handleSelectFormat}
/>
```

### 5. ConversionAssistant

Asistente interactivo basado en chat para guiar el proceso de conversiÃ³n y responder dudas.

```jsx
<ConversionAssistant
  userName="Ana GarcÃ­a"
  onRequestConversion={handleRequestConversion}
  onRequestFormatInfo={handleRequestFormatInfo}
  isPremium={true}
/>
```

### 6. ConversionOptimization

Optimiza archivos durante la conversiÃ³n con recomendaciones inteligentes.

```jsx
<ConversionOptimization
  fileName="informe_anual_2023.pdf"
  fileSize={4500000}
  fileType="pdf"
  isPremiumUser={true}
  onApplyOptimizations={handleApplyOptimizations}
  onDownload={handleDownloadOptimized}
/>
```

## Demo de IntegraciÃ³n

El componente `AdvancedFeaturesDemo` muestra la integraciÃ³n de todos estos componentes en una interfaz unificada:

```jsx
<AdvancedFeaturesDemo />
```

## Requerimientos

- React 17 o superior
- TypeScript 4.5 o superior
- Lucide React (para iconos)
- @tremor/react (para grÃ¡ficos en UsageAnalytics)

## InstalaciÃ³n

1. Clona este repositorio
2. Instala las dependencias con `npm install`
3. Ejecuta el proyecto con `npm start`

## DocumentaciÃ³n

Para una documentaciÃ³n detallada, consulta [docs/advanced_components.md](docs/advanced_components.md).

## Problemas conocidos

- Hay problemas de casing en las importaciones de componentes UI que deben ser resueltos
- Los componentes necesitan ser adaptados para usar correctamente la estructura de UI actual del proyecto

## Contribuciones

Las contribuciones son bienvenidas. Por favor, lee [CONTRIBUTING.md](CONTRIBUTING.md) para mÃ¡s detalles.

## Licencia

Este proyecto estÃ¡ bajo la Licencia MIT.

