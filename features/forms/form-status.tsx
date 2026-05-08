'use client';

import { Check, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { FormStatus } from './use-form-submit';

interface FormStatusBannerProps {
  status: FormStatus;
  /** Title shown when status === 'success'. */
  successTitle: string;
  /** Body copy shown on success. */
  successMessage: string;
  /** Title shown when status === 'error'. Defaults to a generic phrase. */
  errorTitle?: string;
  /** Body copy shown on error (typically the API message). */
  errorMessage?: string | null;
  className?: string;
}

/**
 * FormStatusBanner — accessible status / error region for form
 * submissions. Lives just inside the form so screen readers announce
 * the result without a layout jump.
 */
export function FormStatusBanner({
  status,
  successTitle,
  successMessage,
  errorTitle = "We couldn't send that just yet",
  errorMessage,
  className,
}: FormStatusBannerProps) {
  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'border-cyan-faint bg-cyan-faint flex items-start gap-3 rounded-md border p-4',
          className,
        )}
      >
        <span
          aria-hidden
          className="bg-cyan-400 text-bg-base mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
        >
          <Check className="h-3.5 w-3.5" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-steel-100 text-sm font-semibold">
            {successTitle}
          </p>
          <p className="text-steel-300 text-sm">{successMessage}</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div
        role="alert"
        className={cn(
          'border-danger/40 bg-danger/10 flex items-start gap-3 rounded-md border p-4',
          className,
        )}
      >
        <TriangleAlert
          aria-hidden
          className="text-danger mt-0.5 h-5 w-5 shrink-0"
        />
        <div className="flex flex-col gap-1">
          <p className="text-steel-100 text-sm font-semibold">{errorTitle}</p>
          <p className="text-steel-300 text-sm">
            {errorMessage ??
              'Please try again or use one of the contact channels above.'}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
