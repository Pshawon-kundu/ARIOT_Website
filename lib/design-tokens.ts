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
    base: '#08090B',
    raised: '#0E1014',
    elevated: '#15181E',
    overlay: 'rgba(8, 9, 11, 0.72)',
    grid: 'rgba(255, 255, 255, 0.04)',
  },
  steel: {
    50: '#F5F7FA',
    100: '#E4E8EE',
    200: '#C7CDD6',
    300: '#A3ABB7',
    400: '#7C8593',
    500: '#5B6472',
    600: '#3F4753',
    700: '#2A3038',
    800: '#1B1F25',
    900: '#11141A',
  },
  cyan: {
    300: '#7CE9FF',
    400: '#3DD8F7',
    500: '#10B6D9',
    600: '#0C8DAA',
    faint: 'rgba(61, 216, 247, 0.08)',
  },
  semantic: {
    success: '#34D399',
    warning: '#F5B449',
    danger: '#F26B6B',
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
  s1: '0 1px 2px rgba(0, 0, 0, 0.45)',
  s2: '0 4px 12px rgba(0, 0, 0, 0.45)',
  s3: '0 12px 32px rgba(0, 0, 0, 0.55)',
  cyan: '0 0 24px rgba(61, 216, 247, 0.35)',
  cyanStrong: '0 0 24px rgba(61, 216, 247, 0.45)',
  inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.04)',
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
