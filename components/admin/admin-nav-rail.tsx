'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { adminNav, isLeafActive } from './admin-nav';

interface AdminNavRailProps {
  /** Current pathname — passed from the AdminShell to avoid a second
   *  usePathname() subscription in this component. */
  pathname: string;
  /**
   * Optional callback fired when the user activates an enabled nav link.
   * Used by the mobile admin drawer to close itself on navigation.
   */
  onNavigate?: () => void;
}

/**
 * AdminNavRail — grouped, collapsible admin navigation rail.
 *
 * Step 2.3.2: expands the flat Step-2.3.1 nav into proper groups with leaf
 * links, collapse/expand, honest "Soon" disabled items, and reliable active
 * state detection.
 *
 * Visual rules (ADMIN_DASHBOARD_PLAN §2.2):
 *   - Dark admin tokens only; no public light-theme classes.
 *   - No emoji icons — Lucide only.
 *   - Disabled items: not keyboard-focusable, not styled as links, "Soon"
 *     label communicates state in text (not colour alone).
 *   - Active leaf: cyan-faint background + cyan-300 text + aria-current="page".
 *   - Group with active child: text-steel-100 header (brighter, not cyan).
 *
 * Collapse state is in-session only (resets on full page reload).
 * All groups default to expanded so the full structure is visible on first use.
 */
export function AdminNavRail({ pathname, onNavigate }: AdminNavRailProps) {
  // Collapse state keyed by group label.  Default all groups open.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const entry of adminNav) {
      if (entry.kind === 'group') initial[entry.label] = true;
    }
    return initial;
  });

  const toggle = (label: string) => setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <nav className="flex flex-1 flex-col overflow-y-auto p-3" aria-label="Admin navigation">
      {adminNav.map((entry, index) => {
        /* ── Single top-level link (Overview) ── */
        if (entry.kind === 'link') {
          const active = pathname === entry.href;
          const Icon = entry.icon;
          return (
            <div key={entry.label}>
              <Link
                href={entry.href}
                aria-current={active ? 'page' : undefined}
                onClick={onNavigate}
                className={cn(
                  // adm-nav-link: density-sensitive vertical padding (globals.css)
                  'adm-nav-link',
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
                  'ease-out-quart transition-colors duration-200',
                  'focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none',
                  active
                    ? 'bg-cyan-faint text-cyan-300'
                    : 'text-steel-200 hover:bg-bg-elevated hover:text-steel-100',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {entry.label}
              </Link>
              {/* Thin separator between the Overview link and the first group */}
              {index === 0 && adminNav.length > 1 && (
                <div aria-hidden className="border-steel-800 my-2 border-t" />
              )}
            </div>
          );
        }

        /* ── Collapsible group ── */
        const Icon = entry.icon;
        const isOpen = openGroups[entry.label] ?? true;
        const hasActiveChild = entry.items.some(
          (leaf) => Boolean(leaf.href) && isLeafActive(pathname, leaf.href!, leaf.soon),
        );

        return (
          <div key={entry.label} className="flex flex-col">
            {/* Group toggle button */}
            <button
              type="button"
              onClick={() => toggle(entry.label)}
              aria-expanded={isOpen}
              className={cn(
                // adm-nav-group-btn: density-sensitive vertical padding (globals.css)
                'adm-nav-group-btn',
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
                'ease-out-quart transition-colors duration-200',
                'focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none',
                hasActiveChild
                  ? 'text-steel-100'
                  : 'text-steel-400 hover:bg-bg-elevated hover:text-steel-200',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span className="flex-1 text-left">{entry.label}</span>
              <ChevronDown
                className={cn(
                  'text-steel-600 h-3.5 w-3.5 shrink-0 transition-transform duration-200',
                  isOpen && 'rotate-180',
                )}
                aria-hidden
              />
            </button>

            {/* Leaf items — shown when group is expanded */}
            {isOpen && (
              <div className="mt-0.5 mb-0.5 ml-7 flex flex-col gap-0.5">
                {entry.items.map((leaf) => {
                  const leafActive = leaf.href
                    ? isLeafActive(pathname, leaf.href, leaf.soon)
                    : false;

                  // Disabled / soon item — rendered as a non-interactive span.
                  // Not keyboard-focusable; status conveyed in text ("Soon"),
                  // not colour alone (WCAG 2.2 1.4.1).
                  if (!leaf.href || leaf.soon) {
                    return (
                      <span
                        key={leaf.label}
                        aria-disabled="true"
                        title={`${leaf.label} — coming in a future step`}
                        className={cn(
                          // adm-nav-leaf: density-sensitive vertical padding (globals.css)
                          'adm-nav-leaf',
                          'flex cursor-default items-center justify-between select-none',
                          'text-steel-600 rounded-md px-3 py-1.5 text-sm',
                        )}
                      >
                        {leaf.label}
                        <span
                          aria-label="coming soon"
                          className={cn(
                            'border-steel-800 ml-2 shrink-0 rounded border',
                            'px-1.5 py-0.5 font-mono text-[9px] font-medium',
                            'text-steel-700 tracking-wide uppercase',
                          )}
                        >
                          Soon
                        </span>
                      </span>
                    );
                  }

                  // Enabled leaf link
                  return (
                    <Link
                      key={leaf.label}
                      href={leaf.href}
                      aria-current={leafActive ? 'page' : undefined}
                      onClick={onNavigate}
                      className={cn(
                        // adm-nav-leaf: density-sensitive vertical padding (globals.css)
                        'adm-nav-leaf',
                        'flex items-center rounded-md px-3 py-1.5 text-sm',
                        'ease-out-quart transition-colors duration-200',
                        'focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none',
                        leafActive
                          ? 'bg-cyan-faint text-cyan-300'
                          : 'text-steel-300 hover:bg-bg-elevated hover:text-steel-100',
                      )}
                    >
                      {leaf.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
