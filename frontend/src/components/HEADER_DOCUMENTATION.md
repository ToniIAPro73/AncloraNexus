# Componente Header para Anclora Nexus

Este componente implementa la barra de navegaciÃ³n principal para la aplicaciÃ³n Anclora Nexus, integrÃ¡ndose con el sistema de notificaciones y proporcionando acceso a las funciones principales de la aplicaciÃ³n.

## CaracterÃ­sticas

- **DiseÃ±o Responsivo**: Se adapta a pantallas mÃ³viles y de escritorio
- **MenÃº de Usuario**: Desplegable con opciones de perfil, configuraciÃ³n y cierre de sesiÃ³n
- **Centro de Notificaciones**: Muestra alertas y actualizaciones de la aplicaciÃ³n
- **Indicador de Plan**: Muestra visualmente el plan actual del usuario (Free, Premium, Business)
- **NavegaciÃ³n Principal**: Acceso rÃ¡pido a las secciones principales de la aplicaciÃ³n
- **IntegraciÃ³n con Notificaciones**: Utiliza el sistema de notificaciones para alertas de sesiÃ³n

## Props

| Nombre | Tipo | DescripciÃ³n | Valor por defecto |
|--------|------|-------------|-------------------|
| `onMenuToggle` | `() => void` | FunciÃ³n para controlar la visibilidad del menÃº lateral en dispositivos mÃ³viles | `undefined` |
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
      {/* Resto de la aplicaciÃ³n */}
    </div>
  );
}
```

## IntegraciÃ³n con Sistema de Notificaciones

El componente Header utiliza el hook `useNotifications` para mostrar alertas sobre acciones del usuario:

```tsx
import { useNotifications } from './NotificationSystem';

export function Header({ onMenuToggle, userPlan = 'free' }) {
  const { notifySuccess } = useNotifications();

  const handleLogout = async () => {
    await logout();
    notifySuccess('SesiÃ³n cerrada', 'Has cerrado sesiÃ³n correctamente');
    navigate('/login');
  };
  
  // Resto del componente...
}
```

## Estructura del MenÃº de Usuario

El menÃº de usuario muestra las siguientes opciones:

1. **Mi Perfil**: Acceso a la informaciÃ³n personal del usuario
2. **ConfiguraciÃ³n**: Opciones y preferencias de la aplicaciÃ³n
3. **Mis Documentos**: Historial de archivos procesados
4. **Dashboard**: Panel principal de control
5. **Ayuda**: DocumentaciÃ³n y soporte
6. **Cerrar SesiÃ³n**: Finalizar la sesiÃ³n actual

## Estilos

El componente utiliza TailwindCSS para los estilos y se adapta al tema de la aplicaciÃ³n. Los principales elementos son:

- **Header**: `bg-background border-b border-border/40`
- **Logo Container**: `flex items-center gap-2`
- **Navigation Links**: `text-sm font-medium hover:text-primary transition-colors`
- **Premium Badge**: `bg-amber-600 hover:bg-amber-700`
- **Business Badge**: `bg-purple-600 hover:bg-purple-700`
- **Dropdowns**: `rounded-md border border-border bg-background shadow-lg z-50`

## PersonalizaciÃ³n

El componente puede personalizarse a travÃ©s de:

1. **Tema**: Los colores se adaptan automÃ¡ticamente al tema de la aplicaciÃ³n
2. **Plan del usuario**: El indicador de plan cambia visualmente segÃºn el tipo de cuenta
3. **MenÃºs**: La estructura de menÃºs puede extenderse segÃºn las necesidades de la aplicaciÃ³n

## Dependencias

- **React Router**: Para la navegaciÃ³n entre pÃ¡ginas
- **Lucide React**: Para los iconos
- **NotificationSystem**: Para mostrar notificaciones de acciones
- **useAuth**: Hook para gestionar la autenticaciÃ³n

## Ejemplo de IntegraciÃ³n con Notificaciones

```tsx
// Dentro del componente Header

const { notifyInfo, notifySuccess, notifyError } = useNotifications();

// Ejemplo de notificaciÃ³n informativa
const showPlanInfo = () => {
  notifyInfo(
    'Plan Actual', 
    `EstÃ¡s utilizando el plan ${userPlan.toUpperCase()}`, 
    { duration: 3000 }
  );
};

// Ejemplo de notificaciÃ³n al cambiar de plan
const upgradeToPremium = () => {
  // LÃ³gica para actualizar plan...
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

