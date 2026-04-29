# Danger Zone Pattern

A consistent UI pattern for destructive actions across Stellabill. Wraps two
reusable components: **`DangerZone`** (a clearly-marked section that groups
destructive actions) and **`ConfirmDialog`** (an accessible modal that confirms
the action and explains its consequences).

Both components live in [src/components/common/](../src/components/common/).

---

## When to use

Use the danger zone pattern any time a user can take an action that is

- **destructive** (deletes data, cancels a subscription, removes a credential,
  etc.) **and**
- either **irreversible** or has **non-obvious consequences** (e.g. cascades
  to billing, breaks integrations, takes effect at a future date).

Examples in this codebase:

| Surface | Action | File |
|---|---|---|
| Organization settings | Delete organization | [src/components/settings/OrganizationSettings.tsx](../src/components/settings/OrganizationSettings.tsx) |
| Billing settings | Cancel subscription | [src/components/settings/BillingSettings.tsx](../src/components/settings/BillingSettings.tsx) |
| Billing settings | Remove payment method | [src/components/settings/BillingSettings.tsx](../src/components/settings/BillingSettings.tsx) |

---

## Anatomy

```
┌─ DangerZone ─────────────────────────────────────────────┐
│  ⚠  Danger Zone                                          │
│  Irreversible actions. Read carefully before proceeding. │
│  ──────────────────────────────────────────────────────  │
│   DangerZoneItem                                         │
│   ┌──────────────────────────────────────┐               │
│   │  Title                  [ Action ▸ ] │               │
│   │  Description of consequence          │               │
│   └──────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────┘

       (clicking the action opens…)

┌─ ConfirmDialog (role="alertdialog") ─────────────┐
│  ⚠  Title                                    ✕   │
│      Description                                  │
│      • consequence one                            │
│      • consequence two                            │
│      ─────────────────────────────────────        │
│      Type DELETE to confirm:                      │
│      [ ____________________ ]                     │
│                                                   │
│                 [ Cancel ]  [ Confirm ]           │
└───────────────────────────────────────────────────┘
```

---

## `DangerZone`

```tsx
import DangerZone, { DangerZoneItem } from '@/components/common/DangerZone'
import { Trash2 } from 'lucide-react'

<DangerZone description="Destructive billing actions. These cannot be undone.">
  <DangerZoneItem
    title="Cancel subscription"
    description="Cancel your active subscription at the end of the period."
    actionLabel="Cancel subscription"
    actionIcon={<Trash2 size={14} aria-hidden="true" />}
    onAction={() => setShowConfirm(true)}
  />
</DangerZone>
```

### `DangerZoneProps`

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `'Danger Zone'` | Heading rendered in the section header. |
| `description` | `ReactNode` | — | Optional intro paragraph rendered below the header. |
| `children` | `ReactNode` | — | One or more `DangerZoneItem`s (or arbitrary content). |
| `className` | `string` | — | Optional class name appended to the root section. |

### `DangerZoneItemProps`

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — | Item heading. |
| `description` | `ReactNode` | — | Plain-language consequence description. |
| `actionLabel` | `string` | — | Button label. |
| `onAction` | `() => void` | — | Called when the action button is clicked. |
| `actionIcon` | `ReactNode` | — | Optional leading icon for the button. |
| `disabled` | `boolean` | `false` | Disables the action button. |
| `actionAriaLabel` | `string` | `"<actionLabel>: <title>"` | Override the button's accessible name. |

The section is rendered with `role="region"` (via `<section aria-labelledby>`)
and each item is a `role="group"` labelled by its title, so screen readers can
navigate by landmark and announce both the action and its rationale.

---

## `ConfirmDialog`

```tsx
import ConfirmDialog from '@/components/common/ConfirmDialog'

<ConfirmDialog
  isOpen={showConfirm}
  title="Cancel subscription?"
  description="Your subscription will be cancelled at the end of the period."
  consequences={[
    'You will not be charged again.',
    'Access continues until the end of the current period.',
    'Remaining prepaid balance can be withdrawn from your wallet.',
  ]}
  confirmLabel="Cancel subscription"
  cancelLabel="Keep subscription"
  onConfirm={handleCancel}
  onClose={() => setShowConfirm(false)}
/>
```

### `ConfirmDialogProps`

| Prop | Type | Default | Description |
|---|---|---|---|
| `isOpen` | `boolean` | — | Whether the dialog is rendered. |
| `title` | `string` | — | Dialog title (used as `aria-labelledby`). |
| `description` | `ReactNode` | — | Plain-language summary (used as `aria-describedby`). |
| `consequences` | `string[]` | — | Optional bullet list of specific outcomes. |
| `confirmLabel` | `string` | `'Confirm'` | Confirm button label. |
| `cancelLabel` | `string` | `'Cancel'` | Cancel button label. |
| `loadingLabel` | `string` | `"<confirmLabel>..."` | Label shown on the confirm button while `isLoading`. |
| `isLoading` | `boolean` | `false` | Disables all controls and shows the loading label. |
| `destructive` | `boolean` | `true` | Enables the red icon, border, and emphasis. |
| `confirmPhrase` | `string` | — | If set, the user must type this phrase exactly to enable confirm (e.g. `"DELETE"`). |
| `closeOnOverlayClick` | `boolean` | `true` | Whether clicking the backdrop closes the dialog. |
| `onConfirm` | `() => void` | — | Called when the confirm button is clicked. |
| `onClose` | `() => void` | — | Called when the user dismisses the dialog (cancel / close / Esc / overlay). |

### Accessibility guarantees

- Dialog uses `role="alertdialog"` with `aria-modal="true"`.
- Title is wired to `aria-labelledby`; description (when provided) is wired
  to `aria-describedby`.
- **Focus management**: opening the dialog moves focus to the **Cancel**
  button (the safe default); closing the dialog returns focus to the element
  that was focused before opening.
- **Focus trap**: Tab and Shift+Tab cycle within the dialog only.
- **Escape** closes the dialog at any time (except while `isLoading`, the
  overlay is not click-dismissable to avoid accidental cancellation of a
  long-running operation).
- The confirm button is the **only** affirmative action and is visually
  destructive (red); the cancel button is the visual default and gets
  initial focus.

### Confirm-phrase pattern

For the most destructive actions (e.g. deleting an organization) supply a
`confirmPhrase`. The confirm button stays disabled until the user has typed
the exact phrase. The phrase input uses `aria-required="true"` and is
labelled.

---

## Keyboard flow

| Key | Result |
|---|---|
| `Tab` / `Shift+Tab` | Cycles focus inside the dialog. |
| `Esc` | Calls `onClose`. |
| `Enter` (on confirm button) | Calls `onConfirm` if not gated by `confirmPhrase`. |
| Click outside | Calls `onClose` (unless `closeOnOverlayClick={false}` or `isLoading`). |

---

## Writing good copy

When wiring up a new destructive action, treat the copy as part of the
contract — bad copy is the most common reason a user dismisses a confirm
dialog and immediately panics:

1. **Title**: phrase as a question ("Cancel subscription?") so the cancel
   button is the natural answer.
2. **Description**: one sentence in plain language. Say what happens, not
   what the user did wrong.
3. **Consequences**: short, specific, and verifiable. Prefer
   "Auto-pay will fail if this is the last payment method on file" over
   "This may affect billing."
4. **Confirm label**: name the destructive verb ("Delete organization", not
   "OK").
5. **Cancel label**: prefer the *retention* framing ("Keep subscription")
   over the neutral "Cancel" when the dialog itself is about cancelling
   something.

---

## Testing

Both components are covered by unit tests in
[src/components/common/](../src/components/common/):

- [`DangerZone.test.tsx`](../src/components/common/DangerZone.test.tsx) —
  rendering, ARIA wiring, click handling, disabled state.
- [`ConfirmDialog.test.tsx`](../src/components/common/ConfirmDialog.test.tsx) —
  rendering, ARIA wiring, keyboard trap, Escape handling, overlay-click
  behaviour, confirm-phrase gating, focus restoration, loading state.

Run them with:

```bash
npm test -- src/components/common
```

Coverage target is **≥ 95%** for both components.
