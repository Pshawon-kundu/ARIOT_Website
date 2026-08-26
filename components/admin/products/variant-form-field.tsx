'use client';

/**
 * Shared form field primitives for the variant add/edit form — Step 2.4.5.
 */

export function FormField({
  label,
  required,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-steel-200 mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
      {help && <p className="text-steel-500 mt-1 text-xs">{help}</p>}
    </div>
  );
}

export function formInputClass(readOnly: boolean) {
  return `w-full rounded-md border border-steel-700 bg-bg-elevated px-3 py-2 text-sm text-steel-100 placeholder:text-steel-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${readOnly ? 'cursor-not-allowed opacity-60' : ''}`;
}
