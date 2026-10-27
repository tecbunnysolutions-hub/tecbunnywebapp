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
  // Values resolve from styles/tokens.css; no second physical palette lives here.
  colors: {
    brand: { dark: 'hsl(var(--background))', navy: 'hsl(var(--foreground))', blue: 'hsl(var(--primary))', amber: 'hsl(var(--accent))', slate: 'hsl(var(--muted))' },
    primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))', light: 'hsl(var(--primary) / .8)', lighter: 'hsl(var(--primary) / .6)' },
    secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))', hover: 'hsl(var(--secondary) / .9)', active: 'hsl(var(--secondary) / .8)' },
    accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))', hover: 'hsl(var(--accent) / .9)' },
    success: 'hsl(var(--success))', warning: 'hsl(var(--warning))', error: 'hsl(var(--destructive))', info: 'hsl(var(--primary))',
    priority: { hot: 'hsl(var(--destructive))', warm: 'hsl(var(--warning))', cold: 'hsl(var(--muted-foreground))' },
    background: 'hsl(var(--background))', foreground: 'hsl(var(--foreground))',
    card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))', muted: 'hsl(var(--muted))' },
    popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
    muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
    destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
    border: 'hsl(var(--border))', input: 'hsl(var(--input))', ring: 'hsl(var(--ring))',
    chart: { '1': 'hsl(var(--chart-1))', '2': 'hsl(var(--chart-2))', '3': 'hsl(var(--chart-3))', '4': 'hsl(var(--chart-4))', '5': 'hsl(var(--chart-5))' },
    sidebar: { DEFAULT: 'hsl(var(--sidebar-background))', foreground: 'hsl(var(--sidebar-foreground))', primary: 'hsl(var(--sidebar-primary))', 'primary-foreground': 'hsl(var(--sidebar-primary-foreground))', accent: 'hsl(var(--sidebar-accent))', 'accent-foreground': 'hsl(var(--sidebar-accent-foreground))', border: 'hsl(var(--sidebar-border))', ring: 'hsl(var(--sidebar-ring))' },
  },
  fontFamily: { sans: ['var(--font-body)'], heading: ['var(--font-body)'], tech: ['var(--font-body)'], body: ['var(--font-body)'], code: ['var(--font-code)'] },
  borderRadius: { none: '0', xs: '.25rem', sm: 'calc(var(--radius) - .125rem)', md: 'var(--radius)', lg: 'var(--radius-card)', xl: 'var(--radius-feature)', full: '9999px' },
  boxShadow: { none: 'none', xs: 'var(--tb-shadow-sm)', sm: 'var(--tb-shadow-sm)', md: 'var(--tb-shadow-md)', lg: 'var(--tb-shadow-lg)', xl: 'var(--tb-shadow-xl)', hover: 'var(--tb-shadow-md)', focus: '0 0 0 3px hsl(var(--ring) / .3)', inner: 'inset 0 1px 3px hsl(var(--overlay) / .06)' },
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
