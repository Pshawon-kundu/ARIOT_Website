import { notFound, redirect } from 'next/navigation';
import { AuthenticationError, AuthorizationError } from '@/server/auth/errors';
import { getProductMedia } from '@/server/admin/products/get-product-media';
import { ProductMediaShell } from '@/components/admin/products/product-media-shell';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Media — ${id}`, robots: { index: false, follow: false } };
}

export default async function AdminProductMediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let result;
  try {
    result = await getProductMedia(id);
  } catch (err) {
    if (err instanceof AuthenticationError) redirect('/sign-in');
    if (err instanceof AuthorizationError) redirect('/');
    throw err;
  }
  if (!result) notFound();
  return <ProductMediaShell media={result} />;
}
