'use client';

import { Loader, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { quoteSchema, type QuoteInput } from '@/lib/validators/quote';
import { FormStatusBanner } from './form-status';
import {
  QuoteContactFields,
  QuoteProductsFields,
  QuoteProjectFields,
} from './quote-form-fields';
import { useFormSubmit } from './use-form-submit';

const DEFAULT_VALUES: QuoteInput = {
  industry: 'industry',
  timeline: 'planning',
  useCase: '',
  scaleHint: '',
  productCategory: 'robotics',
  technicalNotes: '',
  name: '',
  company: '',
  role: '',
  email: '',
  phone: '',
  preferredChannel: 'email',
};

/**
 * QuoteForm — single-page submission of the three logical groups
 * defined in PAGE_BLUEPRINTS §9. Step navigation is intentionally
 * deferred: react-hook-form already validates the full payload on
 * submit, and a single scrollable form keeps the conversion path
 * shorter on mobile.
 */
export function QuoteForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onBlur',
  });

  const { status, errorMessage, submit } = useFormSubmit<QuoteInput>({
    endpoint: '/api/quote',
  });

  const isSubmitting = status === 'submitting';
  const isSuccess = status === 'success';

  const onSubmit = handleSubmit(async (data) => {
    await submit(data);
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Quote request form"
      className="flex flex-col gap-8"
    >
      <FormStatusBanner
        status={status}
        successTitle="Quote request received."
        successMessage="An ARIOT engineer will reach out within one business day to clarify scope and the next practical step."
        errorTitle="We couldn't send your quote request"
        errorMessage={errorMessage}
      />

      {!isSuccess ? (
        <>
          <QuoteProjectFields register={register} errors={errors} />
          <QuoteProductsFields register={register} errors={errors} />
          <QuoteContactFields register={register} errors={errors} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-steel-400 text-sm">
              We treat every quote as an engineering question first.
            </p>
            <Button
              type="submit"
              size="lg"
              variant="primary"
              disabled={isSubmitting}
              aria-busy={isSubmitting || undefined}
            >
              {isSubmitting ? (
                <Loader className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Send className="h-4 w-4" aria-hidden />
              )}
              {isSubmitting ? 'Sending quote request…' : 'Send quote request'}
            </Button>
          </div>
        </>
      ) : null}
    </form>
  );
}
