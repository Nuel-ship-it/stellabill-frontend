import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Amount from './Amount'

describe('Amount — rendering', () => {
  it('renders number and currency by default', () => {
    render(<Amount value={1234.5} data-testid="amt" />)
    const el = screen.getByTestId('amt')
    expect(el).toHaveTextContent('1,234.50')
    expect(el).toHaveTextContent('USDC')
  })

  it('uses an aria-label that reads cleanly to screen readers', () => {
    render(<Amount value={1234.5} data-testid="amt" />)
    expect(screen.getByTestId('amt')).toHaveAttribute('aria-label', '1,234.50 USDC')
  })

  it('treats the inner spans as decorative (aria-hidden)', () => {
    const { container } = render(<Amount value={10} />)
    const inner = container.querySelectorAll('span span')
    inner.forEach((node) => expect(node).toHaveAttribute('aria-hidden', 'true'))
  })

  it('omits the currency code when showCode=false', () => {
    render(<Amount value={10} showCode={false} data-testid="amt" />)
    const el = screen.getByTestId('amt')
    expect(el).toHaveTextContent('10.00')
    expect(el).not.toHaveTextContent('USDC')
  })

  it('passes the rounding option through to the formatter', () => {
    render(<Amount value={1.005} rounding="down" data-testid="amt" />)
    expect(screen.getByTestId('amt')).toHaveTextContent('1.00')
  })

  it('passes precision and minPrecision through to the formatter', () => {
    render(
      <Amount value={10} precision={4} minPrecision={0} data-testid="amt" />
    )
    expect(screen.getByTestId('amt')).toHaveTextContent('10')
  })

  it('forwards a custom currency code', () => {
    render(<Amount value={1} currency="XLM" data-testid="amt" />)
    const el = screen.getByTestId('amt')
    expect(el).toHaveTextContent('XLM')
    expect(el).toHaveAttribute('aria-label', '1.00 XLM')
  })

  it('exposes the sign via data-amount-sign', () => {
    render(
      <>
        <Amount value={10} data-testid="pos" />
        <Amount value={-5} data-testid="neg" />
        <Amount value={0} data-testid="zero" />
        <Amount value={10} signDisplay="always" data-testid="signed-pos" />
      </>
    )
    expect(screen.getByTestId('pos')).toHaveAttribute('data-amount-sign', 'positive')
    expect(screen.getByTestId('neg')).toHaveAttribute('data-amount-sign', '-')
    expect(screen.getByTestId('zero')).toHaveAttribute('data-amount-sign', 'positive')
    expect(screen.getByTestId('signed-pos')).toHaveAttribute('data-amount-sign', '+')
  })

  it('marks zero values with data-amount-zero', () => {
    render(<Amount value={0} data-testid="z" />)
    expect(screen.getByTestId('z')).toHaveAttribute('data-amount-zero', 'true')
  })

  it('does not mark non-zero values with data-amount-zero', () => {
    render(<Amount value={10} data-testid="nz" />)
    expect(screen.getByTestId('nz')).not.toHaveAttribute('data-amount-zero')
  })

  it('forwards className props to the right elements', () => {
    const { container } = render(
      <Amount
        value={10}
        className="root"
        numberClassName="num"
        codeClassName="code"
        data-testid="amt"
      />
    )
    expect(screen.getByTestId('amt')).toHaveClass('root')
    expect(container.querySelector('.num')).toHaveTextContent('10.00')
    expect(container.querySelector('.code')).toHaveTextContent('USDC')
  })
})

describe('Amount — missing values', () => {
  it.each([null, undefined, '', 'abc'])(
    'renders the placeholder when value is %p',
    (input) => {
      render(<Amount value={input} data-testid="amt" />)
      const el = screen.getByTestId('amt')
      expect(el).toHaveTextContent('—')
      expect(el).toHaveAttribute('data-amount-missing', 'true')
      expect(el).toHaveAttribute('aria-label', 'No USDC amount')
    }
  )

  it('honors a custom placeholder node', () => {
    render(<Amount value={null} placeholder="N/A" data-testid="amt" />)
    expect(screen.getByTestId('amt')).toHaveTextContent('N/A')
  })

  it('still respects a custom currency in the missing aria-label', () => {
    render(<Amount value={null} currency="XLM" data-testid="amt" />)
    expect(screen.getByTestId('amt')).toHaveAttribute('aria-label', 'No XLM amount')
  })
})

describe('Amount — overrides', () => {
  it('lets the caller override the aria-label entirely', () => {
    render(
      <Amount value={10} ariaLabel="Total due, ten USDC" data-testid="amt" />
    )
    expect(screen.getByTestId('amt')).toHaveAttribute('aria-label', 'Total due, ten USDC')
  })

  it('lets the caller change the host element', () => {
    render(<Amount value={10} as="output" data-testid="amt" />)
    expect(screen.getByTestId('amt').tagName.toLowerCase()).toBe('output')
  })
})

describe('Amount — string inputs', () => {
  it('accepts a numeric string', () => {
    render(<Amount value="1234.5" data-testid="amt" />)
    expect(screen.getByTestId('amt')).toHaveTextContent('1,234.50')
  })

  it('accepts a string with trailing currency code', () => {
    render(<Amount value="10 USDC" data-testid="amt" />)
    const el = screen.getByTestId('amt')
    expect(el).toHaveTextContent('10.00')
    expect(el).toHaveTextContent('USDC')
  })
})
