'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ── Notification model ────────────────────────────────────────────────────────

/**
 * Step 2.3.4 — typed notification model for the admin panel foundation.
 *
 * This is a UI-only model.  No Prisma dependency, no database table, no API.
 * Real notification events (new orders, SLA breaches, payment failures, system
 * alerts) will be wired in a later phase when the relevant admin modules are
 * built.  The model is defined here so future integration has a clear shape to
 * target without reinventing the type.
 */
export type AdminNotificationSeverity = 'info' | 'success' | 'warning' | 'danger';

export interface AdminNotification {
  id: string;
  title: string;
  /** Optional secondary detail line. */
  description?: string;
  /** ISO string or Date object.  Rendered via formatDate() — no relative time
   *  to avoid server/client hydration mismatch. */
  createdAt: string | Date;
  read: boolean;
  /** Drives the severity dot and screen-reader label.  Optional — neutral when
   *  omitted. */
  severity?: AdminNotificationSeverity;
  /** When set, the notification item is rendered as a Next.js Link. */
  href?: string;
}

// ── Date formatting ───────────────────────────────────────────────────────────

/**
 * Format a notification timestamp as an absolute date string.
 *
 * Uses `en-US` locale explicitly so the output is deterministic on both server
 * and client, preventing hydration mismatches.  No relative-time ("5 min ago")
 * since that would differ between server render and first client paint.
 *
 * Returns "—" for invalid dates.
 */
function formatDate(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (Number.isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return '—';
  }
}

// ── Severity helpers ──────────────────────────────────────────────────────────

const SEVERITY_DOT: Record<AdminNotificationSeverity, string> = {
  info: 'bg-cyan-400',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

const SEVERITY_LABEL: Record<AdminNotificationSeverity, string> = {
  info: 'Info',
  success: 'Success',
  warning: 'Warning',
  danger: 'Alert',
};

// ── Notification item (future non-empty state) ────────────────────────────────

/**
 * NotificationItem — renders a single notification in the panel.
 *
 * Step 2.3.4: defined now so the panel handles real data when Phase 3
 * wires the event feed.  Currently not rendered (empty list), but the layout
 * is tested via the component shape.
 *
 * Accessibility: unread state and severity communicated in visible text AND
 * as a screen-reader-only label, not through colour alone.
 */
function NotificationItem({ notification }: { notification: AdminNotification }) {
  const date = formatDate(notification.createdAt);

  const inner = (
    <div
      className={cn(
        'flex gap-3 px-4 py-3',
        'border-steel-800 border-b last:border-b-0',
        notification.href && 'hover:bg-bg-raised transition-colors duration-150',
        !notification.read && 'bg-bg-elevated/40',
      )}
    >
      {/* Severity / read-state dot */}
      <div className="mt-[5px] flex h-3 w-3 shrink-0 items-center justify-center">
        {notification.severity ? (
          <>
            <span
              aria-hidden
              className={cn('block h-2 w-2 rounded-full', SEVERITY_DOT[notification.severity])}
            />
            <span className="sr-only">{SEVERITY_LABEL[notification.severity]}</span>
          </>
        ) : (
          <span
            aria-hidden
            className={cn(
              'block h-2 w-2 rounded-full',
              notification.read ? 'bg-steel-700' : 'bg-steel-400',
            )}
          />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-sm leading-snug',
            notification.read ? 'text-steel-400' : 'text-steel-100 font-medium',
          )}
        >
          {notification.title}
          {!notification.read && <span className="sr-only"> (unread)</span>}
        </p>
        {notification.description && (
          <p className="text-steel-500 mt-0.5 text-xs leading-snug">{notification.description}</p>
        )}
        <p className="text-steel-600 mt-1 font-mono text-[10px]">{date}</p>
      </div>
    </div>
  );

  if (notification.href) {
    return (
      <Link
        href={notification.href}
        className="block focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none focus-visible:ring-inset"
      >
        {inner}
      </Link>
    );
  }
  return inner;
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
      <div className="border-steel-800 bg-bg-raised flex h-12 w-12 items-center justify-center rounded-full border">
        <Bell className="text-steel-600 h-5 w-5" aria-hidden />
      </div>
      <div>
        <p className="text-steel-300 text-sm font-medium">You&apos;re all caught up</p>
        <p className="text-steel-500 mt-1.5 text-xs leading-relaxed">
          System, catalog, order, support, and content notifications will appear here when those
          modules are connected.
        </p>
      </div>
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

interface AdminNotificationsPanelProps {
  notifications: ReadonlyArray<AdminNotification>;
  onClose: () => void;
}

/**
 * AdminNotificationsPanel — Step 2.3.4.
 *
 * Reusable notification dropdown for the admin top bar.  Positioned
 * `absolute top-full right-0` within the notification trigger's `relative`
 * wrapper.  Handles click-outside to close (same pattern as the profile
 * popover).  Escape is handled by the parent AdminShell's global key listener.
 *
 * Currently renders an honest empty state.  Will render real notification items
 * when Phase 3 wires the event feed by passing a non-empty `notifications` array.
 *
 * Width: 360 px on desktop; at most `100vw − 2 rem` on narrow viewports so the
 * panel never overflows the screen on 360 px or 390 px phones.
 */
export function AdminNotificationsPanel({ notifications, onClose }: AdminNotificationsPanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [onClose]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Notifications"
      className={cn(
        'absolute top-full right-0 z-50 mt-2',
        'w-[360px] max-w-[calc(100vw-2rem)]',
        'overflow-hidden rounded-lg',
        'border-steel-800 bg-bg-elevated border',
        'shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
      )}
    >
      {/* Panel header */}
      <div className="border-steel-800 flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-steel-100 text-sm font-semibold">Notifications</h2>
        <span className="text-steel-500 text-xs">
          {unreadCount > 0 ? `${unreadCount} unread` : 'No unread notifications'}
        </span>
      </div>

      {/* Content — scrollable when populated in future phases */}
      <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
        {notifications.length === 0 ? (
          <EmptyState />
        ) : (
          <ul aria-label="Notification list">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <NotificationItem notification={notification} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
