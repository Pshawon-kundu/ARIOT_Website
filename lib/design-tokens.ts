/**
 * Design token mirror — TypeScript exports of the same tokens declared
 * as CSS custom properties in `app/globals.css`.
 *
 * Source of truth for visual decisions: `docs/DESIGN_SYSTEM.md`.
 *
 * When a token changes here, change the CSS variable in `app/globals.css`
 * in the same commit (and vice versa). Drift between the two surfaces is
 * a bug.
 *
 * Consumed by:
 *  - Motion configurations (`lib/motion/tokens.ts`)
 *  - Future R3F materials and shaders
 *  - Future chart libraries (recharts, visx)
 *  - Anywhere a TS-typed token is more ergonomic than `var(--token)`
 */

export const colors = {
  bg: {
    base: '#FFFFFF',
    raised: '#F5F7FA',
    elevated: '#FFFFFF',
    sunken: '#EEF1F6',
    overlay: 'rgba(15, 23, 42, 0.42)',
    grid: 'rgba(15, 23, 42, 0.035)',
  },
  steel: {
    50: '#FFFFFF',
    100: '#0B1220',
    200: '#1F2A37',
    300: '#475569',
    400: '#64748B',
    500: '#94A3B8',
    600: '#C2CBD8',
    700: '#DDE3EC',
    800: '#EAF0F6',
    900: '#F4F7FA',
  },
  cyan: {
    300: '#0E8FA8',
    400: '#0E7490',
    500: '#0C5E73',
    600: '#0B4A5A',
    faint: 'rgba(13, 148, 160, 0.1)',
  },
  semantic: {
    success: '#15803D',
    warning: '#B45309',
    danger: '#B91C1C',
  },
} as const;

export const radius = {
  sm: '0.375rem',
  md: '0.625rem',
  lg: '0.875rem',
  xl: '1.25rem',
  '2xl': '1.75rem',
  full: '9999px',
} as const;

export const shadows = {
  s1: '0 1px 2px rgba(15, 23, 42, 0.05)',
  s2: '0 6px 16px rgba(15, 23, 42, 0.07)',
  s3: '0 14px 40px rgba(15, 23, 42, 0.1)',
  cyan: '0 10px 30px rgba(13, 148, 160, 0.18)',
  cyanStrong: '0 12px 34px rgba(13, 148, 160, 0.24)',
  inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.9)',
} as const;

export const metal = {
  one: '#FFFFFF',
  two: '#E7ECF3',
  three: '#CFD7E2',
} as const;

export const gradient = {
  metal: 'linear-gradient(180deg, #FFFFFF 0%, #E7ECF3 52%, #CFD7E2 100%)',
  metalLine: 'linear-gradient(90deg, transparent 0%, #C2CBD8 18%, #C2CBD8 82%, transparent 100%)',
  cyan: 'linear-gradient(120deg, #0E7490 0%, #0E8FA8 60%, #0C5E73 100%)',
} as const;

export const space = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.5rem',
  6: '2rem',
  7: '3rem',
  8: '4rem',
  9: '6rem',
  10: '8rem',
  11: '12rem',
} as const;

export const layout = {
  containerMax: '80rem',
  containerWide: '90rem',
  contentProse: '72ch',
  headerHeight: '4.5rem',
  headerHeightMobile: '3.75rem',
} as const;

export const easing = {
  outQuart: [0.25, 1, 0.5, 1] as const,
  outExpo: [0.19, 1, 0.22, 1] as const,
  inOutCubic: [0.65, 0, 0.35, 1] as const,
} as const;

export const duration = {
  d1: 0.12,
  d2: 0.2,
  d3: 0.32,
  d4: 0.48,
  d5: 0.8,
  d6: 1.2,
} as const;

export type SteelKey = keyof typeof colors.steel;
export type CyanKey = keyof typeof colors.cyan;
export type SpaceKey = keyof typeof space;
export type RadiusKey = keyof typeof radius;
export type DurationKey = keyof typeof duration;
export type EasingKey = keyof typeof easing;
