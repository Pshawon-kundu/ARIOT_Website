'use client';

import { Loader, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  contactSchema,
  contactTopicValues,
  type ContactInput,
} from '@/lib/validators/contact';
import { FormStatusBanner } from './form-status';
import { useFormSubmit } from './use-form-submit';

const TOPIC_LABELS: Record<(typeof contactTopicValues)[number], string> = {
  sales: 'Sales',
  support: 'Support',
  partnership: 'Partnership',
  press: 'Press',
  other: 'Other',
};

const DEFAULT_VALUES: ContactInput = {
  name: '',
  company: '',
  email: '',
  phone: '',
  topic: 'sales',
  message: '',
};

/**
 * ContactForm — client island powering the `/contact` form. Validates
 * with Zod (mirrors `/api/contact`), shows loading / success / error
 * states, and resets after a successful submission.
 */
export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onBlur',
  });

  const { status, errorMessage, submit } = useFormSubmit<ContactInput>({
    endpoint: '/api/contact',
  });

  const isSubmitting = status === 'submitting';

  const onSubmit = handleSubmit(async (data) => {
    const ok = await submit(data);
    if (ok) {
      reset(DEFAULT_VALUES);
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="grid grid-cols-1 gap-5"
      aria-label="Contact form"
    >
      <FormStatusBanner
        status={status}
        successTitle="Message sent."
        successMessage="An ARIOT team member will reply within one business day."
        errorMessage={errorMessage}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Name" required error={errors.name?.message}>
          {(p) => (
            <Input
              {...p}
              {...register('name')}
              autoComplete="name"
              placeholder="[Your name]"
            />
          )}
        </FormField>
        <FormField label="Company" error={errors.company?.message}>
          {(p) => (
            <Input
              {...p}
              {...register('company')}
              autoComplete="organization"
              placeholder="[Company name]"
            />
          )}
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Email" required error={errors.email?.message}>
          {(p) => (
            <Input
              {...p}
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="[name@company.com]"
            />
          )}
        </FormField>
        <FormField label="Phone" error={errors.phone?.message}>
          {(p) => (
            <Input
              {...p}
              {...register('phone')}
              type="tel"
              autoComplete="tel"
              placeholder="[Optional]"
            />
          )}
        </FormField>
      </div>

      <FormField label="Topic" required error={errors.topic?.message}>
        {(p) => (
          <Select {...p} {...register('topic')}>
            {contactTopicValues.map((topic) => (
              <option key={topic} value={topic}>
                {TOPIC_LABELS[topic]}
              </option>
            ))}
          </Select>
        )}
      </FormField>

      <FormField
        label="Message"
        required
        helper="Include the product, environment, or use case you have in mind."
        error={errors.message?.message}
      >
        {(p) => (
          <Textarea
            {...p}
            {...register('message')}
            rows={6}
            placeholder="[Tell us what you need.]"
          />
        )}
      </FormField>

      <Button
        type="submit"
        size="lg"
        variant="primary"
        className="w-fit"
        disabled={isSubmitting}
        aria-busy={isSubmitting || undefined}
      >
        {isSubmitting ? (
          <Loader className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Send className="h-4 w-4" aria-hidden />
        )}
        {isSubmitting ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  );
}
