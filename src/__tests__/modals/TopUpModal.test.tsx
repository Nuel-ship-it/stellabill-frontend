import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TopUpModal from '../../components/TopUpModal';

describe('TopUpModal Accessibility', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
    document.body.innerHTML = '';
  });

  it('traps focus when open', async () => {
    render(
      <TopUpModal 
        isOpen={true} 
        onClose={onClose}
      />
    );

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();

    // Wait for initial focus (Amount input)
    await waitFor(() => {
      const amountInput = screen.getByPlaceholderText('0.00');
      expect(document.activeElement).toBe(amountInput);
    });

    const focusableElements = [
        ...screen.getAllByRole('button'),
        screen.getByPlaceholderText('0.00')
    ];
    
    // In our TopUpModal, the focusable elements are:
    // 1. Close button (header)
    // 2. Quick select buttons (3)
    // 3. Amount input
    // 4. Cancel button
    // 5. Top up button
    
    // The exact order in DOM:
    // Close button -> Quick Selects -> Amount Input -> Cancel -> Top Up
    
    const closeBtn = screen.getByLabelText(/close/i);
    const topUpBtn = screen.getByRole('button', { name: /top up/i });

    // Shift+Tab on close button should go to top up button
    closeBtn.focus();
    fireEvent.keyDown(closeBtn, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(topUpBtn);

    // Tab on top up button should go to close button
    topUpBtn.focus();
    fireEvent.keyDown(topUpBtn, { key: 'Tab' });
    expect(document.activeElement).toBe(closeBtn);
  });

  it('closes on Escape key', () => {
    render(
      <TopUpModal 
        isOpen={true} 
        onClose={onClose}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('has proper ARIA attributes', () => {
    render(
      <TopUpModal 
        isOpen={true} 
        onClose={onClose}
      />
    );

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'topup-modal-title');
    expect(modal).toHaveAttribute('aria-describedby', 'topup-modal-description');
    
    expect(screen.getByText(/top up balance/i)).toHaveAttribute('id', 'topup-modal-title');
    expect(screen.getByText(/add usdc to your prepaid balance/i)).toHaveAttribute('id', 'topup-modal-description');
  });
});
