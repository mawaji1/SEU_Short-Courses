# SEU Short Courses Platform — Design System Token Strategy

**Document Type:** Architecture Artifact  
**Phase:** Design & Architecture  
**Status:** Draft for Review  
**Date:** 2026-01-03

---

## 1. Purpose

This document defines the design system token strategy for the SEU Short Courses Platform, implementing the layered design model established in Phase 0:

```
Layer 1: Platforms Code (UX Foundation)
Layer 2: SEU Brand (Visual Layer)
Layer 3: Platform-Specific UX
```

> [!IMPORTANT]
> **Phase 0 Constraints:**
> - Platforms Code is mandatory as UX foundation
> - SEU brand overlays Platforms Code (not replaces)
> - Accessibility standards cannot be overridden
> - Brand assets available in `ui/` directory

---

## 2. Implementation Library

### 2.1 Platforms Code UI React

The official **Platforms Code UI React** library will be used as the component foundation:

```bash
npm install platformscode-new-react@latest
```

| Aspect | Value |
|--------|-------|
| Package | `platformscode-new-react` |
| Purpose | Official Saudi National Design System components |
| Status | Will be installed during Implementation Phase |

### 2.2 SEU Customization Approach

The library provides the **base components and UX patterns**. SEU brand is applied via:

1. **CSS Variable Overrides** — Override library's CSS custom properties with SEU brand values
2. **Theme Provider** — Wrap components with SEU theme configuration
3. **Token Injection** — Inject SEU tokens at build time

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMIZATION FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   platformscode-new-react (base components)                     │
│                     │                                           │
│                     ▼                                           │
│   SEU Theme Provider (CSS variable overrides)                   │
│                     │                                           │
│                     ▼                                           │
│   SEU-branded Platform (Platforms Code behavior, SEU look)      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

This ensures:
- Full Platforms Code UX compliance (Phase 0 requirement)
- No need to rebuild base components
- SEU brand applied through theme layer only
- Accessibility maintained (library handles it)

---

## 3. Token Architecture

### 3.1 Token Hierarchy

Design tokens follow a three-tier hierarchy:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TOKEN HIERARCHY                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │                    SEMANTIC TOKENS                              │      │
│   │   (Purpose-driven: --color-action-primary, --spacing-content)   │      │
│   │                                                                 │      │
│   │   What they mean in context                                     │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                              ▲                                              │
│                              │ References                                   │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │                    ALIAS TOKENS                                 │      │
│   │   (Brand-specific: --seu-primary, --seu-text)                   │      │
│   │                                                                 │      │
│   │   SEU visual identity layer                                     │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                              ▲                                              │
│                              │ References                                   │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │                    PRIMITIVE TOKENS                             │      │
│   │   (Raw values: --color-green-600, --space-4)                    │      │
│   │                                                                 │      │
│   │   Platforms Code foundation + SEU palette                       │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Token Categories

| Category | Scope | Examples |
|----------|-------|----------|
| **Color** | Brand, semantic, feedback | Primary, secondary, success, error |
| **Typography** | Font families, sizes, weights | Heading scales, body text |
| **Spacing** | Layout rhythm | Content spacing, component gaps |
| **Sizing** | Component dimensions | Input heights, button sizes |
| **Border** | Border radius, widths | Rounded corners, dividers |
| **Shadow** | Elevation | Cards, modals, dropdowns |
| **Motion** | Animations, transitions | Timing, easing functions |
| **Breakpoints** | Responsive design | Mobile, tablet, desktop |

---

## 3. Color Token System

### 3.1 Primitive Colors (Foundation)

These are raw color values derived from SEU brand assets and Platforms Code guidance.

> [!NOTE]
> Exact hex values to be extracted from `ui/theme/Color Palette*.avif` during design phase.

**Conceptual Structure:**

```
Primitives:
├── Primary Scale (SEU Brand Primary)
│   ├── --color-primary-50   (lightest)
│   ├── --color-primary-100
│   ├── --color-primary-200
│   ├── ...
│   └── --color-primary-900  (darkest)
│
├── Secondary Scale (SEU Brand Secondary)
│   └── (similar scale)
│
├── Neutral Scale (Grays)
│   ├── --color-neutral-0    (white)
│   ├── --color-neutral-50
│   ├── ...
│   └── --color-neutral-900  (black)
│
└── Semantic Colors (Per Platforms Code)
    ├── --color-success-*    (green scale)
    ├── --color-warning-*    (amber scale)
    ├── --color-error-*      (red scale)
    └── --color-info-*       (blue scale)
```

### 3.2 Alias Tokens (SEU Brand Layer)

Map primitives to brand-specific names:

```
SEU Brand Aliases:
├── --seu-brand-primary      → --color-primary-600
├── --seu-brand-primary-light → --color-primary-400
├── --seu-brand-primary-dark → --color-primary-800
├── --seu-brand-secondary    → --color-secondary-600
├── --seu-text-primary       → --color-neutral-900
├── --seu-text-secondary     → --color-neutral-600
├── --seu-background         → --color-neutral-0
└── --seu-background-alt     → --color-neutral-50
```

### 3.3 Semantic Tokens (Purpose Layer)

Map aliases to functional purposes:

```
Semantic Tokens:
├── Actions
│   ├── --color-action-primary        → --seu-brand-primary
│   ├── --color-action-primary-hover  → --seu-brand-primary-dark
│   ├── --color-action-secondary      → --seu-brand-secondary
│   └── --color-action-disabled       → --color-neutral-300
│
├── Text
│   ├── --color-text-primary          → --seu-text-primary
│   ├── --color-text-secondary        → --seu-text-secondary
│   ├── --color-text-inverse          → --color-neutral-0
│   └── --color-text-link             → --seu-brand-primary
│
├── Backgrounds
│   ├── --color-bg-primary            → --seu-background
│   ├── --color-bg-secondary          → --seu-background-alt
│   └── --color-bg-inverse            → --color-neutral-900
│
├── Borders
│   ├── --color-border-default        → --color-neutral-200
│   ├── --color-border-focus          → --seu-brand-primary
│   └── --color-border-error          → --color-error-500
│
└── Feedback
    ├── --color-feedback-success      → --color-success-600
    ├── --color-feedback-warning      → --color-warning-600
    ├── --color-feedback-error        → --color-error-600
    └── --color-feedback-info         → --color-info-600
```

### 3.4 Dark Mode Consideration

| Approach | Decision |
|----------|----------|
| Phase 1 | Light mode only (MVP) |
| Future | Semantic tokens enable dark mode swap without component changes |

---

## 4. Typography Token System

### 4.1 Font Families

**Per SEU Brand & Platforms Code:**

| Use Case | Arabic | Latin | Fallback |
|----------|--------|-------|----------|
| Primary | [SEU Arabic Font] | [SEU Latin Font] | system-ui, sans-serif |
| Monospace | — | — | monospace |

> [!NOTE]
> Actual font family names TBD from SEU brand guidelines.

```
Typography Primitives:
├── --font-family-primary-ar    (Arabic)
├── --font-family-primary-en    (Latin)
└── --font-family-mono
```

### 4.2 Type Scale

Following Platforms Code modular scale:

```
--font-size-xs     12px / 0.75rem
--font-size-sm     14px / 0.875rem
--font-size-base   16px / 1rem
--font-size-lg     18px / 1.125rem
--font-size-xl     20px / 1.25rem
--font-size-2xl    24px / 1.5rem
--font-size-3xl    30px / 1.875rem
--font-size-4xl    36px / 2.25rem
--font-size-5xl    48px / 3rem
```

### 4.3 Font Weights

```
--font-weight-normal    400
--font-weight-medium    500
--font-weight-semibold  600
--font-weight-bold      700
```

### 4.4 Line Heights

```
--line-height-tight     1.25
--line-height-normal    1.5
--line-height-relaxed   1.75
```

### 4.5 Typography Semantic Tokens

```
Headings:
├── --text-heading-1
│   font-size: --font-size-4xl
│   font-weight: --font-weight-bold
│   line-height: --line-height-tight
│
├── --text-heading-2
│   font-size: --font-size-3xl
│   font-weight: --font-weight-semibold
│
├── --text-heading-3
│   font-size: --font-size-2xl
│   font-weight: --font-weight-semibold
│
└── ...

Body:
├── --text-body-lg
├── --text-body-base
├── --text-body-sm

Labels:
├── --text-label
├── --text-caption
```

---

## 5. Spacing Token System

### 5.1 Spacing Scale (4px Base)

```
--space-0      0
--space-1      4px   / 0.25rem
--space-2      8px   / 0.5rem
--space-3      12px  / 0.75rem
--space-4      16px  / 1rem
--space-5      20px  / 1.25rem
--space-6      24px  / 1.5rem
--space-8      32px  / 2rem
--space-10     40px  / 2.5rem
--space-12     48px  / 3rem
--space-16     64px  / 4rem
--space-20     80px  / 5rem
--space-24     96px  / 6rem
```

### 5.2 Semantic Spacing

```
Content Spacing:
├── --spacing-content-xs      --space-2
├── --spacing-content-sm      --space-4
├── --spacing-content-md      --space-6
├── --spacing-content-lg      --space-8
└── --spacing-content-xl      --space-12

Component Gaps:
├── --spacing-component-gap-sm   --space-2
├── --spacing-component-gap-md   --space-4
└── --spacing-component-gap-lg   --space-6

Section Spacing:
├── --spacing-section-sm     --space-8
├── --spacing-section-md     --space-12
└── --spacing-section-lg     --space-16

Page Margins:
├── --spacing-page-inline    --space-4 to --space-8 (responsive)
└── --spacing-page-block     --space-6 to --space-12 (responsive)
```

---

## 6. Component Token System

### 6.1 Border Radius

```
--radius-none     0
--radius-sm       4px
--radius-md       8px
--radius-lg       12px
--radius-xl       16px
--radius-full     9999px
```

### 6.2 Shadows

```
--shadow-sm       0 1px 2px rgba(0,0,0,0.05)
--shadow-md       0 4px 6px rgba(0,0,0,0.1)
--shadow-lg       0 10px 15px rgba(0,0,0,0.1)
--shadow-xl       0 20px 25px rgba(0,0,0,0.1)
```

### 6.3 Transitions

```
--duration-fast      150ms
--duration-normal    250ms
--duration-slow      400ms

--easing-default     cubic-bezier(0.4, 0, 0.2, 1)
--easing-in          cubic-bezier(0.4, 0, 1, 1)
--easing-out         cubic-bezier(0, 0, 0.2, 1)
```

---

## 7. RTL (Right-to-Left) Strategy

### 7.1 Approach: CSS Logical Properties

Use CSS logical properties instead of physical properties:

| Physical | Logical |
|----------|---------|
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `padding-left` | `padding-inline-start` |
| `padding-right` | `padding-inline-end` |
| `text-align: left` | `text-align: start` |
| `text-align: right` | `text-align: end` |

### 7.2 Direction Token

```
:root {
  --direction: rtl;  /* Arabic (default) */
}

:root[lang="en"] {
  --direction: ltr;  /* English */
}
```

### 7.3 RTL-Aware Components

All components must:
- Use logical properties
- Mirror icons/chevrons appropriately
- Handle bidirectional text correctly

---

## 8. Responsive Breakpoints

### 8.1 Breakpoint Scale

```
--breakpoint-sm      640px    Mobile landscape
--breakpoint-md      768px    Tablet portrait
--breakpoint-lg      1024px   Tablet landscape / small desktop
--breakpoint-xl      1280px   Desktop
--breakpoint-2xl     1536px   Large desktop
```

### 8.2 Mobile-First Approach

Default styles target mobile; use `min-width` media queries for larger screens.

---

## 9. Component-Specific Tokens

### 9.1 Buttons

```
Button Tokens:
├── Sizing
│   ├── --button-height-sm        32px
│   ├── --button-height-md        40px
│   └── --button-height-lg        48px
│
├── Padding
│   ├── --button-padding-sm       --space-2 --space-3
│   ├── --button-padding-md       --space-2 --space-4
│   └── --button-padding-lg       --space-3 --space-6
│
└── Variants (semantic colors)
    ├── Primary: --color-action-primary + inverse text
    ├── Secondary: outlined with --color-action-primary
    └── Ghost: transparent background
```

### 9.2 Inputs

```
Input Tokens:
├── --input-height               44px
├── --input-border-radius        --radius-md
├── --input-border-color         --color-border-default
├── --input-border-color-focus   --color-border-focus
├── --input-border-color-error   --color-border-error
├── --input-bg                   --color-bg-primary
└── --input-padding              --space-3
```

### 9.3 Cards

```
Card Tokens:
├── --card-bg                    --color-bg-primary
├── --card-border-radius         --radius-lg
├── --card-shadow                --shadow-md
├── --card-padding               --space-6
└── --card-gap                   --space-4
```

---

## 10. Token Distribution

### 10.1 File Structure

```
design-tokens/
├── primitives/
│   ├── colors.json
│   ├── typography.json
│   ├── spacing.json
│   └── sizing.json
├── aliases/
│   └── seu-brand.json
├── semantic/
│   ├── colors.json
│   ├── typography.json
│   └── spacing.json
└── components/
    ├── buttons.json
    ├── inputs.json
    └── cards.json
```

### 10.2 Token Format

Use JSON format compatible with Style Dictionary or similar tools:

```json
{
  "color": {
    "primary": {
      "600": {
        "value": "#XXXXXX",
        "type": "color"
      }
    }
  }
}
```

### 10.3 Token Transformation

Tokens will be transformed to:
- CSS Custom Properties (web)
- Tailwind CSS config (if used)
- TypeScript constants (type safety)

---

## 11. Accessibility Compliance

### 11.1 Color Contrast

All color combinations must meet:

| Level | Ratio | Use Case |
|-------|-------|----------|
| AA | 4.5:1 | Normal text |
| AA | 3:1 | Large text, UI components |
| AAA | 7:1 | Enhanced (when possible) |

### 11.2 Contrast Validation

Token definitions must include contrast validation:

```
--color-text-primary on --color-bg-primary    → Must pass AA
--color-text-inverse on --color-bg-inverse    → Must pass AA
--color-action-primary for buttons            → Must pass 3:1
```

### 11.3 Focus States

Visible focus states required for all interactive elements:

```
--focus-ring-color      --seu-brand-primary
--focus-ring-width      2px
--focus-ring-offset     2px
```

---

## 12. Next Steps

1. **Extract exact values** from `ui/theme/Color Palette*.avif` assets
2. **Confirm typography** from SEU brand guidelines
3. **Create token JSON files** using agreed structure
4. **Set up Style Dictionary** or token transformation pipeline
5. **Validate accessibility** for all color pairings
6. **Create token documentation** for development handoff

---

## 13. Phase 0 Compliance

| Requirement | Token Strategy Alignment |
|-------------|-------------------------|
| Platforms Code as foundation | ✅ Semantic patterns follow Platforms Code |
| SEU brand overlay | ✅ Alias tokens layer brand on primitives |
| Accessibility mandatory | ✅ Contrast requirements embedded in tokens |
| Arabic RTL first | ✅ Logical properties, RTL-first approach |
| No visual deviation without approval | ✅ All tokens governed by this strategy |

---

*This document is an architecture artifact and requires approval before implementation.*
