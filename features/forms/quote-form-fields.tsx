'use client';

import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  quoteCategoryValues,
  quoteChannelValues,
  quoteIndustryValues,
  quoteTimelineValues,
  type QuoteInput,
} from '@/lib/validators/quote';

/**
 * Quote-form field groups. Kept private to the forms feature so the
 * outer `QuoteForm` stays focused on orchestration (RHF, submit, status)
 * while these components only render fields.
 */

interface FieldsProps {
  register: UseFormRegister<QuoteInput>;
  errors: FieldErrors<QuoteInput>;
}

const INDUSTRY_LABELS: Record<(typeof quoteIndustryValues)[number], string> = {
  home: 'Homes',
  office: 'Offices',
  institution: 'Institutions',
  industry: 'Small industries',
  other: 'Other',
};

const TIMELINE_LABELS: Record<(typeof quoteTimelineValues)[number], string> = {
  urgent: 'Urgent',
  quarter: 'This quarter',
  planning: 'Planning stage',
};

const CATEGORY_LABELS: Record<(typeof quoteCategoryValues)[number], string> = {
  robotics: 'Robotics',
  iot: 'IoT devices',
  education: 'Education kits',
  custom: 'Custom R&D',
};

const CHANNEL_LABELS: Record<(typeof quoteChannelValues)[number], string> = {
  email: 'Email',
  phone: 'Phone',
  meeting: 'Meeting',
};

function StepLegend({ index, label }: { index: number; label: string }) {
  return (
    <legend className="text-steel-100 mb-4 font-display text-2xl font-semibold tracking-tight">
      <span className="text-cyan-400 font-mono text-sm tracking-[0.18em] uppercase">
        Step {index} ·{' '}
      </span>
      {label}
    </legend>
  );
}

export function QuoteProjectFields({ register, errors }: FieldsProps) {
  return (
    <fieldset className="grid grid-cols-1 gap-5">
      <StepLegend index={1} label="Project" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Industry" required error={errors.industry?.message}>
          {(p) => (
            <Select {...p} {...register('industry')}>
              {quoteIndustryValues.map((value) => (
                <option key={value} value={value}>
                  {INDUSTRY_LABELS[value]}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField label="Timeline" required error={errors.timeline?.message}>
          {(p) => (
            <Select {...p} {...register('timeline')}>
              {quoteTimelineValues.map((value) => (
                <option key={value} value={value}>
                  {TIMELINE_LABELS[value]}
                </option>
              ))}
            </Select>
          )}
        </FormField>
      </div>
      <FormField label="Use case" required error={errors.useCase?.message}>
        {(p) => (
          <Textarea
            {...p}
            {...register('useCase')}
            rows={4}
            placeholder="[What are you trying to automate, monitor, or prototype?]"
          />
        )}
      </FormField>
      <FormField label="Expected scale" error={errors.scaleHint?.message}>
        {(p) => (
          <Input
            {...p}
            {...register('scaleHint')}
            placeholder="[Units / sites / users — optional]"
          />
        )}
      </FormField>
    </fieldset>
  );
}

export function QuoteProductsFields({ register, errors }: FieldsProps) {
  return (
    <fieldset className="grid grid-cols-1 gap-5">
      <StepLegend index={2} label="Products" />
      <FormField
        label="Interested product category"
        required
        error={errors.productCategory?.message}
      >
        {(p) => (
          <Select {...p} {...register('productCategory')}>
            {quoteCategoryValues.map((value) => (
              <option key={value} value={value}>
                {CATEGORY_LABELS[value]}
              </option>
            ))}
          </Select>
        )}
      </FormField>
      <FormField label="Technical notes" error={errors.technicalNotes?.message}>
        {(p) => (
          <Textarea
            {...p}
            {...register('technicalNotes')}
            rows={5}
            placeholder="[Known constraints, preferred protocols, environment details — optional.]"
          />
        )}
      </FormField>
    </fieldset>
  );
}

export function QuoteContactFields({ register, errors }: FieldsProps) {
  return (
    <fieldset className="grid grid-cols-1 gap-5">
      <StepLegend index={3} label="Contact" />
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
        <FormField label="Company" required error={errors.company?.message}>
          {(p) => (
            <Input
              {...p}
              {...register('company')}
              autoComplete="organization"
              placeholder="[Company / institution]"
            />
          )}
        </FormField>
        <FormField label="Role" error={errors.role?.message}>
          {(p) => (
            <Input
              {...p}
              {...register('role')}
              autoComplete="organization-title"
              placeholder="[Role — optional]"
            />
          )}
        </FormField>
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
        <FormField
          label="Preferred contact channel"
          required
          error={errors.preferredChannel?.message}
        >
          {(p) => (
            <Select {...p} {...register('preferredChannel')}>
              {quoteChannelValues.map((value) => (
                <option key={value} value={value}>
                  {CHANNEL_LABELS[value]}
                </option>
              ))}
            </Select>
          )}
        </FormField>
      </div>
    </fieldset>
  );
}
