# Component Analysis: Header, MainLayout, and Sidebar

## Overview
This document provides a detailed analysis of the three core layout components (Header, MainLayout, and Sidebar) in the Anclora Metaform application, including their current implementation and proposed improvements.

## Current Implementation

### MainLayout Component
**File**: `frontend/src/components/Layout/MainLayout.tsx`

The MainLayout component serves as the primary layout wrapper for the application, providing:
- Animated background with gradient effects
- Integration with Sidebar and Header components
- Credit system context provider
- Responsive layout adjustments

**Current Features**:
- Background animations with CSS gradients and blur effects
- Mobile-responsive design with overlay for collapsed sidebar
- Integration with CreditProvider for credit system
- Dynamic margin adjustments based on sidebar state

**Limitations**:
- Limited state management for user preferences
- No dark mode support
- Basic animation implementation
- Minimal keyboard navigation support

### Sidebar Component
**File**: `frontend/src/components/Layout/Sidebar.tsx`

The Sidebar component provides the main navigation interface with:
- Collapsible design for space optimization
- Navigation menu with icons
- Keyboard navigation support (basic)

**Current Features**:
- Collapsible functionality with smooth transitions
- Icon-based navigation items
- Keyboard navigation with arrow keys
- Responsive design for mobile devices

**Limitations**:
- Basic keyboard navigation without proper focus management
- Limited accessibility attributes (ARIA)
- No visual indicators for active states
- Minimal styling and hover effects

### Header Component
**File**: `frontend/src/components/Layout/Header.tsx`

The Header component displays user information and application context with:
- User profile display
- Credit balance indicator
- Page title and description

**Current Features**:
- Gradient background styling
- User avatar with initial display
- Credit balance indicator with visual dot
- Page title and description

**Limitations**:
- No dark mode support
- Limited user profile functionality
- Basic credit display without detailed information
- No user settings access

## Proposed Improvements

### Enhanced MainLayout Component

#### New Features
1. **Dark Mode Support**
   - Implementation of CSS variables for theme switching
   - Automatic detection of system preference
   - User preference persistence with localStorage

2. **Improved State Management**
   - Custom hooks for localStorage persistence
   - Better separation of layout and business logic
   - Enhanced context integration

3. **Performance Optimizations**
   - Code splitting for non-critical components
   - Animation optimization with CSS transforms
   - Memoization of expensive calculations

#### Implementation Plan
```tsx
// Enhanced MainLayout with better structure
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CreditProvider } from '@/components/CreditSystem';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  // Use localStorage to persist sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage('sidebarCollapsed', false);
  const [isMobile, setIsMobile] = useState(false);
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Memoized check for mobile view
  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (mobile && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  }, [sidebarCollapsed, setSidebarCollapsed]);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  useEffect(() => {
    mainRef.current?.focus();
  }, [activeTab]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${darkMode ? 'dark' : ''}`}>
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Providers wrapper */}
      <CreditProvider>
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />

        {/* Header */}
        <Header 
          sidebarCollapsed={sidebarCollapsed} 
          toggleDarkMode={toggleDarkMode}
          isDarkMode={darkMode}
        />

        {/* Mobile overlay */}
        {isMobile && !sidebarCollapsed && (
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarCollapsed(true)}
            aria-hidden="true"
          />
        )}

        {/* Main content */}
        <main
          ref={mainRef}
          tabIndex={-1}
          role="main"
          aria-label="Contenido principal"
          className={`
            pt-16 min-h-screen relative z-10 transition-all duration-300 ease-in-out
            ml-0 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-72'}
          `}
        >
          <div className="p-6">
            {children}
          </div>
        </main>
      </CreditProvider>
    </div>
  );
};
```

### Enhanced Sidebar Component

#### New Features
1. **Improved Accessibility**
   - Complete ARIA attribute implementation
   - Enhanced keyboard navigation with proper focus management
   - Screen reader support for all interactive elements
   - Better focus trapping for keyboard users

2. **Visual Enhancements**
   - Better hover and active state styling
   - Smooth animations with CSS transitions
   - Consistent design language with rest of application
   - Dark mode support

3. **Mobile Experience**
   - Touch-friendly target sizes
   - Swipe gestures for mobile navigation
   - Improved overlay design

#### Implementation Plan
```tsx
// Enhanced Sidebar with better keyboard navigation
import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Home, FileText, Settings, User, CreditCard } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed, activeTab, setActiveTab }) => {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  // Focus management effect
  useEffect(() => {
    if (!isCollapsed && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [isCollapsed, focusedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = (index + 1) % itemRefs.current.length;
        setFocusedIndex(nextIndex);
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = index === 0 ? itemRefs.current.length - 1 : index - 1;
        setFocusedIndex(prevIndex);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        // Handle item selection
        break;
      case 'Escape':
        setIsCollapsed(true);
        break;
      default:
        break;
    }
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/', key: 'dashboard' },
    { icon: FileText, label: 'Conversiones', path: '/conversions', key: 'conversions' },
    { icon: CreditCard, label: 'Créditos', path: '/credits', key: 'credits' },
    { icon: User, label: 'Perfil', path: '/profile', key: 'profile' },
    { icon: Settings, label: 'Configuración', path: '/settings', key: 'settings' }
  ];

  return (
    <div 
      className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      role="navigation"
      aria-label="Menú principal"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-blue-600">Anclora</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <nav className="p-4" aria-label="Navegación principal">
        <ul className="space-y-2" role="menubar">
          {menuItems.map((item, index) => (
            <li key={item.path} role="none">
              <button
                ref={(el) => { itemRefs.current[index] = el; }}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onClick={() => setActiveTab(item.key)}
                className={`flex items-center w-full px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  activeTab === item.key ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                role="menuitem"
                aria-current={activeTab === item.key ? "page" : undefined}
                tabIndex={index === focusedIndex ? 0 : -1}
              >
                <item.icon size={20} />
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
```

### Enhanced Header Component

#### New Features
1. **Dark Mode Support**
   - Toggle switch for user preference
   - Automatic system preference detection
   - Consistent styling with dark theme

2. **Enhanced User Profile**
   - Dropdown menu with profile options
   - User settings access
   - Logout functionality

3. **Improved Credit Display**
   - Better visual hierarchy
   - Additional credit information
   - Low credit warnings

#### Implementation Plan
```tsx
// Enhanced Header Component
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';

interface HeaderProps {
  sidebarCollapsed: boolean;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({ sidebarCollapsed, toggleDarkMode, isDarkMode }) => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      role="banner"
      aria-label="Encabezado principal"
      className={`
        fixed top-0 right-0 h-16
        ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-primary to-secondary'}
        backdrop-blur-md shadow-md z-30 border-b ${isDarkMode ? 'border-slate-700' : 'border-white/10'}
        transition-all duration-300 ease-in-out
        left-0 ${sidebarCollapsed ? 'md:left-16' : 'md:left-72'}
      `}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Título de la página actual */}
        <div className="flex flex-col justify-center">
          <h1 className={`text-xl font-bold leading-snug ${
            isDarkMode ? 'text-white' : 'text-white'
          }`}>
            Conversor Inteligente
          </h1>
          <p className={`text-sm -mt-1 ${
            isDarkMode ? 'text-slate-300' : 'text-blue-100'
          }`}>
            Convierte archivos con inteligencia artificial avanzada
          </p>
        </div>

        {/* Área de usuario y créditos */}
        <div className="flex items-center space-x-4">
          {/* Modo oscuro toggle */}
          <button 
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-700 text-yellow-300' : 'bg-blue-700/60 text-white'}`}
            aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {/* Contador de créditos */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-white shadow-sm ${
            isDarkMode ? 'bg-slate-700' : 'bg-blue-700/60'
          }`}>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm font-medium">50 créditos</span>
          </div>

          {/* Perfil de usuario dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-slate-800' : 'bg-slate-800'
              }`}
              aria-haspopup="true"
              aria-expanded={isProfileOpen}
              aria-label="Menú de usuario"
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold border ${
                isDarkMode ? 'border-slate-600' : 'border-white/20'
              }`}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-col hidden sm:flex leading-tight">
                <span className="text-sm text-white font-medium">
                  {user?.name || 'Usuario'}
                </span>
                <span className="text-xs text-gray-300">
                  {user?.email || 'usuario@ejemplo.com'}
                </span>
              </div>
              <svg className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-white/50'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isProfileOpen && (
              <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${
                isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'
              }`}>
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium">{user?.name || 'Usuario'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'usuario@ejemplo.com'}</p>
                </div>
                <button
                  className="block px-4 py-2 text-sm w-full text-left hover:bg-blue-500 hover:text-white"
                  onClick={() => {
                    setIsProfileOpen(false);
                    // Navigate to profile page
                  }}
                >
                  Perfil
                </button>
                <button
                  className="block px-4 py-2 text-sm w-full text-left hover:bg-blue-500 hover:text-white"
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
```

## Integration Plan

### Component Relationships
```
MainLayout
├── CreditProvider (Context)
├── Sidebar
│   ├── Navigation Items
│   └── Collapse Toggle
├── Header
│   ├── Dark Mode Toggle
│   ├── Credit Display
│   └── User Profile Dropdown
└── Main Content Area
    └── Children Components
```

### Data Flow
1. **MainLayout** provides the overall structure and context
2. **Sidebar** communicates active tab state to MainLayout
3. **Header** receives state from MainLayout and provides user actions
4. **CreditProvider** manages credit system state for all components

### State Management
- **Sidebar State**: Managed in MainLayout with localStorage persistence
- **Dark Mode**: Managed in MainLayout with localStorage persistence
- **Active Tab**: Passed as props between components
- **User Authentication**: Managed through AuthContext
- **Credit System**: Managed through CreditProvider context

## Implementation Priority

### High Priority (Week 1)
1. Enhanced keyboard navigation for Sidebar
2. Dark mode support for Header
3. Improved focus management in MainLayout
4. Basic animation optimizations

### Medium Priority (Week 2)
1. User profile dropdown in Header
2. Enhanced credit display in Header
3. Better visual feedback in Sidebar
4. Mobile experience improvements

### Low Priority (Week 3-4)
1. Advanced animation optimizations
2. Comprehensive accessibility testing
3. Performance monitoring
4. Full test coverage

## Success Criteria

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation for all interactive elements
- Proper ARIA attributes
- Screen reader compatibility

### Performance
- 20% improvement in load times
- 60fps animations on all devices
- Efficient state updates
- Optimized bundle size

### User Experience
- 15% improvement in user satisfaction scores
- Reduced navigation errors
- Better mobile experience
- Consistent design language