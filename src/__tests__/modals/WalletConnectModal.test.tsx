import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WalletConnectModal from '../../components/WalletConnectModal';

describe('WalletConnectModal Accessibility', () => {
  const onClose = vi.fn();
  const onConnectFreighter = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
    onConnectFreighter.mockClear();
    document.body.innerHTML = '';
  });

  it('traps focus when open', async () => {
    render(
      <WalletConnectModal isOpen={true} onClose={onClose} />
    );

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();

    // Wait for initial focus
    await waitFor(() => {
      const closeBtn = screen.getByLabelText(/close modal/i);
      expect(document.activeElement).toBe(closeBtn);
    });

    const focusableElements = screen.getAllByRole('button').filter(el => !(el as HTMLButtonElement).disabled);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Shift+Tab on first element should go to last element
    firstElement.focus();
    fireEvent.keyDown(firstElement, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(lastElement);

    // Tab on last element should go to first element
    lastElement.focus();
    fireEvent.keyDown(lastElement, { key: 'Tab' });
    expect(document.activeElement).toBe(firstElement);
  });

  it('closes on Escape key', () => {
    render(
      <WalletConnectModal isOpen={true} onClose={onClose} />
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('restores focus to previous element on close', async () => {
    const trigger = document.createElement('button');
    trigger.innerText = 'Open Modal';
    document.body.appendChild(trigger);
    trigger.focus();
    const previousFocus = document.activeElement;

    const { rerender } = render(
      <WalletConnectModal isOpen={true} onClose={onClose} />
    );

    // Close the modal
    rerender(<WalletConnectModal isOpen={false} onClose={onClose} />);

    expect(document.activeElement).toBe(previousFocus);
  });

  it('has proper ARIA attributes', () => {
    render(
      <WalletConnectModal isOpen={true} onClose={onClose} />
    );

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
    expect(modal).toHaveAttribute('aria-describedby', 'modal-description');
    
    expect(screen.getByText(/connect your/i)).toHaveAttribute('id', 'modal-title');
    expect(screen.getByText(/sign in with your wallet/i)).toHaveAttribute('id', 'modal-description');
  });
});
