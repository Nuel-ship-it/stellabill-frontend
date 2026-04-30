/** All approved spacing values in px (8-pt grid). */
const VALID_SPACING_PX = new Set([0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96]);

/** Approved fluid font-size range per semantic level (min–max px at typical viewport). */
const FONT_SIZE_RANGES = {
  h1: { min: 32, max: 62 },
  h2: { min: 28, max: 50 },
  h3: { min: 24, max: 40 },
  h4: { min: 20, max: 32 },
  h5: { min: 18, max: 26 },
  h6: { min: 16, max: 22 },
  body: { min: 15, max: 20 },
};

const SPACING_PROPS = [
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'gap', 'rowGap', 'columnGap',
];

/** Convert a CSS value string like "16px" to a number. Returns null if not parseable. */
function parsePx(value) {
  if (!value || value === 'auto' || value === 'normal' || value === 'none') return null;
  const n = parseFloat(value);
  return Number.isFinite(n) ? Math.round(n) : null;
}

/** Check whether a spacing value aligns to the 8-pt grid. */
function isOnGrid(px) {
  if (px === null || px === 0) return true;
  return VALID_SPACING_PX.has(px);
}

/**
 * Audit spacing on a single element.
 * @param {Element} el
 * @param {CSSStyleDeclaration} styles
 * @returns {Array<{prop, value, violation}>}
 */
function auditSpacing(el, styles) {
  const issues = [];
  for (const prop of SPACING_PROPS) {
    const raw = styles[prop];
    const px = parsePx(raw);
    if (px !== null && !isOnGrid(px)) {
      issues.push({
        element: el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ')[0] : ''),
        property: prop,
        value: raw,
        violation: `${px}px is not on the 8-pt spacing grid`,
      });
    }
  }
  return issues;
}

/**
 * Audit font size on a heading element.
 * @param {Element} el
 * @param {CSSStyleDeclaration} styles
 * @returns {object|null}
 */
function auditFontSize(el, styles) {
  const tag = el.tagName.toLowerCase();
  const range = FONT_SIZE_RANGES[tag] || (tag !== 'h1' && tag !== 'h2' && FONT_SIZE_RANGES['body']);
  if (!range) return null;

  const px = parsePx(styles.fontSize);
  if (px === null) return null;

  if (px < range.min || px > range.max) {
    return {
      element: tag + (el.id ? `#${el.id}` : el.className ? `.${el.className.split(' ')[0]}` : ''),
      property: 'font-size',
      value: styles.fontSize,
      violation: `${px}px outside approved range ${range.min}–${range.max}px for <${tag}>`,
    };
  }
  return null;
}

/**
 * Audit heading hierarchy for skipped levels.
 * @returns {Array<string>}
 */
function auditHeadingHierarchy() {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const issues = [];
  let prevLevel = 0;

  for (const h of headings) {
    const level = parseInt(h.tagName[1], 10);
    if (level > prevLevel + 1) {
      issues.push({
        element: h.tagName.toLowerCase(),
        property: 'heading-hierarchy',
        value: `h${level}`,
        violation: `Heading level skipped: h${prevLevel || 1} → h${level}`,
      });
    }
    prevLevel = level;
  }
  return issues;
}

/**
 * Check that every text element has a line-height set.
 * @param {Element} el
 * @param {CSSStyleDeclaration} styles
 * @returns {object|null}
 */
function auditLineHeight(el, styles) {
  const tag = el.tagName.toLowerCase();
  if (!['p', 'span', 'li', 'td', 'th', 'label'].includes(tag)) return null;
  const lh = styles.lineHeight;
  if (!lh || lh === 'normal') {
    return {
      element: tag,
      property: 'line-height',
      value: lh || 'unset',
      violation: 'No explicit line-height — defaults to browser "normal" (~1.2)',
    };
  }
  return null;
}

/**
 * Run a full spacing + typography audit on the live DOM.
 *
 * @param {string} [selector='*'] - CSS selector to scope audit
 * @returns {{ violations: Array<object>, summary: object }}
 */
export function runAudit(selector = '[data-audit], main, header, footer, section, article') {
  if (typeof document === 'undefined') {
    throw new Error('runAudit() must be called in a browser environment.');
  }

  const elements = Array.from(document.querySelectorAll(selector));
  const violations = [];

  for (const el of elements) {
    const styles = window.getComputedStyle(el);

    // Spacing
    violations.push(...auditSpacing(el, styles));

    // Font size (headings + body text)
    const fsIssue = auditFontSize(el, styles);
    if (fsIssue) violations.push(fsIssue);

    // Line height
    const lhIssue = auditLineHeight(el, styles);
    if (lhIssue) violations.push(lhIssue);
  }

  // Heading hierarchy (document-level)
  violations.push(...auditHeadingHierarchy());

  const summary = {
    totalElements: elements.length,
    totalViolations: violations.length,
    spacingViolations: violations.filter(v => SPACING_PROPS.includes(v.property)).length,
    typographyViolations: violations.filter(v => v.property === 'font-size').length,
    lineHeightViolations: violations.filter(v => v.property === 'line-height').length,
    hierarchyViolations: violations.filter(v => v.property === 'heading-hierarchy').length,
  };

  return { violations, summary };
}

/**
 * Pretty-print the audit report to the console.
 */
export function printAuditReport() {
  const { violations, summary } = runAudit();
  console.group('%c Stellabill Spacing & Typography Audit — Issue #166', 'font-weight:bold;color:#6366f1');
  console.log('Summary:', summary);
  if (violations.length === 0) {
    console.log('%c ✅ No violations found!', 'color:green');
  } else {
    console.table(violations);
  }
  console.groupEnd();
  return { violations, summary };
}