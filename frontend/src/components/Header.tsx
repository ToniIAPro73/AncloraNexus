import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Menu, 
  BellIcon, 
  ChevronDown, 
  Settings, 
  LogOut, 
  User, 
  FileText, 
  LayoutDashboard,
  HelpCircle,
  Crown
} from 'lucide-react';

import { Button } from './ui';
// Update the import path below to the correct location of Avatar
// import { Avatar } from './Avatar';
// import { Avatar } from './ui-components'; // Update this path if Avatar is exported from ui-components
// import { Avatar } from './Avatar'; // Update this path to the actual location of Avatar
import { Avatar } from './ui';
import { Badge } from './ui';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from './NotificationSystem';
import ancloraNexusLogo from '/images/logos/Anclora Nexus fondo transparente.jpeg';

interface HeaderProps {
  onMenuToggle?: () => void;
  userPlan?: 'free' | 'premium' | 'business';
}

export function Header({ onMenuToggle, userPlan = 'free' }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { notifySuccess } = useNotifications();

  // Simulación de notificaciones no leídas
  useEffect(() => {
    // En un caso real, esto vendría de un servicio de backend
    setUnreadNotifications(Math.floor(Math.random() * 5));
  }, []);

  const handleLogout = async () => {
    await logout();
    notifySuccess('Sesión cerrada', 'Has cerrado sesión correctamente');
    navigate('/login');
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    navigate('/profile');
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showUserMenu) setShowUserMenu(false);
  };

  return (
    <header className="bg-background border-b border-border/40 py-2 px-4 md:px-6">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button */}
        <Button
          className="md:hidden"
          onClick={onMenuToggle}
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={ancloraNexusLogo}
            alt="Anclora Nexus"
            className="h-10 w-auto bg-transparent"
            style={{
              mixBlendMode: 'multiply'
            }}
          />
          <span className="text-xl font-semibold hidden md:block text-primary">
            Anclora Nexus
          </span>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/dashboard" 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Link 
            to="/conversions" 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Conversiones
          </Link>
          <Link 
            to="/analytics" 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Analíticas
          </Link>
          <Link 
            to="/docs" 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Documentación
          </Link>
          <Link
            to="/ui"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            UI Playground
          </Link>
          <Link
            to="/ai-demo"
            className="text-sm font-medium hover:text-primary transition-colors flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-full"
          >
            <span>🤖</span>
            <span>Motor IA</span>
          </Link>
            UI Playground
          </Link>
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* User Plan Badge */}
          <div className="hidden md:block">
            {userPlan === 'premium' && (
              <Badge className="bg-amber-600 hover:bg-amber-700 text-xs px-2 py-1 rounded">
                <Crown className="h-3 w-3 mr-1" /> Premium
              </Badge>
            )}
            {userPlan === 'business' && (
              <Badge className="bg-purple-600 hover:bg-purple-700 text-xs px-2 py-1 rounded">
                <Crown className="h-3 w-3 mr-1" /> Business
              </Badge>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button
              onClick={toggleNotifications}
              aria-label="Notifications"
              className="relative"
            >
              <BellIcon className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white">
                  {unreadNotifications}
                </span>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-md border border-border bg-background shadow-lg z-50">
                <div className="p-3 border-b border-border">
                  <h3 className="font-medium">Notificaciones</h3>
                </div>
                <div className="max-h-80 overflow-y-auto p-0">
                  {unreadNotifications > 0 ? (
                    Array(unreadNotifications).fill(0).map((_, i) => (
                      <div 
                        key={i} 
                        className="p-3 border-b border-border hover:bg-accent/50 cursor-pointer"
                      >
                        <p className="text-sm font-medium">Conversión completada</p>
                        <p className="text-xs text-muted-foreground">
                          Tu archivo ha sido convertido exitosamente
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Hace {Math.floor(Math.random() * 60)} minutos
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        No tienes notificaciones nuevas
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-border text-center">
                  <Link 
                    to="/notifications" 
                    className="text-xs text-primary hover:underline"
                    onClick={() => setShowNotifications(false)}
                  >
                    Ver todas las notificaciones
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 focus:outline-none"
              onClick={toggleUserMenu}
            >
              <Avatar>
                <span>{user?.name?.charAt(0) || 'U'}</span>
              </Avatar>
              <span className="hidden md:inline-block text-sm font-medium">
                {user?.name || 'Usuario'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-md border border-border bg-background shadow-lg z-50">
                <div className="p-3 border-b border-border">
                  <p className="font-medium truncate">{user?.email || 'usuario@ejemplo.com'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Plan: {userPlan === 'premium' ? 'Premium' : userPlan === 'business' ? 'Business' : 'Gratuito'}
                  </p>
                </div>
                <div className="p-1">
                  <button 
                    className="w-full text-left px-3 py-2 text-sm flex items-center space-x-2 hover:bg-accent/50 rounded-sm"
                    onClick={handleProfileClick}
                  >
                    <User className="h-4 w-4" />
                    <span>Mi Perfil</span>
                  </button>
                  <Link 
                    to="/settings" 
                    className="w-full text-left px-3 py-2 text-sm flex items-center space-x-2 hover:bg-accent/50 rounded-sm"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Configuración</span>
                  </Link>
                  <Link 
                    to="/my-documents" 
                    className="w-full text-left px-3 py-2 text-sm flex items-center space-x-2 hover:bg-accent/50 rounded-sm"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Mis Documentos</span>
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className="w-full text-left px-3 py-2 text-sm flex items-center space-x-2 hover:bg-accent/50 rounded-sm"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    to="/help" 
                    className="w-full text-left px-3 py-2 text-sm flex items-center space-x-2 hover:bg-accent/50 rounded-sm"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Ayuda</span>
                  </Link>
                </div>
                <div className="border-t border-border p-1">
                  <button 
                    className="w-full text-left px-3 py-2 text-sm flex items-center space-x-2 hover:bg-accent/50 rounded-sm text-red-500"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}