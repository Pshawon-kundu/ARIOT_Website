import { requireProductRead } from './variant-auth';
import { getProductVariantsWithContext } from './get-product-variants-executor';
import type { AdminProductVariantsDto } from './get-product-variants-executor';

/**
 * Product variants loader — Step 2.4.5 (production wrapper).
 *
 * Resolves the caller's identity via `requireProductRead` (session → RBAC),
 * then delegates to `getProductVariantsWithContext`, which re-verifies the
 * permission against the resolved context through the shared authorization
 * boundary and returns the DTO. Throws AuthenticationError/AuthorizationError
 * when unauthenticated / lacking products.read (handled by the page).
 */

export async function getProductVariants(
  productId: string,
): Promise<AdminProductVariantsDto | null> {
  const ctx = await requireProductRead();
  return getProductVariantsWithContext(ctx, productId);
}

export type {
  AdminProductVariantDto,
  AdminProductVariantsDto,
} from './get-product-variants-executor';
