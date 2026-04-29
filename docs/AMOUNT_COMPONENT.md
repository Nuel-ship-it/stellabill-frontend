# Amount Component & Currency Formatting

A single source of truth for displaying USDC (and other) amounts across
Stellabill. Two pieces:

1. **`formatAmount`** — pure utility in [src/utils/amount.ts](../src/utils/amount.ts).
   Use it whenever you need a string for an `aria-label`, a placeholder, an
   email/PDF, a chart tooltip — anywhere a JSX component is overkill.
2. **`<Amount />`** — React component in [src/components/common/Amount.tsx](../src/components/common/Amount.tsx).
   Use it for in-page rendering. It handles markup, accessibility, and
   styling hooks for you.

---

## Why this exists

Before this module landed, amounts in the codebase were formatted ad-hoc:

- `"10 USDC"` (string literal in mock data — needs parsing on every read)
- `value.toFixed(2)` (no grouping, no locale, surprising rounding around `1.005`)
- `${balance} USDC` (no decimal alignment, no missing-value handling)
- `toLocaleString()` (defaults to the *browser* locale, not ours)

That meant the same balance could render as `30 USDC`, `30.00 USDC`,
`30.0 USDC`, or `30,00 USDC` depending on the user's machine. It also meant
**screen readers heard "thirty U S D C"** in some places and **"thirty
dollar sign U S D C"** in others.

Now every amount goes through one path with one set of rules.

---

## `<Amount />`

### Quick examples

```tsx
import Amount from '@/components/common/Amount'

<Amount value={1234.5} />                  // "1,234.50 USDC"
<Amount value={0.005} />                   // "0.01 USDC"   (half-up)
<Amount value="10 USDC" />                 // "10.00 USDC"
<Amount value={null} />                    // "—"           (placeholder, aria-label="No USDC amount")

<Amount value={1500000} compact precision={1} minPrecision={0} />
//                                          // "1.5M USDC"

<Amount value={-50} signDisplay="always" /> // "-50.00 USDC"  (data-amount-sign="-")
<Amount value={50}  signDisplay="always" /> // "+50.00 USDC"  (data-amount-sign="+")

<Amount value={0.123456789} precision={6} currency="XLM" />
//                                          // "0.123457 XLM"
```

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number \| string \| null \| undefined` | — | The amount. Strings like `"10"` or `"10 USDC"` are parsed. `null` / `undefined` / `NaN` / non-numeric strings render the placeholder. |
| `precision` | `number` | `2` | Maximum fraction digits. Must be a non-negative integer. |
| `minPrecision` | `number` | `precision` | Minimum fraction digits. Set lower than `precision` to drop trailing zeros. |
| `rounding` | `'half-up' \| 'half-even' \| 'down' \| 'up'` | `'half-up'` | Rounding strategy. See [§ Rounding rules](#rounding-rules). |
| `compact` | `boolean` | `false` | Use compact notation (`1.2K`, `3.4M`). |
| `signDisplay` | `'auto' \| 'always' \| 'never' \| 'except-zero'` | `'auto'` | Sign-display rule. `'auto'` shows only `-`. |
| `locale` | `string` | `'en-US'` | BCP-47 locale for grouping/decimal separator. Falls back to `en-US` on parse error. |
| `currency` | `string` | `'USDC'` | Currency code label. |
| `showCode` | `boolean` | `true` | Render the trailing currency code. Set false to display the number alone. |
| `placeholder` | `ReactNode` | `'—'` | Rendered when the value is missing. |
| `ariaLabel` | `string` | computed | Override the screen-reader label entirely. |
| `as` | `ElementType` | `'span'` | Override the host element (e.g. `'output'`, `'strong'`). |
| `className` | `string` | — | Class for the root element. |
| `numberClassName` | `string` | — | Class for the number portion. |
| `codeClassName` | `string` | — | Class for the currency code portion. |
| `data-testid` | `string` | — | Forwarded to the root element. |

### Markup

```html
<span aria-label="1,234.50 USDC" data-amount-sign="positive">
  <span aria-hidden="true">1,234.50</span>
  <span aria-hidden="true">USDC</span>
</span>
```

The inner spans are `aria-hidden` because the `aria-label` already contains
both the number and the currency in a screen-reader-friendly form (so the
reader doesn't double-announce the value). For a missing value:

```html
<span aria-label="No USDC amount" data-amount-missing="true">—</span>
```

### Data attributes (for tests / styling hooks)

| Attribute | Values | Notes |
|---|---|---|
| `data-amount-sign` | `'positive'`, `'-'`, `'+'` | `'positive'` covers zero and unsigned positives. |
| `data-amount-zero` | `'true'` (omitted otherwise) | Set when the displayed value is exactly zero after rounding. |
| `data-amount-missing` | `'true'` (omitted otherwise) | Set when the placeholder is rendered. |

These are intentionally kebab-cased and stable so QA / Playwright tests can
assert on them without brittle text matching.

---

## `formatAmount(value, options)`

Returns a structured result that mirrors the `<Amount />` component:

```ts
{
  number: '1,234.50',
  currency: 'USDC',
  sign: '',                       // '' | '+' | '-'
  isNegative: false,
  isZero: false,
  isMissing: false,
  ariaLabel: '1,234.50 USDC',
  display: '1,234.50 USDC',       // sign + number + ' ' + currency
}
```

Use this when you need a string only — e.g. building `aria-label` for a
progress bar, populating an email body, or summarizing in a `console.log`.

```ts
import { formatAmount } from '@/utils/amount'

const total = formatAmount(due).display     // "10.00 USDC"
const aria  = formatAmount(due).ariaLabel   // "10.00 USDC"
```

### `coerceAmount(value)`

Returns the underlying finite number, or `null` if the input is missing /
invalid. Strips a trailing currency code from strings, so `"10 USDC"` parses
to `10`.

### `roundAmount(value, precision, mode)`

The internal rounding primitive. Exported so tests (and any specialized math
code) can use the same logic without going through `Intl.NumberFormat`.

---

## Rounding rules

Default mode is **half-up away from zero** — the rule users expect for
currency.

| Input | `'half-up'` | `'half-even'` | `'down'` | `'up'` |
|---|---|---|---|---|
| `0.125` | `0.13` | `0.12` | `0.12` | `0.13` |
| `0.135` | `0.14` | `0.14` | `0.13` | `0.14` |
| `1.005` | `1.01` | `1.00` | `1.00` | `1.01` |
| `-0.5`  (precision=0) | `-1` | `0` | `0` | `-1` |

Implementation note: naive `value * 10**precision` is broken because
`1.005 * 100 === 100.49999999999999`, which produces `1.00` instead of
`1.01` under half-up. We instead shift via exponential notation
(`Number(\`${n}e${precision}\`)`), which uses the runtime's
shortest-round-trip decimal representation and avoids the surprise. For
very small magnitudes that would otherwise serialize in scientific form
(`(0.0000005).toString() === '5e-7'`), we fall back to `toFixed(100)` to get
a plain-decimal string before shifting.

---

## Edge cases handled

| Scenario | Behavior |
|---|---|
| `null` / `undefined` | `isMissing: true`, placeholder rendered. |
| Empty string / whitespace | `isMissing: true`. |
| `NaN`, `Infinity`, `-Infinity` | `isMissing: true`. |
| Non-numeric string (e.g. `"abc"`, `"1.2.3"`) | `isMissing: true`. |
| String with trailing currency (`"10 USDC"`) | Parsed as `10`. |
| Very large values | Locale grouping (`"1,234,567,890.12"`); compact opt-in. |
| Sub-cent values at high precision | `formatAmount(0.0000005, { precision: 6, minPrecision: 6 })` → `"0.000001 USDC"` (visible, not zero). |
| `-0.5` rounded to integer | `'half-up'` → `-1`; `'half-even'` → `0`. |
| Invalid `precision` (negative / non-integer) | `RangeError` thrown. |
| `minPrecision > precision` | `RangeError` thrown. |
| Invalid locale | Falls back silently to `'en-US'`. |

---

## Migrating existing call sites

Replacement is mostly mechanical:

```tsx
// Before
<span>{balance.toFixed(2)} USDC</span>

// After
<Amount value={balance} />
```

```tsx
// Before
<span>{`${value} USDC`}</span>

// After
<Amount value={value} minPrecision={0} />
```

```tsx
// Before
aria-label={`Balance: ${balance} USDC out of ${maxBalance} USDC`}

// After
aria-label={`Balance: ${formatAmount(balance, { minPrecision: 0 }).display} out of ${formatAmount(maxBalance, { minPrecision: 0 }).display}`}
```

A reference migration is in [src/components/PrepaidBalance.tsx](../src/components/PrepaidBalance.tsx).

When migrating, prefer the component (`<Amount />`) for in-page text and
the util (`formatAmount`) for everything else (aria-labels, mock data,
emails, CSV export, etc.).

---

## Testing

| File | Coverage |
|---|---|
| [src/utils/amount.test.ts](../src/utils/amount.test.ts) | `coerceAmount`, `roundAmount` (all 4 modes including the float-drift cases at `0.005` / `1.005`), `formatAmount` (rounding, sign display, locale, compact, missing inputs, validation errors, large values, USDC on-chain precision). |
| [src/components/common/Amount.test.tsx](../src/components/common/Amount.test.tsx) | Rendering, aria-label, aria-hidden inner spans, prop forwarding, sign data attributes, zero data attribute, missing-value placeholder + aria-label, custom placeholder, ariaLabel override, `as` override, string inputs (including trailing currency). |

```bash
npm test -- src/utils/amount.test.ts src/components/common/Amount.test.tsx
```

Coverage target: **≥ 95%** — actual: **100%** statements / branches /
functions / lines on both files.
