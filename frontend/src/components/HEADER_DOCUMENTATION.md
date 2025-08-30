# Componente Header para Anclora Nexus

Este componente implementa la barra de navegación principal para la aplicación Anclora Nexus, integrándose con el sistema de notificaciones y proporcionando acceso a las funciones principales de la aplicación.

## Características

- **Diseño Responsivo**: Se adapta a pantallas móviles y de escritorio
- **Menú de Usuario**: Desplegable con opciones de perfil, configuración y cierre de sesión
- **Centro de Notificaciones**: Muestra alertas y actualizaciones de la aplicación
- **Indicador de Plan**: Muestra visualmente el plan actual del usuario (Free, Premium, Business)
- **Navegación Principal**: Acceso rápido a las secciones principales de la aplicación
- **Integración con Notificaciones**: Utiliza el sistema de notificaciones para alertas de sesión

## Props

| Nombre | Tipo | Descripción | Valor por defecto |
|--------|------|-------------|-------------------|
| `onMenuToggle` | `() => void` | Función para controlar la visibilidad del menú lateral en dispositivos móviles | `undefined` |
| `userPlan` | `'free' \| 'premium' \| 'business'` | Plan actual del usuario | `'free'` |

## Uso

```tsx
import { Header } from './components/Header';
import { useAuth } from './hooks/useAuth';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div>
      <Header 
        onMenuToggle={toggleSidebar} 
        userPlan={user?.plan || 'free'}
      />
      {/* Resto de la aplicación */}
    </div>
  );
}
```

## Integración con Sistema de Notificaciones

El componente Header utiliza el hook `useNotifications` para mostrar alertas sobre acciones del usuario:

```tsx
import { useNotifications } from './NotificationSystem';

export function Header({ onMenuToggle, userPlan = 'free' }) {
  const { notifySuccess } = useNotifications();

  const handleLogout = async () => {
    await logout();
    notifySuccess('Sesión cerrada', 'Has cerrado sesión correctamente');
    navigate('/login');
  };
  
  // Resto del componente...
}
```

## Estructura del Menú de Usuario

El menú de usuario muestra las siguientes opciones:

1. **Mi Perfil**: Acceso a la información personal del usuario
2. **Configuración**: Opciones y preferencias de la aplicación
3. **Mis Documentos**: Historial de archivos procesados
4. **Dashboard**: Panel principal de control
5. **Ayuda**: Documentación y soporte
6. **Cerrar Sesión**: Finalizar la sesión actual

## Estilos

El componente utiliza TailwindCSS para los estilos y se adapta al tema de la aplicación. Los principales elementos son:

- **Header**: `bg-background border-b border-border/40`
- **Logo Container**: `flex items-center gap-2`
- **Navigation Links**: `text-sm font-medium hover:text-primary transition-colors`
- **Premium Badge**: `bg-amber-600 hover:bg-amber-700`
- **Business Badge**: `bg-purple-600 hover:bg-purple-700`
- **Dropdowns**: `rounded-md border border-border bg-background shadow-lg z-50`

## Personalización

El componente puede personalizarse a través de:

1. **Tema**: Los colores se adaptan automáticamente al tema de la aplicación
2. **Plan del usuario**: El indicador de plan cambia visualmente según el tipo de cuenta
3. **Menús**: La estructura de menús puede extenderse según las necesidades de la aplicación

## Dependencias

- **React Router**: Para la navegación entre páginas
- **Lucide React**: Para los iconos
- **NotificationSystem**: Para mostrar notificaciones de acciones
- **useAuth**: Hook para gestionar la autenticación

## Ejemplo de Integración con Notificaciones

```tsx
// Dentro del componente Header

const { notifyInfo, notifySuccess, notifyError } = useNotifications();

// Ejemplo de notificación informativa
const showPlanInfo = () => {
  notifyInfo(
    'Plan Actual', 
    `Estás utilizando el plan ${userPlan.toUpperCase()}`, 
    { duration: 3000 }
  );
};

// Ejemplo de notificación al cambiar de plan
const upgradeToPremium = () => {
  // Lógica para actualizar plan...
  notifySuccess(
    'Plan actualizado',
    'Te has actualizado al plan Premium correctamente',
    {
      actions: [{
        label: 'Ver detalles',
        onClick: () => navigate('/account/plan')
      }]
    }
  );
};
```
