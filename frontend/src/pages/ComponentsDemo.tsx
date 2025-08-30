import { useState } from 'react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  Tabs, 
  Modal, 
  Dropdown, 
  Tooltip, 
  ToastProvider, 
  useToast,
  Accordion,
  Badge,
  Select
} from '../components/ui';
// Update the path below to the correct location and filename for ConfirmModal
// For example, if the file is named confirm-modal.tsx, use the correct casing and path:
// import { ConfirmModal } from '../components/ui/confirm-modal';
// Update the path below to the correct location of ConfirmModal:
import { ConfirmModal } from '../components/ui/ConfirmModal';
// If the file is in a different folder or has a different name, adjust accordingly.
import { 
  Settings, 
  Bell, 
  User, 
  Info, 
  ChevronDown, 
  Trash, 
  Edit, 
  Plus, 
  AlertCircle,
  Layers,
  FileText,
  Image,
  Download
} from 'lucide-react';
// Update the import path below to the correct location of MainLayout if needed
import { MainLayout } from '../layouts/MainLayout';
// If your MainLayout is in a different file, adjust the path accordingly, e.g.:
// import { MainLayout } from '../components/layouts/MainLayout';

// Demo component to showcase all the interactive UI components
const ComponentsDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('buttons');
  const { showToast } = useToast();
  
  const tabItems = [
    {
      id: 'buttons',
      label: 'Botones',
      icon: <Settings size={16} />,
      content: (
        <ButtonsSection 
          onShowToast={() => {
            showToast({
              title: 'Operación completada',
              message: 'Acción realizada correctamente',
              type: 'success'
            });
          }}
          onOpenModal={() => setIsModalOpen(true)}
        />
      )
    },
    {
      id: 'dialogs',
      label: 'Diálogos',
      badge: <Badge variant="primary" size="sm">Nuevo</Badge>,
      content: (
        <DialogsSection 
          onOpenConfirmModal={() => setIsConfirmModalOpen(true)}
        />
      )
    },
    {
      id: 'components',
      label: 'Componentes',
      content: <ComponentsSection />
    },
    {
      id: 'tooltip',
      label: 'Tooltips',
      content: <TooltipsSection />
    }
  ];
  
  const dropdownItems = [
    { id: 'profile', label: 'Mi Perfil', icon: <User size={16} /> },
    { id: 'settings', label: 'Configuración', icon: <Settings size={16} /> },
    { id: 'notifications', label: 'Notificaciones', icon: <Bell size={16} /> },
    { id: 'logout', label: 'Cerrar Sesión', icon: <Trash size={16} />, disabled: false }
  ];
  
  const selectOptions = [
    { id: 'pdf', label: 'PDF', icon: <FileText size={16} className="text-blue-500" /> },
    { id: 'doc', label: 'DOC', icon: <FileText size={16} className="text-indigo-500" /> },
    { id: 'jpg', label: 'JPG', icon: <Image size={16} className="text-green-500" /> },
    { id: 'png', label: 'PNG', icon: <Image size={16} className="text-purple-500" /> },
    { id: 'svg', label: 'SVG', icon: <Layers size={16} className="text-orange-500" /> }
  ];
  
  const [selectedFormat, setSelectedFormat] = useState<string | number | null>(null);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 animate-in fade-in slide-in-from-top duration-700">
          <h1 className="text-3xl font-bold text-white mb-2">Componentes Interactivos</h1>
          <p className="text-slate-300">
            Biblioteca completa de componentes UI interactivos para Anclora Nexus
          </p>
        </div>
        
        <Card variant="default" className="mb-8 animate-in fade-in slide-in-from-bottom duration-700">
          <CardHeader>
            <CardTitle>Guía de Componentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs 
              items={tabItems} 
              onChange={setActiveTab} 
              defaultTab={activeTab}
              variant="pills"
            />
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="dark" className="animate-in fade-in slide-in-from-bottom duration-700 delay-150">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Dropdown
                  trigger={
                    <button className="flex items-center text-slate-300 hover:text-white">
                      Opciones <ChevronDown size={16} className="ml-1" />
                    </button>
                  }
                  items={dropdownItems}
                  align="left"
                  withDividers
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Selección de formato</h3>
                <Select
                  items={selectOptions}
                  value={selectedFormat}
                  onChange={setSelectedFormat}
                  label="Formato de salida"
                  placeholder="Selecciona un formato"
                  fullWidth
                />
                
                {selectedFormat && (
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 mt-4">
                    <p className="text-sm text-slate-300">
                      Has seleccionado: <span className="font-medium text-white">
                        {selectOptions.find(o => o.id === selectedFormat)?.label}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card variant="dark" className="animate-in fade-in slide-in-from-bottom duration-700 delay-300">
            <CardHeader>
              <CardTitle>Acordeones Expandibles</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion
                items={[
                  {
                    id: 'section1',
                    title: 'Información General',
                    icon: <Info size={18} />,
                    content: (
                      <div className="text-sm text-slate-300">
                        <p>Esta sección contiene información general sobre la plataforma.</p>
                      </div>
                    )
                  },
                  {
                    id: 'section2',
                    title: 'Configuración Avanzada',
                    icon: <Settings size={18} />,
                    content: (
                      <div className="text-sm text-slate-300">
                        <p>Ajustes avanzados para usuarios experimentados.</p>
                        <div className="mt-2">
                          <Button size="sm" variant="outline">Cambiar configuración</Button>
                        </div>
                      </div>
                    )
                  },
                  {
                    id: 'section3',
                    title: 'Ayuda y Soporte',
                    icon: <AlertCircle size={18} />,
                    content: (
                      <div className="text-sm text-slate-300">
                        <p>Si necesitas ayuda, puedes contactar con nuestro equipo de soporte.</p>
                      </div>
                    )
                  }
                ]}
                defaultOpen={['section1']}
                allowMultiple
              />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Modal demo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Configuración de Conversión"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary"
              onClick={() => {
                setIsModalOpen(false);
                showToast({
                  title: 'Configuración guardada',
                  message: 'Los cambios han sido aplicados correctamente',
                  type: 'success'
                });
              }}
            >
              Guardar Cambios
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Calidad de salida
            </label>
            <select className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white">
              <option value="high">Alta (recomendado)</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Compresión
            </label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              defaultValue="75" 
              className="w-full"
            />
          </div>
        </div>
      </Modal>
      
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => {
          setIsConfirmModalOpen(false);
          showToast({
            title: 'Acción confirmada',
            message: 'La operación se ha completado correctamente',
            type: 'success'
          });
        }}
        title="Confirmar acción"
        message="¿Estás seguro de que deseas realizar esta acción? Esta operación no se puede deshacer."
        confirmText="Sí, continuar"
        cancelText="Cancelar"
        confirmVariant="primary"
      />
    </MainLayout>
  );
};

// Secciones para los tabs
const ButtonsSection = ({ onShowToast, onOpenModal }: { 
  onShowToast: () => void;
  onOpenModal: () => void;
}) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-white mb-3">Variantes de botones</h3>
      <div className="flex flex-wrap gap-3">
        <Button variant="primary">Primario</Button>
        <Button variant="secondary">Secundario</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Peligro</Button>
      </div>
    </div>
    
    <div>
      <h3 className="text-lg font-medium text-white mb-3">Botones con iconos</h3>
      <div className="flex flex-wrap gap-3">
        <Button iconLeft={<Plus size={16} />}>Nuevo</Button>
        <Button iconRight={<ChevronDown size={16} />}>Más opciones</Button>
        <Button variant="outline" iconLeft={<Download size={16} />}>Descargar</Button>
        <Button variant="ghost" iconLeft={<Edit size={16} />}>Editar</Button>
      </div>
    </div>
    
    <div>
      <h3 className="text-lg font-medium text-white mb-3">Estados</h3>
      <div className="flex flex-wrap gap-3">
        <Button isLoading>Cargando</Button>
        <Button disabled>Deshabilitado</Button>
        <Button onClick={onShowToast}>Mostrar Toast</Button>
        <Button variant="secondary" onClick={onOpenModal}>Abrir Modal</Button>
      </div>
    </div>
  </div>
);

const DialogsSection = ({ onOpenConfirmModal }: { onOpenConfirmModal: () => void }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-white mb-3">Tipos de diálogos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="dark">
          <CardHeader>
            <CardTitle>Modal de confirmación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300 mb-3">
              Útil para confirmar acciones importantes o irreversibles
            </p>
            <Button onClick={onOpenConfirmModal}>Mostrar confirmación</Button>
          </CardContent>
        </Card>
        
        <Card variant="dark">
          <CardHeader>
            <CardTitle>Notificaciones Toast</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300 mb-3">
              Notificaciones temporales no intrusivas
            </p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const { showToast } = useToast();
                  showToast({
                    title: 'Información',
                    message: 'Esta es una notificación informativa',
                    type: 'info'
                  });
                }}
              >
                Info
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const { showToast } = useToast();
                  showToast({
                    title: 'Éxito',
                    message: 'Operación completada correctamente',
                    type: 'success'
                  });
                }}
              >
                Éxito
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const { showToast } = useToast();
                  showToast({
                    title: 'Advertencia',
                    message: 'Debes revisar esta información',
                    type: 'warning'
                  });
                }}
              >
                Advertencia
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const { showToast } = useToast();
                  showToast({
                    title: 'Error',
                    message: 'Ha ocurrido un problema al procesar la solicitud',
                    type: 'error',
                    action: {
                      label: 'Reintentar',
                      onClick: () => console.log('Retry action')
                    }
                  });
                }}
              >
                Error
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

const ComponentsSection = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-white mb-3">Badges</h3>
      <div className="flex flex-wrap gap-2">
        <Badge variant="primary">Nuevo</Badge>
        <Badge variant="secondary">Beta</Badge>
        <Badge variant="success">Completado</Badge>
        <Badge variant="warning">Pendiente</Badge>
        <Badge variant="danger">Error</Badge>
        <Badge variant="info">Info</Badge>
        <Badge variant="default">Default</Badge>
      </div>
    </div>
    
    <div>
      <h3 className="text-lg font-medium text-white mb-3">Dropdowns</h3>
      <div className="flex gap-4">
        <Dropdown
          trigger={
            <Button iconRight={<ChevronDown size={16} />} variant="outline">
              Menú
            </Button>
          }
          items={[
            { id: '1', label: 'Opción 1', icon: <Settings size={16} /> },
            { id: '2', label: 'Opción 2', icon: <User size={16} /> },
            { id: '3', label: 'Opción 3', disabled: true, icon: <Bell size={16} /> },
            { id: '4', label: 'Eliminar', icon: <Trash size={16} className="text-red-500" /> }
          ]}
          align="left"
          withDividers
        />
        
        <Dropdown
          trigger={
            <Button iconRight={<ChevronDown size={16} />} variant="primary">
              Acciones
            </Button>
          }
          items={[
            { id: '1', label: 'Editar', icon: <Edit size={16} /> },
            { id: '2', label: 'Eliminar', icon: <Trash size={16} /> }
          ]}
          align="right"
        />
      </div>
    </div>
    
    <div>
      <h3 className="text-lg font-medium text-white mb-3">Tabs</h3>
      <Tabs
        items={[
          {
            id: 'tab1',
            label: 'General',
            content: <div className="p-4 bg-slate-800/50 rounded-lg">Contenido del tab 1</div>
          },
          {
            id: 'tab2',
            label: 'Avanzado',
            content: <div className="p-4 bg-slate-800/50 rounded-lg">Contenido del tab 2</div>
          },
          {
            id: 'tab3',
            label: 'Configuración',
            disabled: true,
            content: <div className="p-4">Contenido del tab 3</div>
          }
        ]}
        variant="pills"
      />
    </div>
  </div>
);

const TooltipsSection = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-white mb-3">Tooltips</h3>
      <div className="flex flex-wrap gap-5 justify-center py-10">
        <Tooltip content="Tooltip superior" position="top">
          <Button variant="outline">Superior</Button>
        </Tooltip>
        
        <Tooltip content="Tooltip inferior" position="bottom">
          <Button variant="outline">Inferior</Button>
        </Tooltip>
        
        <Tooltip content="Tooltip izquierda" position="left">
          <Button variant="outline">Izquierda</Button>
        </Tooltip>
        
        <Tooltip content="Tooltip derecha" position="right">
          <Button variant="outline">Derecha</Button>
        </Tooltip>
        
        <Tooltip 
          content={
            <div className="p-1">
              <p className="font-medium text-white">Título del tooltip</p>
              <p className="text-xs text-slate-300 mt-1">Descripción adicional con más detalles</p>
            </div>
          } 
          position="top"
          maxWidth="20rem"
        >
          <Button variant="primary">Tooltip Rich</Button>
        </Tooltip>
      </div>
    </div>
  </div>
);

// Wrapper component with ToastProvider
const ComponentsDemoWithToast = () => {
  return (
    <ToastProvider>
      <ComponentsDemo />
    </ToastProvider>
  );
};

export default ComponentsDemoWithToast;
