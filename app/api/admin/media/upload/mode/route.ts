import { NextResponse } from 'next/server';
import { resolveProviderName } from '@/server/storage/get-media-storage-provider';
import { requireMediaWrite } from '@/server/storage/upload-context';

/**
 * GET /api/admin/media/upload/mode
 *
 * Server-resolved upload mode (D-068). The client must never choose a storage
 * provider; it reads the active mode here and picks the matching transport
 * (multipart POST for 'local', initiate/presigned-PUT/complete for 'r2').
 * Requires media.write like the upload endpoints it describes.
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
    const provider = resolveProviderName();
    return NextResponse.json({ ok: true, provider });
  } catch {
    return NextResponse.json(
      { ok: false, type: 'not_configured', message: 'Storage provider is not configured.' },
      { status: 503 },
    );
  }
}
