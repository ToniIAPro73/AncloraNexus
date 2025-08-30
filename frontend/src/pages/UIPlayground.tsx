import React, { useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmModal,
  Dropdown,
  FileUpload,
  Progress,
  StepProgress,
  Tabs,
  TabsComposition,
  ToastProvider,
  Tooltip,
  Select,
  useToast,
} from '../components/ui';

export const UIPlayground: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('one');
  const [progress, setProgress] = useState(35);
  const [step, setStep] = useState(2);
  const [selectValue, setSelectValue] = useState<string | number | null>(null);
  const { showToast } = useToast();

  return (
    <div className="min-h-screen p-6 space-y-6 bg-slate-900 text-slate-200">
      <h1 className="text-2xl font-bold">UI Playground</h1>

      <Card>
        <CardHeader>
          <CardTitle>Buttons & Badges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => showToast({ title: 'Acción', message: 'Primario', type: 'success' })}>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button isLoading>Loading</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tabs</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            items={[
              { id: 'one', label: 'Tab 1', content: <div>Contenido 1</div> },
              { id: 'two', label: 'Tab 2', content: <div>Contenido 2</div> },
              { id: 'three', label: 'Tab 3', content: <div>Contenido 3</div> },
            ]}
            defaultTab="one"
            onChange={setActiveTab}
          />

          <div className="mt-4">
            <TabsComposition value={activeTab} onChange={setActiveTab}>
              <TabsComposition.Tab value="one" label="Uno">
                <div>Composición 1</div>
              </TabsComposition.Tab>
              <TabsComposition.Tab value="two" label="Dos">
                <div>Composición 2</div>
              </TabsComposition.Tab>
              <TabsComposition.Tab value="three" label="Tres">
                <div>Composición 3</div>
              </TabsComposition.Tab>
            </TabsComposition>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Progress value={progress} className="w-64" />
            <Button onClick={() => setProgress((p) => (p + 15 > 100 ? 0 : p + 15))}>+15%</Button>
          </div>
          <StepProgress steps={4} currentStep={step} labels={[ 'Inicio', 'Pre', 'Proc', 'Fin' ]} />
          <div className="flex gap-2">
            <Button onClick={() => setStep((s) => Math.max(0, s - 1))}>- Paso</Button>
            <Button onClick={() => setStep((s) => Math.min(4, s + 1))}>+ Paso</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overlays: Modal, Dropdown, Tooltip</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setModalOpen(true)}>Abrir Modal</Button>
            <Dropdown
              trigger={<Button variant="outline">Dropdown</Button>}
              items={[
                { id: 'a', label: 'Acción A' },
                { id: 'b', label: 'Acción B' },
                { id: 'c', label: 'Deshabilitado', disabled: true },
              ]}
              withDividers
            />
            <Tooltip content="Soy un tooltip" position="top">
              <Button variant="ghost">Hover</Button>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inputs: Select y FileUpload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            items={[
              { id: 'pdf', label: 'PDF' },
              { id: 'docx', label: 'DOCX' },
              { id: 'jpg', label: 'JPG' },
            ]}
            value={selectValue}
            onChange={setSelectValue}
            label="Formato"
            placeholder="Seleccione…"
          />
          <FileUpload multiple onFilesSelected={(files) => showToast({ title: `Subidos ${files.length} archivo(s)`, type: 'info' })}>
            <div className="px-4 py-10 rounded-md border border-dashed border-slate-600 text-center hover:bg-slate-800/30 cursor-pointer">
              Clic para seleccionar archivos
            </div>
          </FileUpload>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avatar y Toasts</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Avatar>U</Avatar>
          <Button onClick={() => showToast({ title: 'Hola', message: 'Toast de ejemplo', type: 'success' })}>Toast</Button>
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          setModalOpen(false);
          showToast({ title: 'Confirmado', type: 'success' });
        }}
        title="Confirmar acción"
        message="¿Deseas confirmar esta acción?"
        confirmText="Sí"
        cancelText="No"
      />
    </div>
  );
};

// Opción de montaje aislado con provider si se quiere usar standalone
export const UIPlaygroundWithProvider: React.FC = () => (
  <ToastProvider>
    <UIPlayground />
  </ToastProvider>
);

export default UIPlayground;

