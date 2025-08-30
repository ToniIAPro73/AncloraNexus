# Sistema de Notificaciones para Anclora Nexus

Este sistema de notificaciones está diseñado para proporcionar una experiencia de usuario mejorada con notificaciones contextuales para las operaciones de conversión de archivos en Anclora Nexus.

## Características principales

- **Notificaciones con progreso**: Muestra el avance de las operaciones de conversión
- **Múltiples tipos de notificaciones**: Success, Error, Info, Warning y Progress
- **Notificaciones accionables**: Con botones para realizar acciones como descargas
- **Notificaciones de operaciones por lotes**: Visualización del estado global de múltiples conversiones
- **Notificaciones para características premium**: Promoción de funciones premium con opciones de actualización

## Componentes del sistema

El sistema de notificaciones consta de tres componentes principales:

1. **`useNotifications` Hook**: API central para gestionar notificaciones
2. **`BatchOperationNotification`**: Componente para visualizar operaciones por lotes
3. **`PremiumFeatureNotification`**: Componente para promover características premium

## Cómo utilizar el sistema

### 1. Importar el hook de notificaciones

```tsx
import { useNotifications } from './NotificationSystem';
```

### 2. Utilizar el hook en tu componente

```tsx
function MyComponent() {
  const { 
    notifySuccess, 
    notifyError,
    notifyInfo,
    notifyWarning,
    notifyProgress,
    notifyFileConversion,
    updateNotification,
    closeNotification
  } = useNotifications();

  // Tu código aquí...
}
```

### 3. Mostrar una notificación simple

```tsx
// Notificación de éxito
notifySuccess(
  'Conversión completada', 
  'El archivo ha sido convertido correctamente'
);

// Notificación de error
notifyError(
  'Error en la conversión', 
  'No se ha podido convertir el archivo'
);

// Notificación informativa
notifyInfo(
  'Procesando archivo', 
  'El archivo está siendo procesado'
);

// Notificación de advertencia
notifyWarning(
  'Formato no óptimo', 
  'El formato seleccionado puede resultar en pérdida de calidad'
);
```

### 4. Mostrar una notificación con progreso

```tsx
// Iniciar notificación con progreso
const notificationId = notifyProgress(
  'Convirtiendo archivo', 
  0
);

// Actualizar progreso
updateNotification(notificationId, {
  progress: 50,
  message: '50% completado'
});

// Completar progreso
updateNotification(notificationId, {
  type: 'success',
  title: 'Conversión completada',
  message: '100% completado',
  progress: 100,
  autoClose: true
});
```

### 5. Notificaciones de conversión de archivos

El sistema incluye una función especializada para notificaciones de conversión de archivos:

```tsx
// Iniciar conversión
notifyFileConversion({
  status: 'started',
  fileName: 'document.pdf',
  fileType: 'pdf',
  targetType: 'docx'
});

// Actualizar progreso
notifyFileConversion({
  status: 'progress',
  fileName: 'document.pdf',
  fileType: 'pdf',
  targetType: 'docx',
  progress: 50
});

// Completar conversión
notifyFileConversion({
  status: 'completed',
  fileName: 'document.pdf',
  fileType: 'pdf',
  targetType: 'docx',
  downloadUrl: 'https://example.com/document.docx'
});

// Error en conversión
notifyFileConversion({
  status: 'error',
  fileName: 'document.pdf',
  fileType: 'pdf',
  targetType: 'docx',
  errorMessage: 'Error al procesar el archivo'
});
```

### 6. Notificaciones con acciones

```tsx
notifyInfo(
  'Archivo listo para descargar',
  'Tu archivo ha sido procesado y está listo para descargar',
  {
    actions: [
      {
        label: 'Descargar',
        onClick: () => {
          window.open('https://example.com/download/file.pdf', '_blank');
        },
        icon: <Download size={14} />,
        primary: true
      }
    ],
    autoClose: false
  }
);
```

### 7. Notificaciones por lotes

El componente `BatchOperationNotification` muestra el estado de operaciones por lotes:

```tsx
<BatchOperationNotification
  title="Procesando lote de archivos"
  totalItems={10}
  completedItems={7}
  failedItems={1}
  onViewDetails={() => setActiveTab('batch')}
  onDismiss={() => hideBatchNotification()}
/>
```

### 8. Notificaciones de características premium

El componente `PremiumFeatureNotification` promociona características premium:

```tsx
<PremiumFeatureNotification
  featureName="Análisis avanzado"
  description="Obtén estadísticas detalladas sobre tus conversiones de archivos."
  onUpgrade={() => upgradeToPremium()}
  onDismiss={() => hidePremiumNotification()}
/>
```

## Integración con componentes existentes

### Ejemplo: Integración con BatchConversion

```tsx
import { useNotifications } from './NotificationSystem';

export function BatchConversion({ files, onConvert }) {
  const { 
    notifySuccess, 
    notifyFileConversion, 
    updateNotification 
  } = useNotifications();

  const handleConversion = (files, targetFormat) => {
    const notificationId = notifyInfo(
      `Iniciando conversión de ${files.length} archivos`,
      '0% completado',
      { autoClose: false }
    );

    // Lógica de conversión...

    files.forEach((file, index) => {
      // Notificación por archivo
      notifyFileConversion({
        status: 'started',
        fileName: file.name,
        fileType: file.type,
        targetType: targetFormat
      });

      // Actualizar progreso global
      const progress = Math.floor(((index + 1) / files.length) * 100);
      updateNotification(notificationId, {
        progress,
        message: `${index + 1} de ${files.length} archivos procesados`
      });
    });

    // Notificación de finalización
    notifySuccess(
      'Conversión por lotes completada',
      `${files.length} archivos han sido convertidos exitosamente`
    );
  };

  return (
    // Componente...
  );
}
```

### Ejemplo: Integración con ConversionAssistant

```tsx
import { useNotifications } from './NotificationSystem';

export function ConversionAssistant({ isPremium }) {
  const { notifyInfo } = useNotifications();

  const checkPremiumFeature = () => {
    if (!isPremium) {
      notifyInfo(
        'Función Premium',
        'El asistente de conversión avanzado requiere una cuenta premium',
        {
          actions: [
            {
              label: 'Actualizar',
              onClick: () => showUpgradeModal(),
              primary: true
            }
          ],
          autoClose: false
        }
      );
      return false;
    }
    return true;
  };

  return (
    // Componente...
  );
}
```

## Consejos de implementación

1. **Grupos de notificaciones**: Usa el parámetro `groupId` para agrupar notificaciones relacionadas
2. **Duración personalizada**: Ajusta el tiempo de visualización con el parámetro `duration`
3. **Actualización de notificaciones**: Guarda los IDs de notificación para actualizarlas posteriormente
4. **Acciones múltiples**: Proporciona acciones contextuales para mejorar la experiencia de usuario
5. **Datos adicionales**: Usa el parámetro `data` para almacenar información relevante

## Personalización

El sistema de notificaciones utiliza el componente Toast subyacente y se integra con el sistema de diseño actual de Anclora Nexus. Las notificaciones son estilizadas automáticamente para coincidir con la paleta de colores y el diseño de la aplicación.

---

Para más detalles sobre la implementación, consulta el archivo `NotificationSystem.tsx` y los ejemplos en `NotificationIntegration.tsx`.
