import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, afterEach } from 'vitest';
import { Modal } from '../Modal';

const ModalWrapper = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open Modal</button>
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <input placeholder="First" />
        <button>Second</button>
      </Modal>
    </>
  );
};

afterEach(() => {
  cleanup();
});

describe('Modal accessibility', () => {
  it('traps focus and restores trigger focus on close', async () => {
    render(<ModalWrapper />);
    const trigger = screen.getByText('Open Modal');
    trigger.focus();
    fireEvent.click(trigger);

    const closeButton = screen.getByLabelText('Cerrar');
    expect(closeButton).toHaveFocus();

    // Manually move focus through elements
    const firstInput = screen.getByPlaceholderText('First');
    firstInput.focus();
    const secondButton = screen.getByText('Second');
    secondButton.focus();

    // Tab from last element should wrap to first (close button)
    fireEvent.keyDown(secondButton, { key: 'Tab' });
    expect(closeButton).toHaveFocus();

    // Close with Escape
    fireEvent.keyDown(closeButton, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  it('provides an accessible close button', () => {
    render(<ModalWrapper />);
    fireEvent.click(screen.getByText('Open Modal'));
    expect(screen.getByLabelText('Cerrar')).toBeInTheDocument();
  });
});
