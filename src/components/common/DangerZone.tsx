import { ReactNode, useId } from 'react'
import { AlertTriangle } from 'lucide-react'
import './DangerZone.css'

export interface DangerZoneItemProps {
  title: string
  description: ReactNode
  actionLabel: string
  onAction: () => void
  actionIcon?: ReactNode
  disabled?: boolean
  /** Optional override for the accessible name of the action button. */
  actionAriaLabel?: string
}

export function DangerZoneItem({
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  disabled = false,
  actionAriaLabel,
}: DangerZoneItemProps) {
  const titleId = useId()
  const descId = useId()
  return (
    <div className="danger-zone__item" role="group" aria-labelledby={titleId}>
      <div className="danger-zone__item-text">
        <h4 id={titleId} className="danger-zone__item-title">
          {title}
        </h4>
        <p id={descId} className="danger-zone__item-description">
          {description}
        </p>
      </div>
      <button
        type="button"
        className="danger-zone__action"
        onClick={onAction}
        disabled={disabled}
        aria-label={actionAriaLabel ?? `${actionLabel}: ${title}`}
        aria-describedby={descId}
      >
        {actionIcon}
        <span>{actionLabel}</span>
      </button>
    </div>
  )
}

export interface DangerZoneProps {
  title?: string
  description?: ReactNode
  children: ReactNode
  className?: string
}

export default function DangerZone({
  title = 'Danger Zone',
  description,
  children,
  className,
}: DangerZoneProps) {
  const headingId = useId()
  return (
    <section
      className={`danger-zone${className ? ` ${className}` : ''}`}
      aria-labelledby={headingId}
      data-testid="danger-zone"
    >
      <header className="danger-zone__header">
        <AlertTriangle size={18} aria-hidden="true" color="#ef4444" />
        <h3 id={headingId} className="danger-zone__title">
          {title}
        </h3>
      </header>
      {description && <p className="danger-zone__intro">{description}</p>}
      <div className="danger-zone__items">{children}</div>
    </section>
  )
}
