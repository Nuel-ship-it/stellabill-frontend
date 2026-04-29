import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'

function Harness({
  initialOpen = true,
  ...overrides
}: Partial<React.ComponentProps<typeof ConfirmDialog>> & { initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen)
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <ConfirmDialog
        isOpen={open}
        title="Delete account?"
        description="This is irreversible."
        onClose={() => setOpen(false)}
        onConfirm={vi.fn()}
        {...overrides}
      />
    </>
  )
}

describe('ConfirmDialog — rendering', () => {
  it('does not render when isOpen is false', () => {
    render(<Harness initialOpen={false} />)
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('renders with role="alertdialog" and is modal', () => {
    render(<Harness />)
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('labels the dialog with the title and describes it with the description', () => {
    render(<Harness />)
    const dialog = screen.getByRole('alertdialog')
    const labelledBy = dialog.getAttribute('aria-labelledby')
    const describedBy = dialog.getAttribute('aria-describedby')
    expect(labelledBy).toBeTruthy()
    expect(describedBy).toBeTruthy()
    expect(document.getElementById(labelledBy!)).toHaveTextContent('Delete account?')
    expect(document.getElementById(describedBy!)).toHaveTextContent('This is irreversible.')
  })

  it('omits aria-describedby when no description is provided', () => {
    render(<Harness description={undefined} />)
    expect(screen.getByRole('alertdialog')).not.toHaveAttribute('aria-describedby')
  })

  it('renders consequences as a list', () => {
    render(<Harness consequences={['Loses data', 'Cancels billing']} />)
    const list = screen.getByRole('list', { name: /consequences/i })
    const items = list.querySelectorAll('li')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Loses data')
    expect(items[1]).toHaveTextContent('Cancels billing')
  })

  it('uses provided custom labels', () => {
    render(
      <Harness confirmLabel="Yes, delete" cancelLabel="No, keep" />
    )
    expect(screen.getByRole('button', { name: /yes, delete/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /no, keep/i })).toBeInTheDocument()
  })

  it('hides the destructive icon when destructive is false', () => {
    const { container } = render(<Harness destructive={false} />)
    expect(container.querySelector('.confirm-dialog__icon')).toBeNull()
    expect(screen.getByRole('alertdialog')).not.toHaveClass('confirm-dialog--destructive')
  })

  it('shows loading label and disables buttons when isLoading is true', () => {
    render(<Harness isLoading loadingLabel="Deleting..." />)
    const confirm = screen.getByRole('button', { name: /deleting/i })
    expect(confirm).toBeDisabled()
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /close dialog/i })).toBeDisabled()
  })

  it('falls back to "<confirmLabel>..." when loadingLabel is omitted', () => {
    render(<Harness isLoading confirmLabel="Remove" />)
    expect(screen.getByRole('button', { name: /^remove\.\.\.$/i })).toBeInTheDocument()
  })
})

describe('ConfirmDialog — interaction', () => {
  let onConfirm: () => void

  beforeEach(() => {
    onConfirm = vi.fn()
  })

  it('fires onConfirm when the confirm button is clicked', () => {
    render(<Harness onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole('button', { name: /^confirm$/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('closes when the cancel button is clicked', () => {
    render(<Harness />)
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('closes when the close (X) icon is clicked', () => {
    render(<Harness />)
    fireEvent.click(screen.getByRole('button', { name: /close dialog/i }))
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('closes when Escape is pressed', () => {
    render(<Harness />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('closes when the overlay is clicked by default', () => {
    render(<Harness />)
    fireEvent.click(screen.getByTestId('confirm-dialog-overlay'))
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('does not close when clicking inside the dialog content', () => {
    render(<Harness />)
    fireEvent.click(screen.getByRole('alertdialog'))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('respects closeOnOverlayClick=false', () => {
    render(<Harness closeOnOverlayClick={false} />)
    fireEvent.click(screen.getByTestId('confirm-dialog-overlay'))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('does not close on overlay click while loading', () => {
    render(<Harness isLoading />)
    fireEvent.click(screen.getByTestId('confirm-dialog-overlay'))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })
})

describe('ConfirmDialog — confirm phrase gating', () => {
  it('disables confirm until the phrase matches', () => {
    const onConfirm = vi.fn()
    render(<Harness confirmPhrase="DELETE" onConfirm={onConfirm} />)

    const confirm = screen.getByRole('button', { name: /^confirm$/i })
    expect(confirm).toBeDisabled()

    const input = screen.getByLabelText(/type\s+delete\s+to confirm/i)
    fireEvent.change(input, { target: { value: 'delete' } })
    expect(confirm).toBeDisabled()

    fireEvent.change(input, { target: { value: 'DELETE' } })
    expect(confirm).not.toBeDisabled()
    fireEvent.click(confirm)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('trims surrounding whitespace when matching the phrase', () => {
    render(<Harness confirmPhrase="DELETE" />)
    const input = screen.getByLabelText(/type\s+delete\s+to confirm/i)
    fireEvent.change(input, { target: { value: '  DELETE  ' } })
    expect(screen.getByRole('button', { name: /^confirm$/i })).not.toBeDisabled()
  })

  it('clears the phrase input when the dialog re-opens', () => {
    function Re() {
      const [open, setOpen] = useState(true)
      return (
        <>
          <button onClick={() => setOpen((o) => !o)}>toggle</button>
          <ConfirmDialog
            isOpen={open}
            title="t"
            confirmPhrase="DELETE"
            onClose={() => setOpen(false)}
            onConfirm={() => {}}
          />
        </>
      )
    }
    render(<Re />)
    const input = screen.getByLabelText(/type\s+delete\s+to confirm/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'DELETE' } })
    expect(input.value).toBe('DELETE')

    // Close
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    // Re-open
    fireEvent.click(screen.getByRole('button', { name: /toggle/i }))
    const reopened = screen.getByLabelText(/type\s+delete\s+to confirm/i) as HTMLInputElement
    expect(reopened.value).toBe('')
  })
})

describe('ConfirmDialog — keyboard / focus management', () => {
  it('moves initial focus to the cancel button after opening', async () => {
    vi.useFakeTimers()
    render(<Harness />)
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /^cancel$/i }))
    vi.useRealTimers()
  })

  it('traps Tab forward at the last focusable element', () => {
    render(<Harness />)
    const confirm = screen.getByRole('button', { name: /^confirm$/i })
    const close = screen.getByRole('button', { name: /close dialog/i })
    confirm.focus()
    expect(document.activeElement).toBe(confirm)

    fireEvent.keyDown(window, { key: 'Tab' })
    expect(document.activeElement).toBe(close)
  })

  it('traps Shift+Tab backward at the first focusable element', () => {
    render(<Harness />)
    const close = screen.getByRole('button', { name: /close dialog/i })
    const confirm = screen.getByRole('button', { name: /^confirm$/i })
    close.focus()

    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(confirm)
  })

  it('Tab inside the trap does nothing extra in the middle of the chain', () => {
    render(<Harness />)
    const cancel = screen.getByRole('button', { name: /^cancel$/i })
    cancel.focus()

    // Tab in the middle should not be intercepted (preventDefault not called)
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    window.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
  })

  it('does not respond to keys other than Escape / Tab', () => {
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('restores focus to the previously focused element on close', () => {
    render(<Harness initialOpen={false} />)
    const opener = screen.getByRole('button', { name: /open/i })
    opener.focus()
    fireEvent.click(opener)
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(document.activeElement).toBe(opener)
  })

  it('Shift+Tab from outside the dialog wraps to the last focusable element', () => {
    render(<Harness />)
    // Move focus outside the dialog
    ;(document.body as HTMLElement).focus()
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /^confirm$/i }))
  })

  it('cleans up the keydown listener when closed (no further Escape work)', () => {
    const onClose = vi.fn()
    function ControlledDialog() {
      const [open, setOpen] = useState(true)
      return (
        <ConfirmDialog
          isOpen={open}
          title="t"
          onClose={() => {
            onClose()
            setOpen(false)
          }}
          onConfirm={() => {}}
        />
      )
    }
    render(<ControlledDialog />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)

    // Now closed; further Escape should not invoke onClose again
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
