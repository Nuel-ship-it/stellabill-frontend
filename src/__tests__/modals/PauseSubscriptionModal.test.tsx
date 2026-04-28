import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PauseSubscriptionModal from '../../components/PauseSubscriptionModal';

describe('PauseSubscriptionModal Accessibility', () => {
  const onClose = vi.fn();
  const onConfirm = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
    onConfirm.mockClear();
    document.body.innerHTML = '';
  });

  it('traps focus when open', async () => {
    render(
      <PauseSubscriptionModal 
        isOpen={true} 
        onClose={onClose} 
        onConfirm={onConfirm}
      />
    );

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();

    // Wait for initial focus (Keep active button)
    await waitFor(() => {
      const keepBtn = screen.getByRole('button', { name: /keep active/i });
      expect(document.activeElement).toBe(keepBtn);
    });

    const focusableElements = screen.getAllByRole('button');
    const firstElement = focusableElements[0]; // Close button
    const lastElement = focusableElements[focusableElements.length - 1]; // Pause subscription button

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
      <PauseSubscriptionModal 
        isOpen={true} 
        onClose={onClose} 
        onConfirm={onConfirm}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('has proper ARIA attributes', () => {
    render(
      <PauseSubscriptionModal 
        isOpen={true} 
        onClose={onClose} 
        onConfirm={onConfirm}
      />
    );

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'pause-modal-title');
    expect(modal).toHaveAttribute('aria-describedby', 'pause-modal-description');
    
    expect(screen.getByText(/pause subscription\?/i)).toHaveAttribute('id', 'pause-modal-title');
    expect(screen.getByText(/you won't be charged until you resume/i)).toHaveAttribute('id', 'pause-modal-description');
  });
});
