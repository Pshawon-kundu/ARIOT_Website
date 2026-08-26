import { notFound, redirect } from 'next/navigation';
import { AuthenticationError, AuthorizationError } from '@/server/auth/errors';
import { getProductVariants } from '@/server/admin/products/get-product-variants';
import { ProductVariantsShell } from '@/components/admin/products/product-variants-shell';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Variants — ${id}`, robots: { index: false, follow: false } };
}

export default async function AdminProductVariantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let result;
  try {
    result = await getProductVariants(id);
  } catch (err) {
    if (err instanceof AuthenticationError) redirect('/sign-in');
    if (err instanceof AuthorizationError) redirect('/');
    throw err;
  }
  if (!result) notFound();
  return <ProductVariantsShell variants={result} />;
}
