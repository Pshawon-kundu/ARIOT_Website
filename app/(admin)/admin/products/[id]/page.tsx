import { notFound, redirect } from 'next/navigation';
import { AuthenticationError, AuthorizationError } from '@/server/auth/errors';
import { getProductForEditor } from '@/server/admin/products/get-product';
import { ProductEditorShell } from '@/components/admin/products/product-editor-shell';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Edit Product — ${id}`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminProductEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let result;
  try {
    result = await getProductForEditor(id);
  } catch (err) {
    if (err instanceof AuthenticationError) redirect('/sign-in');
    if (err instanceof AuthorizationError) redirect('/');
    throw err;
  }

  if (!result) notFound();

  return <ProductEditorShell product={result.product} categories={result.categories} />;
}
