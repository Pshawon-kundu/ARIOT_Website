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
    raised: '#F7F9FC',
    elevated: '#FFFFFF',
    overlay: 'rgba(15, 23, 42, 0.45)',
    grid: 'rgba(15, 23, 42, 0.04)',
  },
  steel: {
    50: '#F8FAFC',
    100: '#0F172A',
    200: '#1E293B',
    300: '#334155',
    400: '#475569',
    500: '#64748B',
    600: '#94A3B8',
    700: '#CBD5E1',
    800: '#E2E8F0',
    900: '#F1F5F9',
  },
  cyan: {
    300: '#3B82F6',
    400: '#2563EB',
    500: '#1D4ED8',
    600: '#1E40AF',
    faint: 'rgba(37, 99, 235, 0.08)',
  },
  semantic: {
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
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
  s1: '0 1px 2px rgba(15, 23, 42, 0.06)',
  s2: '0 4px 12px rgba(15, 23, 42, 0.08)',
  s3: '0 12px 32px rgba(15, 23, 42, 0.1)',
  cyan: '0 8px 24px rgba(37, 99, 235, 0.16)',
  cyanStrong: '0 8px 28px rgba(37, 99, 235, 0.22)',
  inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.7)',
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
