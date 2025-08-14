            # Frontend Technical Specification for Anclora Metaform

## Overview
This document provides technical specifications for implementing the design and infrastructure improvements outlined in the frontend improvement plan. It includes code examples, implementation details, and best practices for each enhancement.

## 1. Sidebar Enhancements

### Current Implementation Analysis
The current sidebar implementation in `components/Layout/Sidebar.tsx` has basic functionality but lacks advanced accessibility features and smooth animations.

### Improvement Implementation

#### Enhanced Keyboard Navigation
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

#### Smooth Animation Transitions
```css
/* Enhanced sidebar animations in index.css */
.sidebar-transition {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-transition-fast {
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-item-enter {
  opacity: 0;
  transform: translateX(-10px);
}

.sidebar-item-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: opacity 300ms, transform 300ms;
}

.sidebar-item-exit {
  opacity: 1;
  transform: translateX(0);
}

.sidebar-item-exit-active {
  opacity: 0;
  transform: translateX(-10px);
  transition: opacity 300ms, transform 300ms;
}
```

## 2. Header Improvements

### Current Implementation Analysis
The header in `components/Layout/Header.tsx` has basic styling but lacks dark mode support and proper user dropdown functionality.

### Improvement Implementation

#### Enhanced Header with Dark Mode Support
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

## 3. Credit System Improvements

### Current Implementation Analysis
The credit system in `components/CreditSystem/` has basic functionality but lacks detailed visualization and proper error handling.

### Improvement Implementation

#### Enhanced Credit Balance Component
```tsx
// Enhanced CreditBalance Component
import React from 'react';
import { useCreditSystem } from './index';

const CreditBalance: React.FC = () => {
  const { balance } = useCreditSystem();
  
  // Calculate percentage of plan credits used
  const percentageUsed = Math.min(100, (balance.total_consumed / Math.max(1, balance.plan_credits)) * 100);

  return (
    <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Saldo de Créditos</h3>
        <span className="text-sm bg-blue-500 px-2 py-1 rounded-full">Plan Explorador Plus</span>
      </div>
      
      <div className="mb-4">
        <div className="text-3xl font-bold mb-2">{balance.current} 💳</div>
        <div className="text-sm text-slate-300">
          {balance.plan_credits} plan + {balance.bonus_credits} bonus
        </div>
      </div>
      
      {/* Progress bar visualization */}
      <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
        <div 
          className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentageUsed}%` }}
        ></div>
      </div>
      
      <div className="text-xs text-slate-400 flex justify-between">
        <span>Consumidos: {balance.total_consumed}</span>
        <span>Total comprados: {balance.total_purchased}</span>
      </div>
    </div>
  );
};

export default CreditBalance;
```

#### Enhanced Credit History Component
```tsx
// Enhanced CreditHistory Component
import React, { useState } from 'react';
import { useCreditSystem } from './index';
import { CreditTransaction } from './types';

const CreditHistory: React.FC = () => {
  const { transactions, currency } = useCreditSystem();
  const [filter, setFilter] = useState<'all' | 'consumption' | 'purchase' | 'bonus'>('all');
  
  // Filter transactions based on selected filter
  const filteredTransactions = transactions.filter(transaction => 
    filter === 'all' || transaction.type === filter
  );
  
  // Format currency based on selected currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency === 'eur' ? 'EUR' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Historial de Créditos</h3>
        
        {/* Filter buttons */}
        <div className="flex space-x-2">
          {(['all', 'consumption', 'purchase', 'bonus'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`text-xs px-2 py-1 rounded-full ${
                filter === filterType 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {filterType === 'all' ? 'Todos' : 
               filterType === 'consumption' ? 'Usados' : 
               filterType === 'purchase' ? 'Comprados' : 'Bonus'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {filteredTransactions.map((transaction) => (
          <div 
            key={transaction.id} 
            className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <div className="flex-1">
              <div className="font-medium text-sm">{transaction.description}</div>
              <div className="text-xs text-slate-400">
                {transaction.timestamp.toLocaleDateString('es-ES')}
                {transaction.conversion_id && ` • ID: ${transaction.conversion_id}`}
              </div>
            </div>
            
            <div className={`font-semibold ${
              transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {transaction.amount > 0 ? '+' : ''}{transaction.amount}
            </div>
          </div>
        ))}
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            No hay transacciones para mostrar
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditHistory;
```

## 4. Performance Optimization

### Code Splitting Implementation
```tsx
// In pages/app.tsx - Implement dynamic imports
import { MainLayout } from "../components/Layout/MainLayout";
import { useState, lazy, Suspense } from "react";

// Lazy load components
const ConversorInteligente = lazy(() => import("../components/ConversorInteligente"));
const CreditSystem = lazy(() => import("../components/CreditSystem"));

export default function AppPage() {
  const [activeTab, setActiveTab] = useState("Conversor");
  
  return (
    <Suspense fallback={<div className="p-6">Cargando...</div>}>
      <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === "Conversor" && <ConversorInteligente />}
        {activeTab === "Créditos" && <CreditSystem />}
      </MainLayout>
    </Suspense>
  );
}
```

### Animation Optimization
```css
/* In index.css - Optimize animations with will-change and transform */
.anclora-animated-bg {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

.anclora-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  will-change: opacity;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
}
```

## 5. Infrastructure Improvements

### Enhanced MainLayout Component
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

### Custom Hook for Local Storage
```tsx
// hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export const useLocalStorage = <T,>(
  key: string,
  initialValue: T
): [T, (value: T) => void] => {
  // Get value from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Set value in localStorage
  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};
```

## 6. Testing Improvements

### Enhanced Test Structure
```tsx
// __tests__/MainLayout.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MainLayout } from '../components/Layout/MainLayout';

// Mock child component
const MockChild: React.FC = () => <div>Mock Content</div>;

describe('MainLayout', () => {
  const mockSetActiveTab = jest.fn();
  
  beforeEach(() => {
    mockSetActiveTab.mockClear();
  });

  it('renders children content correctly', () => {
    render(
      <MainLayout activeTab="Conversor" setActiveTab={mockSetActiveTab}>
        <MockChild />
      </MainLayout>
    );
    
    expect(screen.getByText('Mock Content')).toBeInTheDocument();
  });

  it('toggles sidebar collapse state', async () => {
    render(
      <MainLayout activeTab="Conversor" setActiveTab={mockSetActiveTab}>
        <MockChild />
      </MainLayout>
    );
    
    const toggleButton = screen.getByLabelText('Colapsar menú');
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(mockSetActiveTab).not.toHaveBeenCalled();
    });
  });

  it('applies correct margin classes based on sidebar state', () => {
    const { container } = render(
      <MainLayout activeTab="Conversor" setActiveTab={mockSetActiveTab}>
        <MockChild />
      </MainLayout>
    );
    
    const mainElement = container.querySelector('main');
    expect(mainElement).toHaveClass('md:ml-72');
  });
});
```

## 7. Documentation Improvements

### Component Documentation Example
```tsx
// components/Layout/MainLayout.tsx with JSDoc
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CreditProvider } from '@/components/CreditSystem';

/**
 * MainLayout Component
 * 
 * This component provides the main application layout with:
 * - Collapsible sidebar navigation
 * - Responsive header with user info
 * - Animated background
 * - Credit system integration
 * 
 * @component
 * @example
 * ```tsx
 * <MainLayout activeTab="dashboard" setActiveTab={setActiveTab}>
 *   <DashboardContent />
 * </MainLayout>
 * ```
 * 
 * @param {React.ReactNode} children - The content to be displayed in the main area
 * @param {string} activeTab - The currently active navigation tab
 * @param {Function} setActiveTab - Function to update the active tab
 * 
 * @returns {JSX.Element} The main application layout
 */
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
  // Implementation...
};
```

## Implementation Priority

### High Priority (Week 1)
1. Sidebar keyboard navigation enhancements
2. Header dark mode implementation
3. Credit balance visualization improvements
4. Basic animation optimizations

### Medium Priority (Week 2)
1. Credit history filtering
2. Local storage persistence for user preferences
3. Profile dropdown implementation
4. Enhanced test coverage

### Low Priority (Week 3-4)
1. Full code splitting implementation
2. Advanced animation optimizations
3. Comprehensive documentation
4. Performance monitoring setup

## Success Criteria
- All accessibility improvements pass WCAG 2.1 AA compliance
- Performance metrics show 20% improvement in load times
- Test coverage increases to 80% for layout components
- User satisfaction scores improve by 15% after deployment