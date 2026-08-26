'use client';

/**
 * Admin shell UI utilities — Step 2.3.3.
 *
 * Extracted from admin-shell.tsx to keep that file under the 300-line limit
 * while making room for the density state management added in Step 2.3.3.
 *
 * Contains: Popover floating panel, EnvironmentChip, initials helper.
 * All are admin-only and intentionally dark — no public light-theme classes.
 */

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

// ── Popover ───────────────────────────────────────────────────────────────────

interface PopoverProps {
  children: React.ReactNode;
  align: 'left' | 'right';
  onClose: () => void;
}

export function Popover({ children, align, onClose }: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="menu"
      className={cn(
        'absolute top-full z-50 mt-2 w-64 overflow-hidden rounded-lg',
        'border-steel-800 bg-bg-raised shadow-2 border',
        align === 'right' ? 'right-0' : 'left-0',
      )}
    >
      {children}
    </div>
  );
}

// ── EnvironmentChip ───────────────────────────────────────────────────────────

interface EnvironmentChipProps {
  environment: 'development' | 'test' | 'production';
}

export function EnvironmentChip({ environment }: EnvironmentChipProps) {
  const styles =
    environment === 'production'
      ? 'border-success-border text-success'
      : 'border-warning-border text-warning';
  return (
    <span
      className={cn(
        'rounded-full border px-2 py-0.5',
        'font-mono text-[10px] font-medium tracking-wide uppercase',
        styles,
      )}
    >
      {environment}
    </span>
  );
}

// ── Utilities ─────────────────────────────────────────────────────────────────

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join('') || 'A';
}
