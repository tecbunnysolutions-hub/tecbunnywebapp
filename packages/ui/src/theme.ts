export const enterpriseTokenContract = {
  colorRoles: [
    'background',
    'foreground',
    'card',
    'popover',
    'primary',
    'secondary',
    'muted',
    'accent',
    'destructive',
    'border',
    'input',
    'ring',
    'chart',
    'sidebar',
  ],
  density: {
    compact: 'data-density="compact"',
    comfortable: 'data-density="comfortable"',
  },
  radius: {
    panel: 'lg',
    control: 'md',
    indicator: 'sm',
  },
  motion: {
    quick: '120ms',
    standard: '200ms',
    deliberate: '320ms',
  },
  status: {
    success: 'green',
    warning: 'accent',
    danger: 'alert',
    information: 'blue',
    neutral: 'muted',
  },
} as const;

export const theme = {
  colors: {
    /* Brand Palette - Aligned with global.css */
    brand: {
      dark: 'hsl(224, 60%, 8%)',      /* Section dark background */
      navy: 'hsl(224, 64%, 15%)',      /* Primary - Deep Obsidian */
      blue: 'hsl(220, 85%, 57%)',      /* Secondary - Electric Cobalt */
      amber: 'hsl(22, 95%, 50%)',      /* Accent - Sunset Amber */
      slate: 'hsl(210, 40%, 96%)',     /* Neutral - Pale Slate */
    },
    /* Semantic Colors */
    primary: {
      DEFAULT: 'hsl(224, 64%, 15%)',
      foreground: 'hsl(0, 0%, 100%)',
      light: 'hsl(224, 60%, 25%)',
      lighter: 'hsl(224, 50%, 40%)',
    },
    secondary: {
      DEFAULT: 'hsl(220, 85%, 57%)',
      foreground: 'hsl(0, 0%, 100%)',
      hover: 'hsl(220, 85%, 50%)',
      active: 'hsl(220, 85%, 45%)',
    },
    accent: {
      DEFAULT: 'hsl(22, 95%, 50%)',
      foreground: 'hsl(0, 0%, 100%)',
      hover: 'hsl(22, 95%, 45%)',
    },
    /* Feedback States */
    success: 'hsl(142, 71%, 45%)',
    warning: 'hsl(38, 92%, 50%)',
    error: 'hsl(0, 84%, 60%)',
    info: 'hsl(217, 91%, 60%)',
    /* Priority Badges */
    priority: {
      hot: 'hsl(0, 84%, 60%)',
      warm: 'hsl(38, 92%, 50%)',
      cold: 'hsl(215, 25%, 60%)',
    },
    /* Surfaces & Backgrounds */
    background: 'hsl(210, 40%, 96%)',
    foreground: 'hsl(224, 60%, 10%)',
    card: {
      DEFAULT: 'hsl(0, 0%, 100%)',
      foreground: 'hsl(224, 60%, 10%)',
      muted: 'hsl(210, 40%, 98%)',
    },
    popover: {
      DEFAULT: 'hsl(0, 0%, 100%)',
      foreground: 'hsl(224, 60%, 10%)',
    },
    muted: {
      DEFAULT: 'hsl(215, 20%, 45%)',
      foreground: 'hsl(224, 60%, 10%)',
    },
    destructive: {
      DEFAULT: 'hsl(0, 84%, 60%)',
      foreground: 'hsl(0, 0%, 100%)',
    },
    border: 'hsl(214, 30%, 88%)',
    input: 'hsl(0, 0%, 100%)',
    ring: 'hsl(220, 85%, 57%)',
    chart: {
      '1': 'hsl(220, 85%, 57%)',
      '2': 'hsl(22, 95%, 50%)',
      '3': 'hsl(142, 71%, 45%)',
      '4': 'hsl(38, 92%, 50%)',
      '5': 'hsl(217, 91%, 60%)',
    },
    sidebar: {
      DEFAULT: 'hsl(0, 0%, 100%)',
      foreground: 'hsl(224, 60%, 10%)',
      primary: 'hsl(220, 85%, 57%)',
      'primary-foreground': 'hsl(0, 0%, 100%)',
      accent: 'hsl(22, 95%, 50%)',
      'accent-foreground': 'hsl(0, 0%, 100%)',
      border: 'hsl(214, 30%, 88%)',
      ring: 'hsl(220, 85%, 57%)',
    },
  },
  fontFamily: {
    sans: ['var(--font-body)', 'Inter', 'Outfit', 'sans-serif'],
    heading: ['Outfit', 'sans-serif'],
    tech: ['var(--font-body)', 'sans-serif'],
    body: ['var(--font-body)', 'Inter', 'sans-serif'],
    code: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
  },
  borderRadius: {
    none: '0',
    xs: '4px',
    sm: '8px',
    md: '8px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  boxShadow: {
    none: 'none',
    xs: '0 1px 2px rgba(15, 23, 42, 0.06)',
    sm: '0 4px 6px rgba(15, 23, 42, 0.06)',
    md: '0 4px 6px rgba(15, 23, 42, 0.12)',
    lg: '0 10px 20px rgba(15, 23, 42, 0.18)',
    xl: '0 20px 40px rgba(15, 23, 42, 0.25)',
    hover: '0 8px 16px rgba(15, 23, 42, 0.12)',
    focus: '0 0 0 3px rgba(59, 130, 246, 0.1), 0 0 0 4px hsl(220, 85%, 57%)',
    inner: 'inset 0 2px 4px rgba(15, 23, 42, 0.06)',
  },
  spacing: {
    '0': '0',
    '1': 'var(--space-3xs)',
    '2': 'var(--space-2xs)',
    '3': 'var(--space-xs)',
    '4': 'var(--space-s)',
    '6': 'var(--space-m)',
    '8': 'var(--space-l)',
    '12': 'var(--space-xl)',
    '16': 'var(--space-2xl)',
    '20': 'var(--space-3xl)',
  },
  keyframes: {
    scanLine: {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(100%)' },
    },
    float: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-10px)' },
    },
    'accordion-down': {
      from: { height: '0' },
      to: { height: 'var(--radix-accordion-content-height)' },
    },
    'accordion-up': {
      from: { height: 'var(--radix-accordion-content-height)' },
      to: { height: '0' },
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
  },
  animation: {
    'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    'scan-line': 'scanLine 2s linear infinite',
    'float': 'float 6s ease-in-out infinite',
    'accordion-down': 'accordion-down 0.2s ease-out',
    'accordion-up': 'accordion-up 0.2s ease-out',
  },
  enterprise: enterpriseTokenContract,
  backgroundImage: {
    'noise': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
  },
};
