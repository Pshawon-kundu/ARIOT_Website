'use client';

import { Loader, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { newsletterSchema, type NewsletterInput } from '@/lib/validators/newsletter';
import { cn } from '@/lib/utils/cn';
import { trackEvent } from '@/lib/analytics';
import { FormStatusBanner } from './form-status';
import { useFormSubmit } from './use-form-submit';

interface NewsletterFormProps {
  /** Where this form lives, e.g. 'footer' or 'blog'. Sent to the API
   *  for analytics-only context. */
  source: string;
  /** Visual flavor — `footer` is denser, `inline` widens for blog CTAs. */
  variant?: 'footer' | 'inline';
  className?: string;
}

/**
 * NewsletterForm — small client island for newsletter sign-ups. Mirrors
 * `/api/newsletter` validation, supports two visual variants for the
 * footer and the blog CTA without duplicating UI logic.
 */
export function NewsletterForm({ source, variant = 'inline', className }: NewsletterFormProps) {
  const defaults: NewsletterInput = { email: '', source };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: defaults,
    mode: 'onBlur',
  });

  const { status, errorMessage, submit } = useFormSubmit<NewsletterInput>({
    endpoint: '/api/newsletter',
  });

  const isSubmitting = status === 'submitting';

  const onSubmit = handleSubmit(async (data) => {
    const ok = await submit(data);
    if (ok) {
      trackEvent('Newsletter Subscribed');
      reset(defaults);
    }
  });

  const isFooter = variant === 'footer';

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Newsletter sign-up"
      className={cn('flex flex-col gap-3', className)}
    >
      <div className={cn('flex flex-col gap-2', !isFooter && 'sm:flex-row sm:items-start')}>
        <FormField
          className={cn('flex-1', isFooter && 'w-full')}
          label="Email"
          labelClassName={isFooter ? undefined : 'sr-only'}
          error={errors.email?.message}
        >
          {(p) => (
            <Input
              {...p}
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={!isFooter ? 'h-12 sm:h-12' : undefined}
            />
          )}
        </FormField>
        <input type="hidden" {...register('source')} />

        <Button
          type="submit"
          size={isFooter ? 'md' : 'lg'}
          variant="primary"
          disabled={isSubmitting}
          aria-busy={isSubmitting || undefined}
          className={cn(!isFooter && 'sm:self-stretch', isFooter && 'w-full')}
        >
          {isSubmitting ? (
            <Loader className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Mail className="h-4 w-4" aria-hidden />
          )}
          {isSubmitting ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </div>

      <FormStatusBanner
        status={status}
        successTitle="You're on the list."
        successMessage="We'll send a quiet, well-edited update when there's something engineered worth reading."
        errorMessage={errorMessage}
      />

      {status === 'idle' || status === 'submitting' ? (
        <p className="text-steel-400 text-xs">
          One email when notes ship — unsubscribe whenever you want.
        </p>
      ) : null}
    </form>
  );
}
