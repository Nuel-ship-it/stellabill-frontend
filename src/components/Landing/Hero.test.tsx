import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import Hero from './Hero'

type MQListener = (e: { matches: boolean }) => void

interface MQMock {
  matches: boolean
  media: string
  onchange: null
  addListener: ReturnType<typeof vi.fn>
  removeListener: ReturnType<typeof vi.fn>
  addEventListener: ReturnType<typeof vi.fn>
  removeEventListener: ReturnType<typeof vi.fn>
  dispatchEvent: ReturnType<typeof vi.fn>
  _listeners: MQListener[]
  _emit: (matches: boolean) => void
}

const installMatchMedia = (initialMatches = false) => {
  const mq: MQMock = {
    matches: initialMatches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    _listeners: [],
    _emit(matches: boolean) {
      this.matches = matches
      this._listeners.forEach((fn) => fn({ matches }))
    },
  }
  mq.addEventListener.mockImplementation((_event: string, fn: MQListener) => {
    mq._listeners.push(fn)
  })
  mq.removeEventListener.mockImplementation((_event: string, fn: MQListener) => {
    mq._listeners = mq._listeners.filter((l) => l !== fn)
  })
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockReturnValue(mq),
  })
  return mq
}

describe('Hero', () => {
  beforeEach(() => {
    installMatchMedia(false)
  })

  it('renders the headline and subtitle', () => {
    render(<Hero />)
    const headline = screen.getByRole('heading', { level: 1 })
    expect(headline).toHaveTextContent(/recurring usdc billing for the/i)
    expect(headline).toHaveTextContent(/stellar ecosystem/i)
    expect(
      screen.getByText(/infrastructure-grade subscription billing/i)
    ).toBeInTheDocument()
  })

  it('exposes the section as a labelled region', () => {
    const { container } = render(<Hero />)
    const section = container.querySelector('section')
    expect(section).toHaveAttribute('aria-labelledby', 'hero-headline')
    expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute('id', 'hero-headline')
  })

  it('renders the eyebrow tag', () => {
    render(<Hero />)
    expect(screen.getByText(/built on soroban smart contracts/i)).toBeInTheDocument()
  })

  it('renders the primary and secondary CTAs as links with correct hierarchy', () => {
    render(<Hero />)
    const primary = screen.getByTestId('hero-primary-cta')
    const secondary = screen.getByTestId('hero-secondary-cta')

    expect(primary.tagName.toLowerCase()).toBe('a')
    expect(secondary.tagName.toLowerCase()).toBe('a')
    expect(primary).toHaveTextContent(/start accepting subscriptions/i)
    expect(secondary).toHaveTextContent(/view pricing/i)
  })

  it('uses default destinations when none are provided', () => {
    render(<Hero />)
    expect(screen.getByTestId('hero-primary-cta')).toHaveAttribute('href', '/dashboard')
    expect(screen.getByTestId('hero-secondary-cta')).toHaveAttribute('href', '#pricing')
  })

  it('honours custom href props for both CTAs', () => {
    render(<Hero primaryHref="/signup" secondaryHref="/pricing" />)
    expect(screen.getByTestId('hero-primary-cta')).toHaveAttribute('href', '/signup')
    expect(screen.getByTestId('hero-secondary-cta')).toHaveAttribute('href', '/pricing')
  })

  it('fires onPrimaryClick / onSecondaryClick when CTAs are clicked', () => {
    const onPrimaryClick = vi.fn()
    const onSecondaryClick = vi.fn()
    render(<Hero onPrimaryClick={onPrimaryClick} onSecondaryClick={onSecondaryClick} />)

    fireEvent.click(screen.getByTestId('hero-primary-cta'))
    fireEvent.click(screen.getByTestId('hero-secondary-cta'))
    expect(onPrimaryClick).toHaveBeenCalledTimes(1)
    expect(onSecondaryClick).toHaveBeenCalledTimes(1)
  })

  it('groups CTAs in a labelled group for screen readers', () => {
    render(<Hero />)
    const group = screen.getByRole('group', { name: /primary calls to action/i })
    expect(group).toBeInTheDocument()
    expect(group.querySelectorAll('a')).toHaveLength(2)
  })

  it('renders decorative icons as aria-hidden', () => {
    const { container } = render(<Hero />)
    const decorativeSvgs = container.querySelectorAll('svg[aria-hidden="true"]')
    expect(decorativeSvgs.length).toBeGreaterThanOrEqual(2)
  })

  it('renders particles by default when motion is allowed', () => {
    const { container } = render(<Hero />)
    const particles = container.querySelectorAll('[class*="particle"]')
    // Container plus 20 particles
    expect(particles.length).toBeGreaterThan(1)
  })

  it('omits particles when prefers-reduced-motion is set', () => {
    installMatchMedia(true)
    const { container } = render(<Hero />)
    const particlesContainer = container.querySelector('[class*="particles"]')
    expect(particlesContainer).toBeNull()
  })

  it('reacts to prefers-reduced-motion changes', () => {
    const mq = installMatchMedia(false)
    const { container } = render(<Hero />)
    expect(container.querySelector('[class*="particles"]')).not.toBeNull()
    act(() => {
      mq._emit(true)
    })
    expect(container.querySelector('[class*="particles"]')).toBeNull()
  })

  it('does not throw when matchMedia is unavailable', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: undefined,
    })
    expect(() => render(<Hero />)).not.toThrow()
  })
})
