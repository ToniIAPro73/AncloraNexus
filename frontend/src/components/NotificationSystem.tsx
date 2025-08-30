import React, { useState, useCallback } from 'react';
import { 
  X, CheckCircle, AlertTriangle, 
  Loader2, Download, FilePlus, Zap, ExternalLink
} from 'lucide-react';
import { useToast } from './ui';

interface NotificationAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  primary?: boolean;
}

interface NotificationOptions {
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'info' | 'warning' | 'progress';
  duration?: number;
  progress?: number;
  actions?: NotificationAction[];
  data?: {
    fileId?: string;
    fileName?: string;
    fileSize?: number;
    downloadUrl?: string;
    errorCode?: string;
    detailsUrl?: string;
    [key: string]: any;
  };
  autoClose?: boolean;
  groupId?: string; // For grouping related notifications
}

export const useNotifications = () => {
  const toast = useToast();
  const [activeNotifications, setActiveNotifications] = useState<
    Record<string, NotificationOptions & { id: string }>
  >({});

  // Show a notification
  const notify = useCallback((options: NotificationOptions) => {
    const notificationId = Math.random().toString(36).substr(2, 9);
    
    // Format actions for toast
    const formattedActions = options.actions?.length 
      ? { 
          label: options.actions[0].label, 
          onClick: options.actions[0].onClick
        } 
      : undefined;

    // Show toast
    toast.showToast({
      title: options.title,
      message: options.message,
      type: options.type === 'progress' ? 'info' : options.type,
      duration: options.autoClose === false ? 0 : options.duration || 5000,
      action: formattedActions
    });
    
    // Add to active notifications
    setActiveNotifications(prev => ({
      ...prev,
      [notificationId]: {
        ...options,
        id: notificationId
      }
    }));
    
    return notificationId;
  }, [toast]);
  
  // Update an existing notification
  const updateNotification = useCallback((id: string, options: Partial<NotificationOptions>) => {
    setActiveNotifications(prev => {
      const notification = prev[id];
      if (!notification) return prev;
      
      // Hide old toast and show new one with updated options
      toast.hideToast(id);
      toast.showToast({
        title: options.title || notification.title,
        message: options.message || notification.message,
        type: options.type === 'progress' || notification.type === 'progress' ? 'info' : (options.type || notification.type),
        duration: options.autoClose === false ? 0 : options.duration || notification.duration || 5000,
        action: notification.actions?.length 
          ? { 
              label: notification.actions[0].label, 
              onClick: notification.actions[0].onClick
            } 
          : undefined
      });
      
      return {
        ...prev,
        [id]: {
          ...notification,
          ...options,
        }
      };
    });
  }, [toast]);
  
  // Close a notification
  const closeNotification = useCallback((id: string) => {
    setActiveNotifications(prev => {
      const newState = { ...prev };
      delete newState[id];
      toast.hideToast(id);
      return newState;
    });
  }, [toast]);
  
  // Helper functions for common notifications
  const notifySuccess = useCallback((title: string, message?: string, options?: Partial<NotificationOptions>) => {
    return notify({
      title,
      message,
      type: 'success',
      ...options
    });
  }, [notify]);
  
  const notifyError = useCallback((title: string, message?: string, options?: Partial<NotificationOptions>) => {
    return notify({
      title,
      message,
      type: 'error',
      ...options
    });
  }, [notify]);
  
  const notifyInfo = useCallback((title: string, message?: string, options?: Partial<NotificationOptions>) => {
    return notify({
      title,
      message,
      type: 'info',
      ...options
    });
  }, [notify]);
  
  const notifyWarning = useCallback((title: string, message?: string, options?: Partial<NotificationOptions>) => {
    return notify({
      title,
      message,
      type: 'warning',
      ...options
    });
  }, [notify]);
  
  const notifyProgress = useCallback((title: string, progress: number, options?: Partial<NotificationOptions>) => {
    return notify({
      title,
      type: 'info', // Use info type for progress as Toast doesn't have progress type
      progress,
      autoClose: false,
      ...options
    });
  }, [notify]);
  
  const notifyFileConversion = useCallback((options: {
    status: 'started' | 'progress' | 'completed' | 'error';
    fileName: string;
    fileType?: string;
    targetType?: string;
    progress?: number;
    downloadUrl?: string;
    errorMessage?: string;
  }) => {
    const { status, fileName, fileType, targetType, progress = 0, downloadUrl, errorMessage } = options;
    
    // File icons can be used later if we enhance the UI
    
    switch (status) {
      case 'started':
        return notify({
          title: `Iniciando conversión`,
          message: `Preparando ${fileName} para convertir${targetType ? ` a ${targetType.toUpperCase()}` : ''}`,
          type: 'info',
          data: {
            fileName,
            fileType,
            targetType
          },
          autoClose: true,
          duration: 3000
        });
        
      case 'progress':
        return notify({
          title: `Convirtiendo ${fileType?.toUpperCase() || ''} a ${targetType?.toUpperCase() || ''}`,
          message: `${fileName} - ${progress}% completado`,
          type: 'progress',
          progress,
          data: {
            fileName,
            fileType,
            targetType,
            progress
          },
          autoClose: false
        });
        
      case 'completed':
        return notify({
          title: `Conversión completada`,
          message: `${fileName} ha sido convertido exitosamente${targetType ? ` a ${targetType.toUpperCase()}` : ''}`,
          type: 'success',
          data: {
            fileName,
            fileType,
            targetType,
            downloadUrl
          },
          actions: [
            {
              label: 'Descargar',
              onClick: () => {
                if (downloadUrl) {
                  window.open(downloadUrl, '_blank');
                }
              },
              icon: <Download size={14} />,
              primary: true
            }
          ],
          autoClose: true,
          duration: 8000
        });
        
      case 'error':
        return notify({
          title: `Error en la conversión`,
          message: errorMessage || `Ocurrió un error al convertir ${fileName}`,
          type: 'error',
          data: {
            fileName,
            fileType,
            targetType,
            errorMessage
          },
          actions: [
            {
              label: 'Reintentar',
              onClick: () => {
                // This would be implemented by the consumer
                console.log('Retry conversion of', fileName);
              },
              icon: <FilePlus size={14} />,
              primary: true
            }
          ],
          autoClose: true,
          duration: 10000
        });
    }
  }, [notify]);
  
  // Helper function to get icon based on file extension - commented out for now but can be implemented later
  // const getFileIcon = (fileNameOrType: string) => {
  //   // This could be expanded with more file icons based on file type
  //   return <FilePlus size={16} />;
  // };
  
  // Group notifications by type or ID
  const getNotificationGroups = useCallback(() => {
    const groups: Record<string, Array<typeof activeNotifications[string]>> = {};
    
    Object.values(activeNotifications).forEach(notification => {
      const groupId = notification.groupId || 'default';
      if (!groups[groupId]) {
        groups[groupId] = [];
      }
      groups[groupId].push(notification);
    });
    
    return groups;
  }, [activeNotifications]);

  return {
    notify,
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
    notifyProgress,
    notifyFileConversion,
    updateNotification,
    closeNotification,
    activeNotifications,
    getNotificationGroups
  };
};

// Example component for batch operations notification
export const BatchOperationNotification: React.FC<{
  title: string;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  onViewDetails?: () => void;
  onDismiss?: () => void;
}> = ({ 
  title, 
  totalItems, 
  completedItems, 
  failedItems,
  onViewDetails,
  onDismiss
}) => {
  const progress = Math.floor((completedItems / totalItems) * 100);
  const isCompleted = completedItems + failedItems === totalItems;
  
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          {isCompleted ? (
            failedItems > 0 ? (
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            )
          ) : (
            <Loader2 className="h-5 w-5 text-blue-500 mr-2 animate-spin" />
          )}
          <div>
            <p className="text-sm font-medium text-white">{title}</p>
            <div className="flex items-center text-xs text-slate-400 mt-1">
              <span>{completedItems} de {totalItems} completados</span>
              {failedItems > 0 && (
                <span className="ml-2 text-red-400">({failedItems} fallidos)</span>
              )}
            </div>
          </div>
        </div>
        
        <button 
          className="text-slate-400 hover:text-white"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="mt-2 h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${
            isCompleted 
              ? failedItems > 0 
                ? 'bg-amber-500' 
                : 'bg-green-500' 
              : 'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {isCompleted && (
        <div className="mt-2 flex justify-end">
          {onViewDetails && (
            <button 
              className="text-xs flex items-center text-primary hover:text-secondary transition-colors"
              onClick={onViewDetails}
            >
              Ver detalles
              <ExternalLink className="h-3 w-3 ml-1" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Example component for premium feature notification
export const PremiumFeatureNotification: React.FC<{
  featureName: string;
  description: string;
  onUpgrade?: () => void;
  onDismiss?: () => void;
}> = ({
  featureName,
  description,
  onUpgrade,
  onDismiss
}) => {
  return (
    <div className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 border border-amber-700/30 rounded-lg p-3 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <Zap className="h-5 w-5 text-amber-500 mr-2" />
          <div>
            <p className="text-sm font-medium text-white">{featureName}</p>
            <p className="text-xs text-slate-300 mt-1">{description}</p>
          </div>
        </div>
        
        <button 
          className="text-slate-400 hover:text-white"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {onUpgrade && (
        <div className="mt-3">
          <button 
            className="w-full bg-gradient-to-r from-amber-600/80 to-amber-700/80 hover:from-amber-500/80 hover:to-amber-600/80 text-white rounded py-1.5 text-xs font-medium transition-colors"
            onClick={onUpgrade}
          >
            Actualizar a Premium
          </button>
        </div>
      )}
    </div>
  );
};

// Example usage:
// 
// function MyComponent() {
//   const { 
//     notifySuccess, 
//     notifyFileConversion, 
//     updateNotification 
//   } = useNotifications();
//
//   const handleFileUpload = () => {
//     const notifId = notifyFileConversion({
//       status: 'started',
//       fileName: 'document.pdf',
//       fileType: 'pdf',
//       targetType: 'docx'
//     });
//
//     // Later update with progress
//     setTimeout(() => {
//       updateNotification(notifId, {
//         status: 'progress',
//         progress: 50
//       });
//     }, 1000);
//
//     // Later complete
//     setTimeout(() => {
//       notifyFileConversion({
//         status: 'completed',
//         fileName: 'document.pdf',
//         fileType: 'pdf',
//         targetType: 'docx',
//         downloadUrl: '#'
//       });
//     }, 3000);
//   };
//
//   return (
//     <button onClick={handleFileUpload}>
//       Upload File
//     </button>
//   );
// }
