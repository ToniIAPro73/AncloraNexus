# Responsive Design and Dark Mode Implementation Guide

## Overview
This document provides a comprehensive guide for implementing fully responsive design and accessible dark mode across the entire Anclora Metaform application. The implementation ensures perfect readability in all modes and devices.

## Responsive Design Implementation

### Mobile-First Approach
The application will follow a mobile-first design approach, ensuring optimal experience on all device sizes:

#### Breakpoints
```css
/* Base styles for mobile-first approach */
:root {
  --breakpoint-xs: 0;      /* Extra small devices (portrait phones) */
  --breakpoint-sm: 576px;   /* Small devices (landscape phones) */
  --breakpoint-md: 768px;   /* Medium devices (tablets) */
  --breakpoint-lg: 992px;   /* Large devices (desktops) */
  --breakpoint-xl: 1200px;  /* Extra large devices (large desktops) */
  --breakpoint-xxl: 1400px; /* XXL devices */
}

/* Media query mixins for consistent usage */
@media (min-width: 576px) { /* Small devices */ }
@media (min-width: 768px) { /* Medium devices */ }
@media (min-width: 992px) { /* Large devices */ }
@media (min-width: 1200px) { /* Extra large devices */ }
@media (min-width: 1400px) { /* XXL devices */ }
```

### Flexible Grid System
Implementation of a flexible grid system using CSS Grid and Flexbox:

```css
/* Container classes for responsive layouts */
.container {
  width: 100%;
  padding-right: var(--spacer);
  padding-left: var(--spacer);
  margin-right: auto;
  margin-left: auto;
}

.container-fluid {
  width: 100%;
  padding-right: var(--spacer);
  padding-left: var(--spacer);
  margin-right: auto;
  margin-left: auto;
}

/* Responsive grid system */
.grid {
  display: grid;
  gap: var(--spacer);
}

.grid-cols-1 { grid-template-columns: 1fr; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }

@media (min-width: 576px) {
  .sm\:grid-cols-1 { grid-template-columns: 1fr; }
  .sm\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .sm\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 768px) {
  .md\:grid-cols-1 { grid-template-columns: 1fr; }
  .md\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .md\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  .md\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
}

/* Flexbox utilities for responsive layouts */
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.flex-wrap {
  flex-wrap: wrap;
}

@media (min-width: 768px) {
  .md\:flex-row {
    flex-direction: row;
  }
  
  .md\:flex-nowrap {
    flex-wrap: nowrap;
  }
}
```

### Touch-Friendly Design
Implementation of touch-friendly elements:

```css
/* Touch target minimum size */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}

/* Touch-friendly navigation */
.nav-touch {
  min-height: 48px;
  padding: 16px 12px;
}

/* Responsive typography */
.responsive-text {
  font-size: clamp(0.875rem, 0.5rem + 1.5vw, 1.125rem);
  line-height: 1.5;
}

/* Responsive spacing */
.responsive-padding {
  padding: clamp(0.5rem, 0.25rem + 1vw, 1rem);
}

.responsive-margin {
  margin: clamp(0.5rem, 0.25rem + 1vw, 1rem);
}
```

### Component-Specific Responsive Design

#### Header Responsive Design
```tsx
// Enhanced responsive Header component
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';

interface HeaderProps {
  sidebarCollapsed: boolean;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  sidebarCollapsed, 
  toggleDarkMode, 
  isDarkMode 
}) => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        ${isMobile ? 'left-0' : ''}
      `}
    >
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* Título de la página actual - responsive */}
        <div className="flex flex-col justify-center flex-1 min-w-0">
          <h1 className={`
            text-lg sm:text-xl font-bold leading-snug truncate
            ${isDarkMode ? 'text-white' : 'text-white'}
          `}>
            Conversor Inteligente
          </h1>
          <p className={`
            text-xs sm:text-sm -mt-1 truncate
            ${isDarkMode ? 'text-slate-300' : 'text-blue-100'}
          `}>
            Convierte archivos con IA avanzada
          </p>
        </div>

        {/* Área de usuario y créditos - responsive */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Modo oscuro toggle */}
          <button 
            onClick={toggleDarkMode}
            className={`
              p-1 sm:p-2 rounded-full text-sm sm:text-base
              ${isDarkMode ? 'bg-slate-700 text-yellow-300' : 'bg-blue-700/60 text-white'}
            `}
            aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {/* Contador de créditos - responsive */}
          <div className={`
            flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm
            ${isDarkMode ? 'bg-slate-700' : 'bg-blue-700/60'}
            text-white shadow-sm
          `}>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full"></div>
            <span className="font-medium hidden xs:inline">50 créditos</span>
            <span className="font-medium xs:hidden">50</span>
          </div>

          {/* Perfil de usuario dropdown - responsive */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`
                flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full shadow
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${isDarkMode ? 'bg-slate-800' : 'bg-slate-800'}
              `}
              aria-haspopup="true"
              aria-expanded={isProfileOpen}
              aria-label="Menú de usuario"
            >
              <div className={`
                w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-secondary 
                flex items-center justify-center text-xs sm:text-sm font-semibold border
                ${isDarkMode ? 'border-slate-600' : 'border-white/20'}
              `}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-col hidden sm:flex leading-tight">
                <span className="text-xs sm:text-sm text-white font-medium truncate max-w-20">
                  {user?.name || 'Usuario'}
                </span>
                <span className="text-xs text-gray-300 truncate max-w-20">
                  {user?.email || 'usuario@ejemplo.com'}
                </span>
              </div>
              <svg className={`
                w-3 h-3 sm:w-4 sm:h-4 
                ${isDarkMode ? 'text-slate-400' : 'text-white/50'}
              `} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isProfileOpen && (
              <div className={`
                absolute right-0 mt-1 w-40 sm:w-48 rounded-md shadow-lg py-1 z-50
                ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'}
              `}>
                <div className="px-3 sm:px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium truncate">{user?.name || 'Usuario'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || 'usuario@ejemplo.com'}</p>
                </div>
                <button
                  className="block px-3 sm:px-4 py-2 text-sm w-full text-left hover:bg-blue-500 hover:text-white"
                  onClick={() => {
                    setIsProfileOpen(false);
                    // Navigate to profile page
                  }}
                >
                  Perfil
                </button>
                <button
                  className="block px-3 sm:px-4 py-2 text-sm w-full text-left hover:bg-blue-500 hover:text-white"
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

#### Sidebar Responsive Design
```tsx
// Enhanced responsive Sidebar component
import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Home, FileText, Settings, User, CreditCard } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  setIsCollapsed, 
  activeTab, 
  setActiveTab,
  isMobile
}) => {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  // Focus management effect
  useEffect(() => {
    if (!isCollapsed && !isMobile && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [isCollapsed, focusedIndex, isMobile]);

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
        if (isMobile) {
          setIsCollapsed(true);
        }
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
      className={`
        bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'} 
        ${isMobile ? 'fixed inset-y-0 z-40' : 'relative'}
        ${isDarkMode ? 'dark:bg-slate-800 dark:border-slate-700' : ''}
      `}
      role="navigation"
      aria-label="Menú principal"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h1 className="text-lg sm:text-xl font-bold text-blue-600 truncate">Anclora</h1>
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
        <ul className="space-y-1 sm:space-y-2" role="menubar">
          {menuItems.map((item, index) => (
            <li key={item.path} role="none">
              <button
                ref={(el) => { itemRefs.current[index] = el; }}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onClick={() => {
                  setActiveTab(item.key);
                  if (isMobile) {
                    setIsCollapsed(true);
                  }
                }}
                className={`
                  flex items-center w-full px-2 sm:px-3 py-2 sm:py-3 rounded-lg 
                  hover:bg-blue-50 hover:text-blue-600 transition-colors 
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${activeTab === item.key ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}
                  ${isCollapsed ? 'justify-center' : 'justify-start'}
                  ${isDarkMode ? 
                    (activeTab === item.key ? 'dark:bg-blue-900 dark:text-blue-200' : 'dark:text-gray-300 dark:hover:bg-slate-700') : 
                    ''}
                `}
                role="menuitem"
                aria-current={activeTab === item.key ? "page" : undefined}
                tabIndex={index === focusedIndex ? 0 : -1}
              >
                <item.icon size={isMobile ? 18 : 20} />
                {!isCollapsed && <span className="ml-2 sm:ml-3 text-sm sm:text-base">{item.label}</span>}
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

## Dark Mode Implementation

### CSS Custom Properties for Theming
```css
/* Dark mode CSS variables */
:root {
  /* Light mode defaults */
  --color-background: #ffffff;
  --color-text-primary: #111827;
  --color-text-secondary: #64748b;
  --color-border: #e2e8f0;
  --color-header-bg: linear-gradient(135deg, #004aad, #0066cc);
  --color-sidebar-bg: #ffffff;
  --color-card-bg: #ffffff;
  --color-card-shadow: rgba(0, 0, 0, 0.1);
  --color-accent: #0066cc;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
}

[data-theme="dark"] {
  --color-background: #0f172a;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-border: #334155;
  --color-header-bg: linear-gradient(135deg, #1e293b, #0f172a);
  --color-sidebar-bg: #1e293b;
  --color-card-bg: #1e293b;
  --color-card-shadow: rgba(0, 0, 0, 0.3);
  --color-accent: #60a5fa;
  --color-success: #34d399;
  --color-warning: #fbbf24;
  --color-error: #f87171;
}

/* Dark mode utility classes */
.dark {
  --color-background: #0f172a;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-border: #334155;
  --color-header-bg: linear-gradient(135deg, #1e293b, #0f172a);
  --color-sidebar-bg: #1e293b;
  --color-card-bg: #1e293b;
  --color-card-shadow: rgba(0, 0, 0, 0.3);
  --color-accent: #60a5fa;
  --color-success: #34d399;
  --color-warning: #fbbf24;
  --color-error: #f87171;
}

/* Base component styles with dark mode support */
.component-base {
  background-color: var(--color-card-bg);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 6px var(--color-card-shadow);
  transition: all 0.3s ease;
}

.component-base:hover {
  box-shadow: 0 8px 15px var(--color-card-shadow);
}

/* Text styles with dark mode support */
.text-primary {
  color: var(--color-text-primary);
}

.text-secondary {
  color: var(--color-text-secondary);
}

/* Button styles with dark mode support */
.btn-primary {
  background: var(--color-accent);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: color-mix(in srgb, var(--color-accent) 90%, black 10%);
  transform: translateY(-1px);
}

.btn-primary:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Form elements with dark mode support */
.form-input {
  background-color: var(--color-card-bg);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  padding: 0.5rem;
  width: 100%;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  border-color: var(--color-accent);
  outline: 2px solid var(--color-accent);
  outline-offset: 0;
}

.form-input::placeholder {
  color: var(--color-text-secondary);
}
```

### JavaScript Implementation for Dark Mode
```tsx
// Dark mode hook implementation
import { useState, useEffect } from 'react';

export const useDarkMode = (): [boolean, () => void] => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Check system preference and localStorage
  useEffect(() => {
    const storedPreference = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedPreference !== null) {
      setIsDarkMode(JSON.parse(storedPreference));
    } else {
      setIsDarkMode(systemPrefersDark);
    }
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return [isDarkMode, toggleDarkMode];
};

// Dark mode context provider
import React, { createContext, useContext } from 'react';

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, toggleDarkMode] = useDarkMode();

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkModeContext = () => {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkModeContext must be used within a DarkModeProvider');
  }
  return context;
};
```

### Accessibility Considerations for Dark Mode

#### Color Contrast Requirements
```css
/* Ensure WCAG 2.1 AA contrast ratios */
:root {
  /* Light mode - minimum 4.5:1 contrast */
  --color-text-on-light: #111827; /* 15.48:1 on white */
  --color-text-secondary-on-light: #64748b; /* 4.54:1 on white */
  
  /* Dark mode - minimum 4.5:1 contrast */
  --color-text-on-dark: #f1f5f9; /* 12.63:1 on #0f172a */
  --color-text-secondary-on-dark: #94a3b8; /* 4.57:1 on #0f172a */
}

/* Validation utility classes */
.text-contrast-check {
  /* Light mode text on dark background */
  color: var(--color-text-on-dark);
}

.text-contrast-secondary {
  /* Secondary text with proper contrast */
  color: var(--color-text-secondary-on-dark);
}

/* Ensure all interactive elements meet contrast requirements */
.btn:focus,
.form-input:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Focus visible for keyboard navigation */
.btn:focus:not(:focus-visible) {
  outline: none;
}

.btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

## Implementation Checklist

### Responsive Design
- [ ] Mobile-first CSS implementation
- [ ] Flexible grid system with breakpoints
- [ ] Touch-friendly target sizes (minimum 44px)
- [ ] Responsive typography with clamp()
- [ ] Flexible spacing with viewport units
- [ ] Component-specific responsive behaviors
- [ ] Mobile navigation patterns
- [ ] Cross-device testing

### Dark Mode
- [ ] CSS custom properties for theming
- [ ] JavaScript preference management
- [ ] System preference detection
- [ ] LocalStorage persistence
- [ ] WCAG 2.1 AA contrast compliance
- [ ] Focus state visibility in both modes
- [ ] Form element styling consistency
- [ ] Image and icon adaptation

### Accessibility
- [ ] Proper ARIA attributes for all components
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Focus management
- [ ] Color contrast validation
- [ ] Reduced motion support
- [ ] High contrast mode considerations

## Testing Strategy

### Responsive Testing
1. **Device Testing**:
   - iPhone SE (375px width)
   - iPhone 12 Pro Max (428px width)
   - iPad Air (820px width)
   - Desktop (1920px width)

2. **Breakpoint Testing**:
   - 320px (minimum width)
   - 576px (sm breakpoint)
   - 768px (md breakpoint)
   - 992px (lg breakpoint)
   - 1200px (xl breakpoint)
   - 1400px (xxl breakpoint)

### Dark Mode Testing
1. **Contrast Validation**:
   - Use axe DevTools or similar
   - Manual verification with color contrast tools
   - Test both active and hover states

2. **Preference Testing**:
   - System preference override
   - Manual toggle functionality
   - Persistence across sessions

3. **Accessibility Testing**:
   - Keyboard navigation in both modes
   - Screen reader compatibility
   - Focus indicator visibility

## Success Metrics

### Responsive Design
- Perfect rendering on all device sizes
- Touch target sizes meet minimum requirements
- No horizontal scrolling on mobile
- Readable text at all breakpoints
- Intuitive navigation on all devices

### Dark Mode
- WCAG 2.1 AA compliance in both modes
- Seamless transition between modes
- Consistent styling across all components
- Perfect readability in both light and dark modes
- User preference persistence

### Performance
- No layout shifts during responsive adjustments
- Fast dark mode toggle response
- Minimal CSS bundle size impact
- Efficient JavaScript execution

## Implementation Priority

### Phase 1 (Week 1)
1. Implement CSS custom properties for theming
2. Create dark mode JavaScript hooks
3. Add responsive breakpoints to existing components
4. Implement touch-friendly sizing

### Phase 2 (Week 2)
1. Enhance Header with responsive and dark mode support
2. Enhance Sidebar with responsive and dark mode support
3. Implement dark mode context provider
4. Add accessibility attributes

### Phase 3 (Week 3)
1. Comprehensive cross-device testing
2. Accessibility validation
3. Performance optimization
4. User preference persistence

### Phase 4 (Week 4)
1. Final testing and bug fixes
2. Documentation updates
3. Team training on new components
4. Deployment preparation

## Maintenance Considerations

### Future Development Guidelines
1. All new components must support both responsive design and dark mode
2. CSS should use custom properties for consistent theming
3. Components must meet accessibility standards
4. Mobile-first approach required for all layouts

### Code Review Checklist
- [ ] Responsive design implemented with mobile-first approach
- [ ] Dark mode support with proper contrast ratios
- [ ] Accessibility attributes (ARIA, roles, etc.)
- [ ] Touch-friendly target sizes
- [ ] Proper focus management
- [ ] Semantic HTML structure
- [ ] Performance considerations