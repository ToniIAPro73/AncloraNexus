import React, { useState, useRef, useEffect } from 'react';
import { IconUser, IconHeaderLogo } from './Icons';

export const Header: React.FC = () => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const navLinks = [
        { name: 'Convertir un archivo', href: '#' },
        { name: '¿Cómo funciona?', href: '#' },
        { name: 'Precios', href: '#' },
        { name: 'Contacto', href: '#' },
        { name: 'Darse de baja', href: '#' },
    ];

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-200">
            {/* Top accent bar */}
            <div className="h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-lime-500"></div>
            
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <a href="#" aria-label="Home">
                            <IconHeaderLogo className="h-8 w-auto text-slate-800" />
                        </a>
                    </div>

                    <nav className="hidden lg:flex lg:items-center lg:space-x-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-slate-600 hover:text-green-600 font-medium transition-colors duration-200 text-base"
                            >
                                {link.name}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center">
                         <div className="relative" ref={userMenuRef}>
                            <button
                                id="user-menu-button"
                                onClick={() => setIsUserMenuOpen(prev => !prev)}
                                className="flex items-center text-slate-700 hover:text-green-600 font-semibold transition-colors duration-200"
                                aria-expanded={isUserMenuOpen}
                                aria-haspopup="true"
                            >
                                <IconUser className="w-6 h-6 mr-2" />
                                <span>Iniciar sesión</span>
                            </button>
                            
                            <div 
                                className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50 origin-top-right ${
                                    !isUserMenuOpen ? 'hidden' : ''
                                }`}
                                role="menu"
                                aria-orientation="vertical"
                                aria-labelledby="user-menu-button"
                            >
                                <a
                                    href="/login"
                                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                    role="menuitem"
                                    onClick={() => setIsUserMenuOpen(false)}
                                >
                                    Iniciar sesión
                                </a>
                                <a
                                    href="/register"
                                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                    role="menuitem"
                                    onClick={() => setIsUserMenuOpen(false)}
                                >
                                    Registrarse
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};