import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ErrorState from './ErrorState';

describe('ErrorState Component', () => {
  const onRetry = vi.fn();

  beforeEach(() => {
    onRetry.mockClear();
  });

  it('renders title and message correctly', () => {
    render(<ErrorState title="Failed to Load" message="Please try again later." />);
    
    expect(screen.getByText('Failed to Load')).toBeInTheDocument();
    expect(screen.getByText('Please try again later.')).toBeInTheDocument();
  });

  it('shows default title if none provided', () => {
    render(<ErrorState message="Error occurred." />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    render(<ErrorState message="Error" onRetry={onRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('disables retry button when isRetrying is true', () => {
    render(<ErrorState message="Error" onRetry={onRetry} isRetrying={true} />);
    
    const retryButton = screen.getByRole('button', { name: /retrying.../i });
    expect(retryButton).toBeDisabled();
    expect(retryButton).toHaveAttribute('aria-busy', 'true');
  });

  it('toggles technical details visibility', () => {
    const details = 'Stack trace details here';
    render(<ErrorState message="Error" technicalDetails={details} />);
    
    // Initially hidden
    expect(screen.queryByText(details)).not.toBeInTheDocument();
    
    const toggleButton = screen.getByRole('button', { name: /technical details/i });
    
    // Show details
    fireEvent.click(toggleButton);
    expect(screen.getByText(details)).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    
    // Hide details
    fireEvent.click(toggleButton);
    expect(screen.queryByText(details)).not.toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows offline messaging when type is offline', () => {
    render(<ErrorState message="Error" type="offline" />);
    
    expect(screen.getByText(/no internet connection/i)).toBeInTheDocument();
    expect(screen.getByText(/please check your network settings/i)).toBeInTheDocument();
  });

  it('renders contact support button with correct link', () => {
    render(<ErrorState message="Error" />);
    
    const supportButton = screen.getByRole('button', { name: /contact support/i });
    expect(supportButton).toBeInTheDocument();
    
    // Mock window.open
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    fireEvent.click(supportButton);
    expect(windowOpenSpy).toHaveBeenCalledWith('https://support.stellarbill.com', '_blank');
    windowOpenSpy.mockRestore();
  });
});
