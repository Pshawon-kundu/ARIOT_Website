import { NextResponse } from 'next/server';
import { getMediaStorageProvider } from '@/server/storage/get-media-storage-provider';
import { requireMediaWrite } from '@/server/storage/upload-context';

/**
 * GET /api/admin/media/storage/health
 *
 * Provider health probe (D-068). Requires media.write (admin-only). Never
 * echoes secrets or absolute filesystem paths.
 */
export async function GET(request: Request) {
  try {
    const auth = await requireMediaWrite(request);
    if (!auth) {
      return NextResponse.json(
        { ok: false, type: 'forbidden', message: 'Upload permission required.' },
        { status: 403 },
      );
    }
    const provider = getMediaStorageProvider();
    const health = await provider.checkHealth();
    return NextResponse.json(
      { ok: health.ok, provider: provider.name, detail: health.detail },
      { status: health.ok ? 200 : 503 },
    );
  } catch {
    return NextResponse.json(
      { ok: false, provider: null, detail: 'Storage provider is not configured.' },
      { status: 503 },
    );
  }
}
