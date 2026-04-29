import { ReactNode } from 'react'

export type CTACardVariant = 'primary' | 'secondary'

interface CTACardProps {
  icon: ReactNode
  title: string
  description: string
  buttonLabel: string
  href?: string
  onClick?: () => void
  variant?: CTACardVariant
}

const cardBaseStyle = (variant: CTACardVariant): React.CSSProperties => ({
  background:
    variant === 'primary'
      ? 'linear-gradient(180deg, rgba(34, 211, 238, 0.10) 0%, rgba(34, 211, 238, 0.03) 100%)'
      : 'rgba(255, 255, 255, 0.03)',
  borderRadius: '16px',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  border:
    variant === 'primary'
      ? '1px solid rgba(34, 211, 238, 0.45)'
      : '1px solid rgba(34, 211, 238, 0.15)',
  boxShadow:
    variant === 'primary'
      ? '0 0 36px rgba(34, 211, 238, 0.25)'
      : '0 0 20px rgba(34, 211, 238, 0.08)',
  transition: 'all 0.3s ease',
  textAlign: 'left',
  position: 'relative',
})

const buttonStyle = (variant: CTACardVariant): React.CSSProperties => ({
  background:
    variant === 'primary'
      ? 'linear-gradient(90deg, #0debd5 0%, #0891b2 100%)'
      : '#ffffff',
  color: variant === 'primary' ? '#02161a' : '#000000',
  border: 'none',
  borderRadius: '10px',
  padding: '0.75rem 1.5rem',
  fontSize: '0.9375rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  transition: 'all 0.2s ease',
  width: '100%',
  justifyContent: 'center',
  minHeight: '48px',
  textDecoration: 'none',
  fontFamily: 'inherit',
})

export default function CTACard({
  icon,
  title,
  description,
  buttonLabel,
  href,
  onClick,
  variant = 'secondary',
}: CTACardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (!onClick) return
    if (!href) e.preventDefault()
    onClick()
  }

  const iconCircle = (
    <div
      style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background:
          variant === 'primary'
            ? 'rgba(13, 235, 213, 0.15)'
            : 'rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        boxShadow:
          variant === 'primary'
            ? '0 0 36px rgba(13, 235, 213, 0.6), 0 0 70px rgba(34, 211, 238, 0.3)'
            : '0 0 30px rgba(34, 211, 238, 0.5), 0 0 60px rgba(34, 211, 238, 0.25)',
        transition: 'box-shadow 0.3s ease',
        color: '#ffffff',
      }}
      className="cta-icon-circle"
      aria-hidden="true"
    >
      {icon}
    </div>
  )

  const titleEl = (
    <h3
      style={{
        color: '#ffffff',
        fontSize: 'clamp(1.125rem, 2.4vw, 1.25rem)',
        fontWeight: 700,
        marginBottom: '0.75rem',
        lineHeight: 1.3,
      }}
    >
      {title}
    </h3>
  )

  const descEl = (
    <p
      style={{
        color: '#94a3b8',
        fontSize: '0.9375rem',
        lineHeight: 1.6,
        marginBottom: '1.5rem',
        flex: 1,
      }}
    >
      {description}
    </p>
  )

  const arrow = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )

  const card = (
    <article style={cardBaseStyle(variant)} className="cta-card" data-variant={variant}>
      {variant === 'primary' && (
        <span
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            background: 'linear-gradient(90deg, #0debd5 0%, #0891b2 100%)',
            color: '#02161a',
            padding: '0.125rem 0.5rem',
            borderRadius: '999px',
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Recommended
        </span>
      )}
      {iconCircle}
      {titleEl}
      {descEl}

      {href ? (
        <a
          href={href}
          onClick={handleClick}
          style={buttonStyle(variant)}
          className="cta-button"
          aria-label={`${buttonLabel}: ${title}`}
        >
          <span>{buttonLabel}</span>
          {arrow}
        </a>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          style={buttonStyle(variant)}
          className="cta-button"
          aria-label={`${buttonLabel}: ${title}`}
        >
          <span>{buttonLabel}</span>
          {arrow}
        </button>
      )}

      <style>{`
        .cta-card:hover {
          border-color: rgba(34, 211, 238, 0.35);
          box-shadow: 0 0 30px rgba(34, 211, 238, 0.18);
          transform: translateY(-2px);
        }

        .cta-card[data-variant="primary"]:hover {
          border-color: rgba(34, 211, 238, 0.7);
          box-shadow: 0 0 44px rgba(34, 211, 238, 0.32);
        }

        .cta-card:hover .cta-icon-circle {
          box-shadow: 0 0 40px rgba(34, 211, 238, 0.7), 0 0 80px rgba(34, 211, 238, 0.35);
        }

        .cta-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .cta-button:active {
          transform: translateY(0);
        }

        .cta-button:focus-visible {
          outline: 2px solid #0debd5;
          outline-offset: 3px;
        }

        @media (prefers-reduced-motion: reduce) {
          .cta-card,
          .cta-button,
          .cta-icon-circle {
            transition: none;
          }
          .cta-card:hover,
          .cta-button:hover {
            transform: none;
          }
        }
      `}</style>
    </article>
  )

  return card
}
