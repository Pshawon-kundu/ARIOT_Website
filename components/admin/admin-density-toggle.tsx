'use client';

import { cn } from '@/lib/utils/cn';

export type Density = 'comfortable' | 'compact';

interface AdminDensityToggleProps {
  /** Currently active density preference. */
  value: Density;
  /** Called with the newly selected density whenever the user toggles. */
  onChange: (next: Density) => void;
}

/**
 * AdminDensityToggle — segmented control for selecting admin density mode.
 *
 * Step 2.3.3: lives in the profile popover so it is always reachable without
 * cluttering the top bar.  Two explicit labeled buttons (not icon-only) ensure
 * the control is accessible and self-explanatory.
 *
 * The parent (AdminShell) owns the state and handles localStorage persistence;
 * this component is a pure controlled UI element.
 *
 * Density reference (ADMIN_DASHBOARD_PLAN §2.3):
 *   Comfortable — ~40 px rows, 16 px gutter (default)
 *   Compact     — ~32 px rows, 12 px gutter
 */
export function AdminDensityToggle({ value, onChange }: AdminDensityToggleProps) {
  return (
    <div
      className="border-steel-800 flex items-center gap-3 border-t px-4 py-2.5"
      role="group"
      aria-label="Navigation density"
    >
      <span className="text-steel-400 flex-1 text-xs">Density</span>

      <div className="border-steel-700 flex overflow-hidden rounded border">
        <button
          type="button"
          aria-pressed={value === 'comfortable'}
          onClick={() => onChange('comfortable')}
          className={cn(
            'px-2.5 py-1 text-[11px] font-medium transition-colors duration-150',
            'focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none',
            value === 'comfortable'
              ? 'bg-bg-elevated text-steel-100'
              : 'text-steel-500 hover:text-steel-300',
          )}
        >
          Comfortable
        </button>

        <button
          type="button"
          aria-pressed={value === 'compact'}
          onClick={() => onChange('compact')}
          className={cn(
            'border-steel-700 border-l px-2.5 py-1 text-[11px] font-medium transition-colors duration-150',
            'focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none',
            value === 'compact'
              ? 'bg-bg-elevated text-steel-100'
              : 'text-steel-500 hover:text-steel-300',
          )}
        >
          Compact
        </button>
      </div>
    </div>
  );
}
