'use client';

import { useCallback, useMemo, useState } from 'react';
import { Plus, Pencil, Archive, AlertCircle, RefreshCw, Package } from 'lucide-react';
import type { AdminProductVariantsDto } from '@/server/admin/products/get-product-variants';
import type { VariantFieldsInput } from '@/server/admin/products/product-variant-schema';
import { VariantForm } from './variant-form';

/**
 * Product variants editor — Step 2.4.5.
 *
 * Renders the variant matrix (responsive table; option groups appear as
 * key:value chips) and orchestrates create/update/archive mutations via
 * POST /api/admin/products/variants with optimistic concurrency on the
 * product's updatedAt token.
 */

interface Props {
  variants: AdminProductVariantsDto;
}

export function ProductVariantsEditor({ variants: initial }: Props) {
  const [variants, setVariants] = useState(initial.variants);
  const [token, setToken] = useState(initial.updatedAt);
  const [error, setError] = useState<string | null>(null);
  const [isConflict, setIsConflict] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const canEdit = initial.canEditVariants;

  const optionKeys = useMemo(
    () =>
      Array.from(new Set(variants.flatMap((variant) => Object.keys(variant.optionValues)))).sort(),
    [variants],
  );

  const mutate = useCallback(
    async (action: string, payload: Record<string, unknown>) => {
      setError(null);
      setIsConflict(false);
      setLoading(true);
      try {
        const res = await fetch('/api/admin/products/variants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            payload: { ...payload, productId: initial.productId, expectedUpdatedAt: token },
          }),
        });
        const result = await res.json();
        if (result.ok) {
          setToken(result.updatedAt);
          return result;
        }
        if (result.type === 'conflict') {
          setIsConflict(true);
          setError('This product was updated elsewhere. Reload to see the latest state.');
        } else {
          setError(result.message ?? 'An error occurred.');
        }
        return null;
      } catch {
        setError('Network error. Please try again.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, initial.productId],
  );

  function handleCreate(data: VariantFieldsInput) {
    void mutate('createVariant', { data }).then((result) => {
      if (!result) return;
      const now = new Date().toISOString();
      setVariants((prev) => [
        ...prev,
        { id: result.variantId, ...data, createdAt: now, updatedAt: now },
      ]);
      setAdding(false);
    });
  }

  function handleUpdate(variantId: string, data: VariantFieldsInput) {
    void mutate('updateVariant', { variantId, data }).then((result) => {
      if (!result) return;
      setVariants((prev) =>
        prev.map((variant) => {
          if (variant.id === variantId) return { ...variant, ...data };
          return data.isDefault ? { ...variant, isDefault: false } : variant;
        }),
      );
      setEditingId(null);
    });
  }

  function handleArchive(variantId: string) {
    void mutate('archiveVariant', { variantId }).then((result) => {
      if (!result) return;
      setVariants((prev) => prev.filter((variant) => variant.id !== variantId));
      setArchivingId(null);
      if (editingId === variantId) setEditingId(null);
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-steel-50 text-lg font-semibold">Variants</h2>
          <p className="text-steel-500 text-sm">
            {variants.length} active {variants.length === 1 ? 'variant' : 'variants'}
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => {
              setAdding(true);
              setEditingId(null);
            }}
            disabled={adding}
            className="inline-flex items-center gap-2 rounded-md bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" aria-hidden /> Add variant
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-800/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          <span className="flex-1">{error}</span>
          {isConflict && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 rounded border border-red-800 px-2 py-1 text-xs text-red-200 hover:bg-red-900/30 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            >
              <RefreshCw className="h-3 w-3" aria-hidden /> Reload
            </button>
          )}
        </div>
      )}

      {adding && (
        <VariantForm
          mode="create"
          busy={loading}
          onCancel={() => setAdding(false)}
          onSubmit={handleCreate}
        />
      )}

      {variants.length === 0 ? (
        <div className="border-steel-800 bg-bg-elevated rounded-lg border p-8 text-center">
          <Package className="text-steel-600 mx-auto h-8 w-8" aria-hidden />
          <p className="text-steel-400 mt-3 text-sm">
            No variants yet. Add one to define option groups (e.g. Color, Voltage) and per-variant
            SKU, price, stock, and barcode.
          </p>
        </div>
      ) : (
        <div className="border-steel-800 overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-steel-800 text-steel-500 border-b text-xs tracking-wider uppercase">
                <th className="px-3 py-2.5 font-medium">Options</th>
                <th className="px-3 py-2.5 font-medium">Name</th>
                <th className="px-3 py-2.5 font-medium">SKU</th>
                <th className="px-3 py-2.5 font-medium">Price</th>
                <th className="px-3 py-2.5 font-medium">Stock</th>
                <th className="px-3 py-2.5 font-medium">Barcode</th>
                <th className="px-3 py-2.5 font-medium">Default</th>
                <th className="px-3 py-2.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) =>
                editingId === variant.id ? (
                  <tr key={variant.id}>
                    <td colSpan={8} className="p-3">
                      <VariantForm
                        mode="update"
                        initial={variant}
                        busy={loading}
                        onCancel={cancelEdit}
                        onSubmit={(data) => handleUpdate(variant.id, data)}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={variant.id} className="border-steel-800/60 border-b last:border-b-0">
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(variant.optionValues).map(([key, value]) => (
                          <span
                            key={key}
                            className="bg-steel-800 text-steel-300 rounded px-2 py-0.5 text-xs"
                          >
                            <span className="text-steel-500">{key}: </span>
                            {value}
                          </span>
                        ))}
                        {optionKeys.length === 0 && (
                          <span className="text-steel-600 text-xs">No options</span>
                        )}
                      </div>
                    </td>
                    <td className="text-steel-100 px-3 py-3">{variant.name}</td>
                    <td className="text-steel-300 px-3 py-3 font-mono text-xs">{variant.sku}</td>
                    <td className="text-steel-200 px-3 py-3">
                      {variant.priceMinor !== null ? (
                        <span>
                          {variant.priceMinor}
                          {variant.currency ? ` ${variant.currency}` : ''}
                        </span>
                      ) : (
                        <span className="text-steel-500">Inherits</span>
                      )}
                    </td>
                    <td className="text-steel-200 px-3 py-3">{variant.stock}</td>
                    <td className="text-steel-300 px-3 py-3 font-mono text-xs">
                      {variant.barcode ?? <span className="text-steel-600">—</span>}
                    </td>
                    <td className="px-3 py-3">
                      {variant.isDefault ? (
                        <span className="rounded bg-cyan-400/10 px-2 py-0.5 text-xs font-medium text-cyan-300">
                          Default
                        </span>
                      ) : (
                        <span className="text-steel-600">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {!canEdit ? (
                        <span className="text-steel-600 text-xs">Read-only</span>
                      ) : archivingId === variant.id ? (
                        <span className="inline-flex items-center gap-2 text-xs">
                          <span className="text-steel-400">Archive?</span>
                          <button
                            type="button"
                            onClick={() => handleArchive(variant.id)}
                            disabled={loading}
                            className="text-danger rounded px-2 py-0.5 hover:bg-red-950/40 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setArchivingId(null)}
                            disabled={loading}
                            className="text-steel-400 hover:text-steel-200 rounded px-2 py-0.5 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(variant.id);
                              setAdding(false);
                            }}
                            aria-label={`Edit ${variant.name}`}
                            className="text-steel-400 rounded p-1.5 hover:text-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                          >
                            <Pencil className="h-4 w-4" aria-hidden />
                          </button>
                          <button
                            type="button"
                            onClick={() => setArchivingId(variant.id)}
                            aria-label={`Archive ${variant.name}`}
                            className="text-steel-400 hover:text-danger rounded p-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                          >
                            <Archive className="h-4 w-4" aria-hidden />
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
