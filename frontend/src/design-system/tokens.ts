/**
 * SEU Short Courses Platform — Design System Tokens
 * 
 * Token hierarchy: Primitives → Aliases (SEU Brand) → Semantic
 * Built on top of platformscode-new-react (Saudi National Design System)
 */

// =============================================================================
// PRIMITIVE TOKENS
// Raw color values derived from SEU brand assets
// =============================================================================

export const primitives = {
  colors: {
    // Primary Scale (SEU Green)
    primary: {
      50: '#E8F5E9',
      100: '#C8E6C9',
      200: '#A5D6A7',
      300: '#81C784',
      400: '#66BB6A',
      500: '#4CAF50',
      600: '#43A047',  // SEU Primary
      700: '#388E3C',
      800: '#2E7D32',
      900: '#1B5E20',
    },
    // Secondary Scale (SEU Gold/Accent)
    secondary: {
      50: '#FFF8E1',
      100: '#FFECB3',
      200: '#FFE082',
      300: '#FFD54F',
      400: '#FFCA28',
      500: '#FFC107',
      600: '#FFB300',  // SEU Secondary
      700: '#FFA000',
      800: '#FF8F00',
      900: '#FF6F00',
    },
    // Neutral Scale
    neutral: {
      0: '#FFFFFF',
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    // Semantic Colors (Platforms Code standard)
    success: {
      50: '#E8F5E9',
      500: '#4CAF50',
      600: '#43A047',
      700: '#388E3C',
    },
    warning: {
      50: '#FFF3E0',
      500: '#FF9800',
      600: '#FB8C00',
      700: '#F57C00',
    },
    error: {
      50: '#FFEBEE',
      500: '#F44336',
      600: '#E53935',
      700: '#D32F2F',
    },
    info: {
      50: '#E3F2FD',
      500: '#2196F3',
      600: '#1E88E5',
      700: '#1976D2',
    },
  },
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },
  typography: {
    fontFamily: {
      primaryAr: 'var(--font-primary-ar), system-ui, sans-serif',
      primaryEn: 'var(--font-primary-en), system-ui, sans-serif',
      mono: 'monospace',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  },
  transitions: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '400ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
    },
  },
} as const;

// =============================================================================
// ALIAS TOKENS (SEU BRAND LAYER)
// Map primitives to SEU brand-specific names
// =============================================================================

export const seuBrand = {
  primary: primitives.colors.primary[600],
  primaryLight: primitives.colors.primary[400],
  primaryDark: primitives.colors.primary[800],
  secondary: primitives.colors.secondary[600],
  secondaryLight: primitives.colors.secondary[400],
  secondaryDark: primitives.colors.secondary[800],
  textPrimary: primitives.colors.neutral[900],
  textSecondary: primitives.colors.neutral[600],
  textMuted: primitives.colors.neutral[500],
  background: primitives.colors.neutral[0],
  backgroundAlt: primitives.colors.neutral[50],
  backgroundMuted: primitives.colors.neutral[100],
} as const;

// =============================================================================
// SEMANTIC TOKENS (PURPOSE LAYER)
// Map aliases to functional purposes
// =============================================================================

export const semantic = {
  // Actions
  action: {
    primary: seuBrand.primary,
    primaryHover: seuBrand.primaryDark,
    secondary: seuBrand.secondary,
    secondaryHover: seuBrand.secondaryDark,
    disabled: primitives.colors.neutral[300],
  },
  // Text
  text: {
    primary: seuBrand.textPrimary,
    secondary: seuBrand.textSecondary,
    muted: seuBrand.textMuted,
    inverse: primitives.colors.neutral[0],
    link: seuBrand.primary,
    linkHover: seuBrand.primaryDark,
  },
  // Backgrounds
  background: {
    primary: seuBrand.background,
    secondary: seuBrand.backgroundAlt,
    muted: seuBrand.backgroundMuted,
    inverse: primitives.colors.neutral[900],
  },
  // Borders
  border: {
    default: primitives.colors.neutral[200],
    focus: seuBrand.primary,
    error: primitives.colors.error[500],
    success: primitives.colors.success[500],
  },
  // Feedback
  feedback: {
    success: primitives.colors.success[600],
    successBg: primitives.colors.success[50],
    warning: primitives.colors.warning[600],
    warningBg: primitives.colors.warning[50],
    error: primitives.colors.error[600],
    errorBg: primitives.colors.error[50],
    info: primitives.colors.info[600],
    infoBg: primitives.colors.info[50],
  },
} as const;

// =============================================================================
// COMPONENT TOKENS
// =============================================================================

export const components = {
  button: {
    heightSm: '2rem',     // 32px
    heightMd: '2.5rem',   // 40px
    heightLg: '3rem',     // 48px
    borderRadius: primitives.borderRadius.md,
  },
  input: {
    height: '2.75rem',    // 44px
    borderRadius: primitives.borderRadius.md,
    borderColor: semantic.border.default,
    borderColorFocus: semantic.border.focus,
    borderColorError: semantic.border.error,
    background: semantic.background.primary,
    padding: primitives.spacing[3],
  },
  card: {
    background: semantic.background.primary,
    borderRadius: primitives.borderRadius.lg,
    shadow: primitives.shadows.md,
    padding: primitives.spacing[6],
    gap: primitives.spacing[4],
  },
  focus: {
    ringColor: seuBrand.primary,
    ringWidth: '2px',
    ringOffset: '2px',
  },
} as const;

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const breakpoints = {
  sm: '640px',    // Mobile landscape
  md: '768px',    // Tablet portrait
  lg: '1024px',   // Tablet landscape / small desktop
  xl: '1280px',   // Desktop
  '2xl': '1536px', // Large desktop
} as const;

// =============================================================================
// EXPORT ALL TOKENS
// =============================================================================

export const tokens = {
  primitives,
  seuBrand,
  semantic,
  components,
  breakpoints,
} as const;

export type Tokens = typeof tokens;
