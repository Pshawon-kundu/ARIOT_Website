'use client';

import { useCallback, useState } from 'react';

export type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

interface UseFormSubmitOptions {
  /** API route handler URL — e.g. `/api/contact`. */
  endpoint: string;
}

interface ApiResponse {
  success?: boolean;
  error?: string;
}

interface UseFormSubmitResult<TPayload> {
  status: FormStatus;
  errorMessage: string | null;
  submit: (data: TPayload) => Promise<boolean>;
  reset: () => void;
}

/**
 * Tiny status-tracked POST helper for our client forms.
 *
 * Keeps the form components free of fetch boilerplate, so each form
 * only handles its own field shape and copy. The hook never reads or
 * stores PII outside the in-flight request body.
 */
export function useFormSubmit<TPayload>(
  options: UseFormSubmitOptions,
): UseFormSubmitResult<TPayload> {
  const { endpoint } = options;
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  const submit = useCallback(
    async (data: TPayload): Promise<boolean> => {
      setStatus('submitting');
      setErrorMessage(null);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const json = (await response
          .json()
          .catch(() => ({}))) as ApiResponse;

        if (!response.ok || !json.success) {
          setStatus('error');
          setErrorMessage(
            json.error ??
              'Something went wrong on our side. Please try again in a moment.',
          );
          return false;
        }

        setStatus('success');
        return true;
      } catch {
        setStatus('error');
        setErrorMessage(
          'Network error — please check your connection and retry.',
        );
        return false;
      }
    },
    [endpoint],
  );

  return { status, errorMessage, submit, reset };
}
