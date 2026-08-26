import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Label } from './label';

interface FormFieldRenderProps {
  id: string;
  'aria-describedby': string | undefined;
  'aria-invalid': boolean | undefined;
}

interface FormFieldProps {
  /** Visible label text. Omit for unlabelled controls (e.g. search box). */
  label?: string;
  /** Additional class for the label element (e.g. 'sr-only' for visually hidden labels). */
  labelClassName?: string;
  /** Append a cyan required indicator to the label. */
  required?: boolean;
  /** Helper text rendered below the control when there is no error. */
  helper?: ReactNode;
  /** Error text. When set, helper is hidden and aria-invalid is applied. */
  error?: ReactNode;
  className?: string;
  /**
   * Render-prop. Receives a stable id and the aria props you should spread
   * onto the form control.
   *
   * @example
   *   <FormField label="Email" error={errors.email?.message}>
   *     {(p) => <Input type="email" {...p} {...register('email')} />}
   *   </FormField>
   */
  children: (props: FormFieldRenderProps) => ReactNode;
}

/**
 * FormField — composes a label + control + helper / error line.
 * Wires an auto-generated id, ties helper/error to the control via
 * aria-describedby, and toggles aria-invalid on error.
 *
 * Designed for react-hook-form integration in Sub-turn 5; works
 * standalone today.
 */
export function FormField({
  label,
  labelClassName,
  required,
  helper,
  error,
  className,
  children,
}: FormFieldProps) {
  const reactId = useId();
  const id = `field-${reactId}`;
  const helperId = helper ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;
  const invalid = Boolean(error);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <Label htmlFor={id} required={required} className={labelClassName}>
          {label}
        </Label>
      ) : null}

      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': invalid || undefined,
      })}

      {error ? (
        <p id={errorId} className="text-danger text-xs">
          {error}
        </p>
      ) : helper ? (
        <p id={helperId} className="text-steel-400 text-xs">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
