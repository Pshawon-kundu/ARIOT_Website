'use client';

import { useEffect, useRef, useState } from 'react';
import { Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { AdminProductDetailsDto } from '@/server/admin/products/get-product';
import type { UpdateProductDetailsResult } from '@/server/admin/products/update-product-details';
import {
  normalizeSlug,
  SALES_TYPES,
  CURRENCIES,
} from '@/server/admin/products/product-details-schema';
import {
  createSaveQueue,
  type QueueState,
  type SaveResult,
  type SaveQueueController,
} from '@/lib/admin/product-save-queue';

/**
 * Product Details editor — Step 2.4.3.
 *
 * Uses createSaveQueue() from lib/admin/product-save-queue.ts for
 * single-flight request scheduling. No duplicate inline queue logic.
 */

interface Props {
  product: AdminProductDetailsDto;
  categories: Array<{ id: string; name: string }>;
}

interface FormState {
  name: string;
  slug: string;
  sku: string;
  tagline: string;
  description: string;
  brand: string;
  categoryId: string;
  salesType: string;
  priceMinor: string;
  currency: string;
}

function dtoToForm(p: AdminProductDetailsDto): FormState {
  return {
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    tagline: p.tagline ?? '',
    description: p.description ?? '',
    brand: p.brand,
    categoryId: p.categoryId,
    salesType: p.salesType,
    priceMinor: p.priceMinor ?? '',
    currency: p.currency ?? '',
  };
}

function formToPayload(form: FormState) {
  return {
    ...form,
    tagline: form.tagline || null,
    description: form.description || null,
    priceMinor: form.priceMinor || null,
    currency: form.currency || null,
  };
}

export function ProductDetailsEditor({ product, categories }: Props) {
  const [form, setForm] = useState<FormState>(() => dtoToForm(product));
  const [baseline, setBaseline] = useState<FormState>(() => dtoToForm(product));
  const [saveState, setSaveState] = useState<QueueState>('idle');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [slugManual, setSlugManual] = useState(false);
  const queueRef = useRef<SaveQueueController<FormState> | null>(null);

  const canEdit = product.canEdit;
  const isDirty = JSON.stringify(form) !== JSON.stringify(baseline);
  const displayState: QueueState = isDirty && saveState === 'idle' ? 'dirty' : saveState;

  // Initialize queue on mount (effect — not during render)
  useEffect(() => {
    if (!canEdit) return;
    const q = createSaveQueue<FormState>({
      initialToken: product.updatedAt,
      debounceMs: 1000,
      mutate: async (snapshot, token) => {
        const body = {
          productId: product.id,
          expectedUpdatedAt: token,
          data: formToPayload(snapshot),
        };
        try {
          const res = await fetch('/api/admin/products/update-details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const result: UpdateProductDetailsResult = await res.json();
          if (result.ok) {
            setBaseline(snapshot);
            return { ok: true, updatedAt: result.updatedAt };
          }
          if (result.type === 'validation') {
            setFieldErrors(result.fieldErrors);
            if (result.formError) setFormError(result.formError);
          } else if (result.type === 'conflict') {
            setFormError(result.message);
          } else if (result.type === 'duplicate') {
            setFieldErrors({ [result.field]: [result.message] });
          } else {
            setFormError('message' in result ? result.message : 'An error occurred.');
          }
          return { ok: false, type: result.type } as SaveResult & { ok: false };
        } catch {
          setFormError('Network error. Please try again.');
          return { ok: false, type: 'error' };
        }
      },
      onStateChange: (state) => {
        setSaveState(state);
        if (state === 'saved') {
          setTimeout(() => setSaveState((s) => (s === 'saved' ? 'idle' : s)), 2000);
        }
      },
      onTokenUpdate: () => {},
    });
    queueRef.current = q;
    return () => {
      q.dispose();
      queueRef.current = null;
    };
    // Only initialize once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Schedule saves when form changes (via effect)
  useEffect(() => {
    if (!canEdit || !isDirty || saveState === 'conflict') return;
    queueRef.current?.schedule(form);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  // Beforeunload warning
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'name' && !slugManual) next.slug = normalizeSlug(value);
      return next;
    });
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  }

  function handleSlugChange(value: string) {
    setSlugManual(true);
    updateField('slug', normalizeSlug(value));
  }

  function handleManualSave() {
    if (!canEdit || !isDirty) return;
    setFieldErrors({});
    setFormError(null);
    queueRef.current?.flush();
  }

  const readOnly = !canEdit;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <SaveIndicator state={displayState} formError={formError} />
        {canEdit && (
          <button
            type="button"
            onClick={handleManualSave}
            disabled={!isDirty || saveState === 'saving'}
            className="inline-flex items-center gap-2 rounded-md bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" aria-hidden /> Save
          </button>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleManualSave();
        }}
        className="space-y-5"
      >
        <Field label="Name" required error={fieldErrors['name']}>
          <input
            type="text"
            value={form.name}
            readOnly={readOnly}
            onChange={(e) => updateField('name', e.target.value)}
            className={inputClass(readOnly)}
            maxLength={200}
          />
        </Field>
        <Field
          label="Slug"
          required
          error={fieldErrors['slug']}
          help="URL-safe identifier. Auto-generated from name unless edited manually."
        >
          <input
            type="text"
            value={form.slug}
            readOnly={readOnly}
            onChange={(e) => handleSlugChange(e.target.value)}
            className={inputClass(readOnly)}
            maxLength={200}
          />
        </Field>
        <Field label="SKU" required error={fieldErrors['sku']}>
          <input
            type="text"
            value={form.sku}
            readOnly={readOnly}
            onChange={(e) => updateField('sku', e.target.value)}
            className={inputClass(readOnly)}
            maxLength={60}
          />
        </Field>
        <Field label="Tagline" error={fieldErrors['tagline']} help="Max 140 characters.">
          <input
            type="text"
            value={form.tagline}
            readOnly={readOnly}
            onChange={(e) => updateField('tagline', e.target.value)}
            className={inputClass(readOnly)}
            maxLength={140}
          />
        </Field>
        <Field label="Description" error={fieldErrors['description']}>
          <textarea
            value={form.description}
            readOnly={readOnly}
            rows={5}
            onChange={(e) => updateField('description', e.target.value)}
            className={inputClass(readOnly) + ' resize-y'}
            maxLength={10000}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Brand" error={fieldErrors['brand']}>
            <input
              type="text"
              value={form.brand}
              readOnly={readOnly}
              onChange={(e) => updateField('brand', e.target.value)}
              className={inputClass(readOnly)}
              maxLength={100}
            />
          </Field>
          <Field label="Category" required error={fieldErrors['categoryId']}>
            <select
              value={form.categoryId}
              disabled={readOnly}
              onChange={(e) => updateField('categoryId', e.target.value)}
              className={inputClass(readOnly)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Sales type" error={fieldErrors['salesType']}>
            <select
              value={form.salesType}
              disabled={readOnly}
              onChange={(e) => updateField('salesType', e.target.value)}
              className={inputClass(readOnly)}
            >
              {SALES_TYPES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Currency" error={fieldErrors['currency']}>
            <select
              value={form.currency}
              disabled={readOnly}
              onChange={(e) => updateField('currency', e.target.value)}
              className={inputClass(readOnly)}
            >
              <option value="">None</option>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field
          label="Price (minor units)"
          error={fieldErrors['priceMinor']}
          help="Enter in minor units (paisa/cents). E.g. 10000 = 100.00."
        >
          <input
            type="text"
            inputMode="numeric"
            value={form.priceMinor}
            readOnly={readOnly}
            onChange={(e) => updateField('priceMinor', e.target.value.replace(/[^0-9]/g, ''))}
            className={inputClass(readOnly)}
          />
        </Field>
        <div className="border-steel-800 bg-bg-base rounded-md border p-3">
          <p className="text-steel-500 mb-1 text-xs font-medium tracking-wider uppercase">Status</p>
          <p className="text-steel-200 text-sm">{product.status}</p>
          <p className="text-steel-500 mt-1 text-xs">
            Publishing and archival actions are managed separately.
          </p>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string[];
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
      {help && !error?.length && <p className="text-steel-500 mt-1 text-xs">{help}</p>}
      {error?.map((e, i) => (
        <p key={i} className="text-danger mt-1 text-xs">
          {e}
        </p>
      ))}
    </div>
  );
}

function SaveIndicator({ state, formError }: { state: QueueState; formError: string | null }) {
  if (state === 'saving')
    return (
      <span className="text-steel-400 inline-flex items-center gap-1.5 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Saving…
      </span>
    );
  if (state === 'saved')
    return (
      <span className="text-success inline-flex items-center gap-1.5 text-sm">
        <CheckCircle className="h-4 w-4" aria-hidden /> Saved
      </span>
    );
  if (state === 'error' || state === 'conflict')
    return (
      <span className="text-danger inline-flex items-center gap-1.5 text-sm">
        <AlertCircle className="h-4 w-4" aria-hidden /> {formError ?? 'Save failed'}
      </span>
    );
  if (state === 'dirty') return <span className="text-steel-500 text-sm">Unsaved changes</span>;
  return <span className="text-steel-600 text-sm">Up to date</span>;
}

function inputClass(readOnly: boolean) {
  return `w-full rounded-md border border-steel-700 bg-bg-elevated px-3 py-2 text-sm text-steel-100 placeholder:text-steel-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${readOnly ? 'cursor-not-allowed opacity-60' : ''}`;
}
