import { useEffect, useId, useRef, useState, ReactNode, MouseEvent } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import './ConfirmDialog.css'

export interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description?: ReactNode
  consequences?: string[]
  confirmLabel?: string
  cancelLabel?: string
  loadingLabel?: string
  isLoading?: boolean
  destructive?: boolean
  confirmPhrase?: string
  closeOnOverlayClick?: boolean
  onConfirm: () => void
  onClose: () => void
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  consequences,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loadingLabel,
  isLoading = false,
  destructive = true,
  confirmPhrase,
  closeOnOverlayClick = true,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const [phraseInput, setPhraseInput] = useState('')
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!isOpen) {
      setPhraseInput('')
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
        previousFocusRef.current = null
      }
      return
    }

    previousFocusRef.current = document.activeElement as HTMLElement
    const timer = window.setTimeout(() => {
      const cancelBtn = dialogRef.current?.querySelector<HTMLButtonElement>(
        '[data-confirm-dialog-initial-focus]'
      )
      cancelBtn?.focus()
    }, 30)
    return () => window.clearTimeout(timer)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key !== 'Tab') return

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      if (!focusable || focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (e.shiftKey && (active === first || !dialogRef.current?.contains(active))) {
        last.focus()
        e.preventDefault()
      } else if (!e.shiftKey && active === last) {
        first.focus()
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const phraseRequired = Boolean(confirmPhrase && confirmPhrase.length > 0)
  const phraseSatisfied = !phraseRequired || phraseInput.trim() === confirmPhrase
  const confirmDisabled = isLoading || !phraseSatisfied

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!closeOnOverlayClick || isLoading) return
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="confirm-dialog-overlay"
      onClick={handleOverlayClick}
      data-testid="confirm-dialog-overlay"
    >
      <div
        ref={dialogRef}
        className={`confirm-dialog${destructive ? ' confirm-dialog--destructive' : ''}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
      >
        <div className="confirm-dialog__header">
          {destructive && (
            <div className="confirm-dialog__icon" aria-hidden="true">
              <AlertTriangle size={20} />
            </div>
          )}
          <h2 id={titleId} className="confirm-dialog__title">
            {title}
          </h2>
          <button
            type="button"
            className="confirm-dialog__close"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="confirm-dialog__body">
          {description && (
            <p id={descriptionId} className="confirm-dialog__description">
              {description}
            </p>
          )}

          {consequences && consequences.length > 0 && (
            <ul className="confirm-dialog__consequences" aria-label="Consequences">
              {consequences.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          )}

          {phraseRequired && (
            <div className="confirm-dialog__confirm-prompt">
              <label
                htmlFor={`${titleId}-phrase`}
                className="confirm-dialog__confirm-prompt-label"
              >
                Type <strong>{confirmPhrase}</strong> to confirm
              </label>
              <input
                id={`${titleId}-phrase`}
                type="text"
                value={phraseInput}
                onChange={(e) => setPhraseInput(e.target.value)}
                disabled={isLoading}
                className="confirm-dialog__confirm-prompt-input"
                placeholder={confirmPhrase}
                autoComplete="off"
                aria-required="true"
              />
            </div>
          )}
        </div>

        <div className="confirm-dialog__footer">
          <button
            type="button"
            className="confirm-dialog__btn confirm-dialog__btn--cancel"
            onClick={onClose}
            disabled={isLoading}
            data-confirm-dialog-initial-focus
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="confirm-dialog__btn confirm-dialog__btn--confirm"
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            {isLoading ? loadingLabel ?? `${confirmLabel}...` : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
