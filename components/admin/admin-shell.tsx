'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, LogOut, Menu, Search } from 'lucide-react';
import type { RoleKey } from '@/lib/generated/prisma/client';
import { cn } from '@/lib/utils/cn';
import { breadcrumbForPath } from './admin-nav';
import { AdminNavRail } from './admin-nav-rail';
import { adminSignOut } from '@/app/(admin)/actions';
import { Popover, EnvironmentChip, initials } from './admin-shell-ui';
import { AdminDensityToggle, type Density } from './admin-density-toggle';
import { AdminNotificationsPanel, type AdminNotification } from './admin-notifications-panel';

// ── Constants ─────────────────────────────────────────────────────────────────

const DENSITY_KEY = 'ariot-admin-density';
/** Pending Phase 3 event feed — replace with server-action-sourced array. */
const EMPTY_NOTIFICATIONS: ReadonlyArray<AdminNotification> = [];
const NOTIF_UNREAD = EMPTY_NOTIFICATIONS.filter((n) => !n.read).length;

function isValidDensity(value: unknown): value is Density {
  return value === 'comfortable' || value === 'compact';
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminUser {
  name: string;
  email: string;
  roles: RoleKey[];
}

interface AdminShellProps {
  user: AdminUser;
  environment: 'development' | 'test' | 'production';
  children: React.ReactNode;
}

/**
 * AdminShell — admin application chrome — Steps 2.3.1 / 2.3.3.
 *
 * Client component: owns interactive chrome (mobile drawer, popovers, density).
 * Authorization is enforced server-side in `app/(admin)/layout.tsx`.
 *
 * Step 2.3.3 additions:
 *   - `.theme-admin` class — explicit dark admin theme boundary. Prevents
 *     accidental adoption of the public `.theme-light` overrides.
 *   - `data-density` attribute — drives CSS custom properties
 *     (`--adm-row-py`, `--adm-leaf-py`, `--adm-gutter`, `--adm-content-py`)
 *     for comfortable / compact density modes via `.theme-admin[data-density=...]`
 *     rules in globals.css.
 *   - Density state persisted to `localStorage` (key: `ariot-admin-density`).
 *   - `AdminDensityToggle` surfaced in the profile menu.
 */
export function AdminShell({ user, environment, children }: AdminShellProps) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Density preference — defaults to comfortable; restored from localStorage
  // on mount.  Starts with 'comfortable' to match SSR output and avoid
  // hydration mismatch.  Invalid or missing stored values are silently ignored.
  const [density, setDensity] = useState<Density>('comfortable');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DENSITY_KEY);
      if (isValidDensity(saved)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDensity(saved);
      }
    } catch {
      // localStorage unavailable — continue with default.
    }
  }, []);

  const handleDensityChange = useCallback((next: Density) => {
    setDensity(next);
    try {
      localStorage.setItem(DENSITY_KEY, next);
    } catch {
      // Persist silently fails — UI still responds correctly.
    }
  }, []);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNavOpen(false);
  }, [pathname]);

  // Close popovers on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setNavOpen(false);
        setProfileOpen(false);
        setNotifOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const crumb = breadcrumbForPath(pathname);

  return (
    <div className="theme-admin bg-bg-base text-steel-100 min-h-dvh" data-density={density}>
      {/* Mobile drawer overlay */}
      {navOpen && (
        <div
          className="bg-bg-overlay fixed inset-0 z-40 lg:hidden"
          aria-hidden="true"
          onClick={() => setNavOpen(false)}
        />
      )}

      {/* Left rail — sticky on desktop, drawer on mobile */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform',
          'border-steel-800 bg-bg-raised flex flex-col border-r',
          'ease-out-quart transition-transform duration-300 lg:translate-x-0',
          navOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Admin navigation"
      >
        <div className="border-steel-800 flex h-14 shrink-0 items-center justify-between border-b px-5">
          <Link
            href="/admin"
            className="font-display text-steel-50 text-base font-semibold tracking-tight"
          >
            ARIOT<span className="text-cyan-400"> Control</span>
          </Link>
          <button
            type="button"
            onClick={() => setNavOpen(false)}
            className="text-steel-400 hover:bg-bg-elevated hover:text-steel-100 rounded-md p-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none lg:hidden"
            aria-label="Close navigation"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
        <AdminNavRail pathname={pathname} onNavigate={() => setNavOpen(false)} />
      </aside>

      {/* Content column */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="border-steel-800 bg-bg-base/80 supports-[backdrop-filter]:bg-bg-base/60 sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 backdrop-blur">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="text-steel-300 hover:bg-bg-elevated hover:text-steel-100 rounded-md p-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex min-w-0 items-center gap-2 text-sm">
            <Link
              href="/admin"
              className="text-steel-400 hover:text-steel-200 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            >
              Control
            </Link>
            <span className="text-steel-600">/</span>
            <span className="text-steel-100 truncate font-medium">{crumb}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Global search — placeholder for a later step */}
            <button
              type="button"
              disabled
              aria-label="Global search (coming soon)"
              title="Global search — coming soon"
              className="border-steel-800 text-steel-600 flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </button>

            {/* Notifications — Step 2.3.4 */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setProfileOpen(false);
                }}
                aria-label="Open notifications"
                aria-haspopup="true"
                aria-expanded={notifOpen}
                className="text-steel-300 hover:bg-bg-elevated hover:text-steel-100 relative rounded-md p-2 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              >
                <Bell className="h-5 w-5" />
                {/* Unread badge — hidden while count is zero */}
                {NOTIF_UNREAD > 0 && (
                  <span
                    aria-hidden
                    className="bg-danger absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full px-0.5 font-mono text-[9px] font-bold text-white"
                  >
                    {NOTIF_UNREAD > 99 ? '99+' : NOTIF_UNREAD > 9 ? '9+' : NOTIF_UNREAD}
                  </span>
                )}
              </button>
              {notifOpen && (
                <AdminNotificationsPanel
                  notifications={EMPTY_NOTIFICATIONS}
                  onClose={() => setNotifOpen(false)}
                />
              )}
            </div>

            {/* Profile menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setNotifOpen(false);
                }}
                className="hover:bg-bg-elevated flex items-center gap-2 rounded-md p-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                aria-label="Account menu"
                aria-expanded={profileOpen}
              >
                <span className="bg-cyan-faint flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-cyan-300">
                  {initials(user.name)}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="text-steel-100 block text-sm leading-tight font-medium">
                    {user.name}
                  </span>
                </span>
              </button>
              {profileOpen && (
                <Popover onClose={() => setProfileOpen(false)} align="right">
                  <div className="px-4 py-3">
                    <p className="text-steel-100 text-sm font-medium">{user.name}</p>
                    <p className="text-steel-400 truncate text-xs">{user.email}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="border-steel-700 bg-bg-elevated text-steel-300 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase"
                        >
                          {role.replace(/_/g, ' ').toLowerCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                  <AdminDensityToggle value={density} onChange={handleDensityChange} />
                  <form action={adminSignOut} className="border-steel-800 border-t">
                    <button
                      type="submit"
                      className="text-steel-200 hover:bg-bg-elevated hover:text-steel-100 flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </form>
                </Popover>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main
          id="main-content"
          className="max-w-container-wide mx-auto w-full px-4 py-6 sm:px-6 sm:py-8"
          style={{ paddingTop: 'var(--adm-content-py)', paddingBottom: 'var(--adm-content-py)' }}
        >
          {children}
        </main>

        {/* Footer */}
        <footer className="border-steel-800 border-t px-4 py-3 sm:px-6">
          <div className="text-steel-500 flex items-center gap-3 text-xs">
            <span>ARIOT Control</span>
            <span className="text-steel-700">·</span>
            <EnvironmentChip environment={environment} />
          </div>
        </footer>
      </div>
    </div>
  );
}
