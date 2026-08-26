'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, type Variants } from 'motion/react';
import { Command, Search, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Suggestion {
  label: string;
  href: string;
}

const SUGGESTIONS: ReadonlyArray<Suggestion> = [
  { label: 'Products', href: '/products' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Support', href: '/support' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Request a quote', href: '/quote' },
];

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: -8 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

/**
 * CommandPalette — Ctrl/Cmd+K modal placeholder.
 *
 * Client component that registers a global keyboard listener for
 * `Ctrl+K` / `Cmd+K`. When triggered it opens a modal with a search
 * input and static navigation suggestions. No actual search logic yet;
 * this is the Phase 2 shell.
 *
 * Accessibility (WCAG 2.2 AA):
 *   - role="dialog" + aria-modal when open
 *   - Focus trap within the dialog
 *   - Escape / backdrop click closes
 *   - Input auto-focused on open
 *   - Respects prefers-reduced-motion via Motion's built-in support
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on route change
  const [previousPathname, setPreviousPathname] = useState(pathname);
  if (pathname !== previousPathname) {
    setPreviousPathname(pathname);
    setOpen(false);
  }

  // Global keyboard shortcut: Ctrl/Cmd+K
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  // Focus management + scroll lock when open
  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    if (!panel) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Auto-focus the input after the panel mount animation begins
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 80);
    return () => clearTimeout(timer);
  }, [open]);

  // Focus trap
  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    if (!panel) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }

      if (event.key === 'Tab') {
        const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        aria-hidden
        onClick={handleClose}
        className={cn(
          'bg-bg-overlay fixed inset-0 z-50 backdrop-blur-sm',
          open ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        variants={backdropVariants}
        initial="hidden"
        animate={open ? 'visible' : 'hidden'}
        transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
      />

      {/* Panel */}
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal={open}
        aria-label="Command palette"
        inert={!open || undefined}
        aria-hidden={!open || undefined}
        className={cn(
          'fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh]',
          open ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        variants={panelVariants}
        initial="hidden"
        animate={open ? 'visible' : 'hidden'}
        transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
      >
        <div
          className={cn(
            'mx-auto w-full max-w-lg overflow-hidden rounded-xl',
            'border-steel-700 bg-bg-raised shadow-3 border',
          )}
        >
          {/* Search input row */}
          <div className="border-steel-800 flex items-center gap-3 border-b px-4">
            <Search className="text-steel-400 h-4 w-4 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search pages, products, articles…"
              aria-label="Search"
              className={cn(
                'text-steel-100 h-14 w-full bg-transparent text-base',
                'placeholder:text-steel-400',
                'border-none outline-none',
                'font-sans',
              )}
            />
            <kbd
              aria-hidden
              className={cn(
                'inline-flex h-6 shrink-0 items-center gap-0.5 rounded-md',
                'border-steel-700 bg-bg-elevated border px-1.5',
                'text-steel-400 font-mono text-[11px] font-medium',
              )}
            >
              <Command className="h-3 w-3" />K
            </kbd>
          </div>

          {/* Suggestions */}
          <div className="p-2">
            <p className="text-steel-500 px-2 pt-2 pb-1 font-mono text-[10px] font-medium tracking-[0.18em] uppercase">
              Quick navigation
            </p>
            <nav aria-label="Quick navigation suggestions">
              <ul className="flex flex-col gap-0.5">
                {SUGGESTIONS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={handleClose}
                      className={cn(
                        'flex items-center justify-between rounded-md px-3 py-2.5',
                        'text-steel-200 text-sm',
                        'ease-out-quart transition-colors duration-150',
                        'hover:bg-bg-elevated hover:text-steel-100',
                        'focus-visible:ring-offset-bg-raised focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:outline-none',
                      )}
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="text-steel-500 h-3.5 w-3.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Footer hint */}
          <div className="border-steel-800 flex items-center gap-4 border-t px-4 py-3">
            <span className="text-steel-500 font-mono text-[10px]">
              <kbd className="border-steel-700 bg-bg-elevated text-steel-400 inline-flex h-5 items-center rounded border px-1 text-[10px] font-medium">
                ↑↓
              </kbd>
              <span className="ml-1">Navigate</span>
            </span>
            <span className="text-steel-500 font-mono text-[10px]">
              <kbd className="border-steel-700 bg-bg-elevated text-steel-400 inline-flex h-5 items-center rounded border px-1 text-[10px] font-medium">
                Esc
              </kbd>
              <span className="ml-1">Close</span>
            </span>
          </div>
        </div>
      </motion.div>
    </>
  );
}
