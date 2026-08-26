import { requireProductWrite } from './variant-auth';
import { createProductVariantWithContext } from './create-product-variant-executor';
import type { VariantMutationResult } from './product-variant-mutation-helpers';

/**
 * Create a product variant — Step 2.4.5 (production wrapper).
 *
 * Resolves the caller's identity via `requireProductWrite` (session → RBAC),
 * then delegates to `createProductVariantWithContext`, which re-verifies the
 * permission against the resolved context through the shared authorization
 * boundary and runs the mutation.
 */

export async function createProductVariant(rawInput: unknown): Promise<VariantMutationResult> {
  let ctx;
  try {
    ctx = await requireProductWrite();
  } catch {
    return { ok: false, type: 'forbidden', message: 'Insufficient permissions.' };
  }
  return createProductVariantWithContext(ctx, rawInput);
}
