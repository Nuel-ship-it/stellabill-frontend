import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import DangerZone, { DangerZoneItem } from './DangerZone'

describe('DangerZone', () => {
  it('renders default heading and is labelled by it', () => {
    render(
      <DangerZone>
        <DangerZoneItem
          title="Delete X"
          description="Removes X forever"
          actionLabel="Delete"
          onAction={() => {}}
        />
      </DangerZone>
    )

    const region = screen.getByTestId('danger-zone')
    expect(region.tagName.toLowerCase()).toBe('section')
    const heading = screen.getByRole('heading', { name: /danger zone/i })
    expect(heading).toBeInTheDocument()
    expect(region).toHaveAttribute('aria-labelledby', heading.id)
  })

  it('renders a custom title and intro description when provided', () => {
    render(
      <DangerZone title="Critical Actions" description="Read carefully.">
        <DangerZoneItem
          title="Delete X"
          description="Removes X forever"
          actionLabel="Delete"
          onAction={() => {}}
        />
      </DangerZone>
    )

    expect(screen.getByRole('heading', { name: /critical actions/i })).toBeInTheDocument()
    expect(screen.getByText('Read carefully.')).toBeInTheDocument()
  })

  it('omits the intro paragraph when no description is supplied', () => {
    const { container } = render(
      <DangerZone>
        <DangerZoneItem
          title="Delete X"
          description="Removes X forever"
          actionLabel="Delete"
          onAction={() => {}}
        />
      </DangerZone>
    )
    expect(container.querySelector('.danger-zone__intro')).toBeNull()
  })

  it('forwards a custom className', () => {
    render(
      <DangerZone className="extra-class">
        <DangerZoneItem
          title="Delete X"
          description="Removes X forever"
          actionLabel="Delete"
          onAction={() => {}}
        />
      </DangerZone>
    )
    expect(screen.getByTestId('danger-zone')).toHaveClass('danger-zone', 'extra-class')
  })

  it('renders multiple items each with their own group + accessible name', () => {
    render(
      <DangerZone>
        <DangerZoneItem
          title="Delete account"
          description="Deletes your account"
          actionLabel="Delete"
          onAction={() => {}}
        />
        <DangerZoneItem
          title="Wipe data"
          description="Erases all data"
          actionLabel="Wipe"
          onAction={() => {}}
        />
      </DangerZone>
    )

    const groups = screen.getAllByRole('group')
    expect(groups).toHaveLength(2)
    expect(within(groups[0]).getByRole('heading', { name: /delete account/i })).toBeInTheDocument()
    expect(within(groups[1]).getByRole('heading', { name: /wipe data/i })).toBeInTheDocument()
  })
})

describe('DangerZoneItem', () => {
  it('fires onAction when the button is clicked', () => {
    const onAction = vi.fn()
    render(
      <DangerZone>
        <DangerZoneItem
          title="Delete X"
          description="Removes X forever"
          actionLabel="Delete"
          onAction={onAction}
        />
      </DangerZone>
    )

    fireEvent.click(screen.getByRole('button', { name: /delete: delete x/i }))
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('respects the disabled prop and does not fire onAction', () => {
    const onAction = vi.fn()
    render(
      <DangerZone>
        <DangerZoneItem
          title="Delete X"
          description="Removes X forever"
          actionLabel="Delete"
          onAction={onAction}
          disabled
        />
      </DangerZone>
    )

    const button = screen.getByRole('button', { name: /delete: delete x/i })
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(onAction).not.toHaveBeenCalled()
  })

  it('uses actionAriaLabel override when provided', () => {
    render(
      <DangerZone>
        <DangerZoneItem
          title="Delete X"
          description="Removes X forever"
          actionLabel="Delete"
          actionAriaLabel="Permanently delete X"
          onAction={() => {}}
        />
      </DangerZone>
    )
    expect(screen.getByRole('button', { name: /permanently delete x/i })).toBeInTheDocument()
  })

  it('renders a leading icon node when provided', () => {
    render(
      <DangerZone>
        <DangerZoneItem
          title="Delete X"
          description="Removes X forever"
          actionLabel="Delete"
          onAction={() => {}}
          actionIcon={<svg data-testid="action-icon" />}
        />
      </DangerZone>
    )
    expect(screen.getByTestId('action-icon')).toBeInTheDocument()
  })

  it('associates the action button with its description for screen readers', () => {
    render(
      <DangerZone>
        <DangerZoneItem
          title="Delete X"
          description="Removes X forever"
          actionLabel="Delete"
          onAction={() => {}}
        />
      </DangerZone>
    )

    const button = screen.getByRole('button', { name: /delete: delete x/i })
    const describedById = button.getAttribute('aria-describedby')
    expect(describedById).toBeTruthy()
    expect(document.getElementById(describedById!)).toHaveTextContent('Removes X forever')
  })
})
