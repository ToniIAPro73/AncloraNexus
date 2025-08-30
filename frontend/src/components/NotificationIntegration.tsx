// NotificationIntegration.tsx
// This file demonstrates how to integrate the NotificationSystem with existing components

import { useNotifications, BatchOperationNotification, PremiumFeatureNotification } from './NotificationSystem';

/**
 * This module shows how to integrate the new notification system with your existing components.
 * Copy the examples below into your components as needed.
 * 
 * USAGE EXAMPLES:
 */

// Example 1: Basic file conversion notifications
export function useFileConversionNotifications() {
  const { 
    notifySuccess, 
    notifyInfo,
    notifyFileConversion,
    updateNotification
  } = useNotifications();
  
  // Example function to notify about file upload
  const notifyFileUploaded = (fileName: string, fileSize: number) => {
    notifySuccess(
      'Archivo subido', 
      `${fileName} (${formatFileSize(fileSize)}) ha sido subido correctamente.`
    );
  };
  
  // Example function to notify and track file conversion
  const notifyConversionProcess = (
    fileName: string, 
    sourceFormat: string, 
    targetFormat: string
  ) => {
    // Start conversion notification
    const notifId = notifyFileConversion({
      status: 'started',
      fileName,
      fileType: sourceFormat,
      targetType: targetFormat
    });
    
    // Update with progress (call this when progress updates)
    const updateProgress = (progress: number) => {
      updateNotification(notifId, {
        progress,
        message: `${progress}% completado`
      });
    };
    
    // Complete notification (call when done)
    const completeNotification = (downloadUrl: string) => {
      notifyFileConversion({
        status: 'completed',
        fileName,
        fileType: sourceFormat,
        targetType: targetFormat,
        downloadUrl
      });
    };
    
    // Error notification (call on error)
    const errorNotification = (errorMessage: string) => {
      notifyFileConversion({
        status: 'error',
        fileName,
        fileType: sourceFormat,
        targetType: targetFormat,
        errorMessage
      });
    };
    
    return {
      notificationId: notifId,
      updateProgress,
      completeNotification,
      errorNotification
    };
  };
  
  // Example function for batch notification
  const notifyBatchProcess = (totalFiles: number) => {
    const notifId = notifyInfo(
      `Procesando ${totalFiles} archivos`,
      '0% completado',
      { autoClose: false }
    );
    
    // Update batch progress
    const updateBatchProgress = (completed: number, failed: number) => {
      const progress = Math.floor(((completed + failed) / totalFiles) * 100);
      updateNotification(notifId, {
        progress,
        message: `${completed + failed} de ${totalFiles} archivos procesados`
      });
    };
    
    // Complete batch notification
    const completeBatchNotification = (completed: number, failed: number) => {
      const message = failed > 0
        ? `Completados: ${completed}, Fallidos: ${failed}`
        : `${completed} archivos procesados correctamente`;
        
      updateNotification(notifId, {
        type: failed > 0 ? 'warning' : 'success',
        title: 'Procesamiento por lotes completado',
        message,
        autoClose: true,
        duration: 5000
      });
    };
    
    return {
      updateBatchProgress,
      completeBatchNotification
    };
  };
  
  // Notify premium feature requirement
  const notifyPremiumRequired = (featureName: string, onUpgrade?: () => void) => {
    notifyInfo(
      'Función Premium',
      `La función "${featureName}" requiere una cuenta premium`,
      {
        actions: onUpgrade ? [
          {
            label: 'Actualizar',
            onClick: onUpgrade
          }
        ] : undefined,
        autoClose: false
      }
    );
  };
  
  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return {
    notifyFileUploaded,
    notifyConversionProcess,
    notifyBatchProcess,
    notifyPremiumRequired
  };
}

// Example 2: Component that uses BatchOperationNotification
export function BatchProcessStatus({ 
  batchId,
  title,
  totalFiles,
  completedFiles,
  failedFiles,
  onViewDetails
}: {
  batchId: string;
  title: string;
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  onViewDetails?: () => void;
}) {
  const handleDismiss = () => {
    // Handle dismissal logic here
    console.log('Batch notification dismissed', batchId);
  };
  
  return (
    <div className="fixed bottom-4 right-4 w-80 z-50">
      <BatchOperationNotification
        title={title}
        totalItems={totalFiles}
        completedItems={completedFiles}
        failedItems={failedFiles}
        onViewDetails={onViewDetails}
        onDismiss={handleDismiss}
      />
    </div>
  );
}

// Example 3: Component that displays premium feature notification
export function PremiumFeaturePromotion({
  featureName,
  description,
  onUpgrade
}: {
  featureName: string;
  description: string;
  onUpgrade: () => void;
}) {
  return (
    <div className="my-4">
      <PremiumFeatureNotification
        featureName={featureName}
        description={description}
        onUpgrade={onUpgrade}
        onDismiss={() => console.log('Premium feature notification dismissed')}
      />
    </div>
  );
}

/*
 * INTEGRATION GUIDE - HOW TO ADD THE NOTIFICATION SYSTEM TO YOUR COMPONENTS
 * 
 * 1. Import from NotificationSystem.tsx:
 *    import { useNotifications } from './NotificationSystem';
 * 
 * 2. Use the hook in your component:
 *    const { notifySuccess, notifyError, notifyInfo, notifyFileConversion } = useNotifications();
 * 
 * 3. Call notification functions at appropriate points in your code:
 * 
 *    // Success notification
 *    notifySuccess('Conversion completed', 'Your file has been successfully converted');
 * 
 *    // File conversion tracking
 *    const conversionProcess = useFileConversionNotifications().notifyConversionProcess(
 *      'document.pdf', 'pdf', 'docx'
 *    );
 * 
 *    // Update progress
 *    conversionProcess.updateProgress(50);
 * 
 *    // Complete notification
 *    conversionProcess.completeNotification('https://example.com/download/file.docx');
 * 
 * 4. For batch operations, use the BatchOperationNotification component:
 *    <BatchOperationNotification
 *      title="Converting batch"
 *      totalItems={10}
 *      completedItems={5}
 *      failedItems={1}
 *      onViewDetails={() => setActiveTab('batch')}
 *      onDismiss={() => {}}
 *    />
 * 
 * 5. For premium features, use the PremiumFeatureNotification component:
 *    <PremiumFeatureNotification
 *      featureName="Advanced Analytics"
 *      description="Get detailed insights into your conversion patterns."
 *      onUpgrade={() => handleUpgrade()}
 *      onDismiss={() => {}}
 *    />
 */
