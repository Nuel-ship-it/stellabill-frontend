# Landing Page CTA Hierarchy & Mobile Hero

Documents the CTA hierarchy used across the landing page (`Hero`, `CTACards`)
and the responsive rules that keep the hero from clipping on mobile.

Source files:
- [src/components/Landing/Hero.tsx](../src/components/Landing/Hero.tsx)
- [src/components/Landing/Hero.module.css](../src/components/Landing/Hero.module.css)
- [src/components/CTACard.tsx](../src/components/CTACard.tsx)
- [src/components/CTACards.tsx](../src/components/CTACards.tsx)

---

## Hierarchy

The landing page now has **one** primary CTA path the eye can follow on every
breakpoint:

| Slot | Location | Visual treatment | Destination |
|---|---|---|---|
| **Primary (hero)** | Hero, leftmost button | Teal gradient, dark text, arrow icon, lifted shadow | `/dashboard` (default; override via `primaryHref`) |
| **Secondary (hero)** | Hero, rightmost button | Transparent background, teal hairline border, light text | `#pricing` (default; override via `secondaryHref`) |
| **Primary (cards)** | First card, "Become a Merchant" | Teal-tinted card surface + gradient button + "Recommended" pill | `/dashboard` |
| **Secondary (cards)** | Remaining cards | Subtle glass surface + white button | `#pricing`, `#docs`, `#contact` |

There is **at most one primary card** in the CTA grid — additional primaries
would dilute the recommendation. The same destination (`/dashboard`) is used
by both the hero primary and the primary card so the user always lands in the
same place regardless of which surface they click.

### Why the secondary hero CTA changed

The previous secondary CTA was solid white on a dark hero, which made it
visually *louder* than the gradient primary — the opposite of what hierarchy
demands. It is now a transparent / outlined treatment, so the gradient
primary clearly wins focus.

---

## Mobile hero (no clip, no overflow)

The hero now scales fluidly, so neither the headline nor the buttons can clip
on narrow viewports.

**Fluid typography (`clamp()`):**

| Element | Min | Pref | Max |
|---|---|---|---|
| `.headline` | `2.25rem` | `8vw` | `6rem` |
| `.subtitle` | `1rem` | `2.4vw` | `1.5rem` |
| `.tag` | `0.75rem` | `2vw` | `0.875rem` |
| `.primaryCta` / `.secondaryCta` font | `0.9375rem` | `1.6vw` | `1rem` |
| Section padding | `clamp(3rem, 6vw, 4rem) clamp(1rem, 4vw, 2rem)` | | |

**Word-safety on the headline:**

```css
.headline {
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  max-width: 18ch;
}
```

This guarantees long compound words (e.g., "Subscriptions") cannot overflow
the section on a 320 px viewport.

**Breakpoints:**

| Breakpoint | What changes |
|---|---|
| `≤ 1024px` | Hero `min-height` drops to `auto` so short landscape phones don't pad empty space and push CTAs off-screen. |
| `≤ 768px` | CTA container becomes vertical, buttons go full-width, capped at `22rem`. The eyebrow tag wraps instead of ellipsizing. |
| `≤ 380px` | Hero horizontal padding shrinks to `1rem`; CTA container `max-width` becomes `100%` so the buttons consume the available width. |

**Touch targets:** both hero CTAs and every card CTA use `min-height: 48px`
to clear the WCAG 2.5.5 (Target Size) recommendation.

---

## Accessibility

### Hero

- The `<section>` is labelled by the `<h1>` via `aria-labelledby="hero-headline"`.
- The CTA pair sits in `role="group" aria-label="Primary calls to action"` so
  screen readers can announce them as a unit.
- All decorative SVGs (eyebrow, arrow) are `aria-hidden="true"` and
  `focusable="false"`.
- Keyboard focus on the CTAs gets a visible `outline: 2px solid #0debd5;
  outline-offset: 3px`.
- `prefers-reduced-motion: reduce` removes the floating-particle DOM nodes
  entirely (no animation, no GPU work) and disables button transitions /
  hover lift.

### CTA Cards

- Each card is an `<article>` so screen readers can navigate the grid by
  landmark.
- Cards use a single interactive control — either an `<a>` (when `href` is
  given) or a `<button type="button">`. The previous version nested a
  `<button>` inside an `<a>`, which is invalid HTML and double-focuses with
  the keyboard. **Fixed.**
- Each control's accessible name disambiguates which card it belongs to:
  `"Get started: Become a Merchant"`, `"See pricing plans: View Pricing"`,
  etc. This matters when the user navigates by landmarks/links list.
- The grid section has an `aria-labelledby` heading ("Ways to get started")
  that is visually hidden but available to assistive tech.

---

## Responsive grid (CTA cards)

The card grid uses CSS grid with explicit column counts at each breakpoint:

| Breakpoint | Columns |
|---|---|
| `≥ 1024px` | 4 |
| `768px – 1023px` | 2 |
| `≤ 767px` | 1 |

Section padding is fluid (`clamp(2rem, 6vw, 4rem) clamp(1rem, 4vw, 1.5rem)`)
so the cards stay edge-safe on any viewport.

---

## Testing

| File | Coverage |
|---|---|
| [src/components/Landing/Hero.test.tsx](../src/components/Landing/Hero.test.tsx) | rendering, semantics, links, default + override hrefs, click handlers, group labelling, reduced-motion (initial + change + missing-matchMedia fallback) |
| [src/components/CTACard.test.tsx](../src/components/CTACard.test.tsx) | link vs button mode, no-nested-button HTML guarantee, primary vs secondary variant, accessible name disambiguation, click handler, `preventDefault` only when no href |
| [src/components/CTACards.test.tsx](../src/components/CTACards.test.tsx) | section labelling, exactly-one primary card, primary card placement, all destinations |

```bash
npm test -- src/components/CTACard.test.tsx src/components/CTACards.test.tsx src/components/Landing/Hero.test.tsx
```

Coverage target: **≥ 95%** — actual: **100%** statements / branches /
functions / lines on all three components.

---

## Mobile screenshots

Manual verification (per the issue's "include mobile screenshots in PR notes"
ask) is the responsibility of the PR author — the test suite cannot capture
visual regressions. Recommended viewports to verify before merging:

- **iPhone SE (375 × 667)** — narrowest mainstream phone; verifies headline
  wraps and CTAs stack without clipping.
- **iPhone 14 Pro (393 × 852)** — verifies vertical rhythm.
- **Pixel 7 (412 × 915)** — verifies CTA touch targets and tag pill.
- **iPad Mini (768 × 1024)** — verifies the 2-column CTA card grid kicks in.

For each, capture (a) the hero with CTAs in frame, and (b) the CTA cards
section.
