import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { Header } from '../Header';

describe('Header Component', () => {
  it('renders the logo', () => {
    render(<Header />);
    expect(screen.getByLabelText('Home')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    render(<Header />);
    expect(screen.getByRole('link', { name: 'Convertir un archivo' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Â¿CÃ³mo funciona?' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Precios' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contacto' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Darse de baja' })).toBeInTheDocument();
  });

  it('renders the user button', () => {
    render(<Header />);
    // The main user trigger is a button
    expect(screen.getByRole('button', { name: /Iniciar sesiÃ³n/i })).toBeInTheDocument();
  });

  it('toggles user menu on button click', () => {
    render(<Header />);
    const userButton = screen.getByRole('button', { name: /Iniciar sesiÃ³n/i });
    
    // Menu items exist but are not visible due to CSS classes.
    const loginMenuItem = screen.getByRole('menuitem', { name: 'Iniciar sesiÃ³n' });
    const registerMenuItem = screen.getByRole('menuitem', { name: 'Registrarse' });

    expect(loginMenuItem).not.toBeVisible();
    expect(registerMenuItem).not.toBeVisible();

    // Click to open menu
    fireEvent.click(userButton);
    expect(loginMenuItem).toBeVisible();
    expect(registerMenuItem).toBeVisible();

    // Click again to close menu
    fireEvent.click(userButton);
    expect(loginMenuItem).not.toBeVisible();
    expect(registerMenuItem).not.toBeVisible();
  });

  it('closes the user menu when a menu item is clicked', () => {
    render(<Header />);
    const userButton = screen.getByRole('button', { name: /Iniciar sesiÃ³n/i });
    
    // Open menu
    fireEvent.click(userButton);
    const loginMenuItem = screen.getByRole('menuitem', { name: 'Iniciar sesiÃ³n' });
    expect(loginMenuItem).toBeVisible();

    // Click a menu item
    fireEvent.click(loginMenuItem);
    expect(loginMenuItem).not.toBeVisible();
  });

  it('closes the user menu when clicking outside', () => {
    // Render a div outside the header to click on
    render(
      <div>
        <Header />
        <div data-testid="outside-element"></div>
      </div>
    );
    const userButton = screen.getByRole('button', { name: /Iniciar sesiÃ³n/i });
    
    // Open menu
    fireEvent.click(userButton);
    const loginMenuItem = screen.getByRole('menuitem', { name: 'Iniciar sesiÃ³n' });
    expect(loginMenuItem).toBeVisible();

    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside-element'));
    expect(loginMenuItem).not.toBeVisible();
  });
});

