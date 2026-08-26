import { cn } from '@/lib/utils/cn';

/**
 * AdminStatusChip — reusable semantic status indicator for the admin console.
 *
 * Step 2.3.3: visual primitive for displaying operational state on a dark
 * background.  Handles neutral, info, success, warning, danger, pending,
 * and inactive states.
 *
 * Design notes:
 *   - Dark admin tokens only; no public light-theme classes.
 *   - Status is communicated via text label + optional dot (never by color alone).
 *   - Use this for product status, order state, ticket priority, user state, etc.
 *   - Do NOT use for role labels (use the role badge in the profile menu instead).
 *   - Do NOT hardcode business domain logic here — this is a visual primitive.
 *
 * Vs. public `Badge` component:
 *   - `Badge` targets the public marketing site (light theme, blue/cyan accent).
 *   - `AdminStatusChip` targets the dark admin console (dark bg, richer semantics).
 *   Both are correct in their respective contexts; do not substitute one for the other.
 */

export type AdminStatusVariant =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'pending'
  | 'inactive';

export interface AdminStatusChipProps {
  /** Semantic variant — drives color and icon. */
  variant: AdminStatusVariant;
  /** Visible label — always present for accessible status communication. */
  label: string;
  /** Show a small decorative status dot alongside the label. */
  dot?: boolean;
  /** `default` (12px text) or `sm` (10px text, tighter padding). */
  size?: 'default' | 'sm';
  className?: string;
}

const CHIP_STYLES: Record<AdminStatusVariant, string> = {
  neutral: 'bg-bg-elevated text-steel-300 border-steel-700',
  info: 'bg-cyan-faint text-cyan-300 border-cyan-400/20',
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  danger: 'bg-danger/10 text-danger border-danger/30',
  pending: 'bg-warning/10 text-warning border-warning/30',
  inactive: 'bg-bg-elevated text-steel-500 border-steel-800',
};

const DOT_STYLES: Record<AdminStatusVariant, string> = {
  neutral: 'bg-steel-500',
  info: 'bg-cyan-400',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  pending: 'bg-warning',
  inactive: 'bg-steel-700',
};

export function AdminStatusChip({
  variant,
  label,
  dot = false,
  size = 'default',
  className,
}: AdminStatusChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        size === 'sm'
          ? 'px-1.5 py-px font-mono text-[10px] tracking-wide'
          : 'px-2.5 py-0.5 text-xs',
        CHIP_STYLES[variant],
        className,
      )}
    >
      {dot && (
        <span
          aria-hidden
          className={cn('block h-1.5 w-1.5 shrink-0 rounded-full', DOT_STYLES[variant])}
        />
      )}
      {label}
    </span>
  );
}
