import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { getMediaStorageProvider } from '@/server/storage/get-media-storage-provider';
import { getMimeForExtension } from '@/server/admin/media/media-policy';
import { LocalMediaStorageProvider } from '@/server/storage/local-media-storage';
import { parsePublicMediaKey } from '@/server/storage/upload-keys';

/**
 * GET /media/[...segments] — public delivery for the `local` provider (D-068).
 *
 * Maps the URL path onto a canonical public storageKey
 * (`public/products/{images|videos}/{yyyy}/{mm}/{id}.{ext}`), serves the file
 * from MEDIA_LOCAL_ROOT with correct Content-Type/Length, immutable caching,
 * and HTTP Range support (video seeking). Only active when the storage
 * provider is `local`; for other providers this route 404s (media is served
 * from the provider's own CDN instead).
 *
 * Safety: keys are re-parsed through the strict parser, paths are resolved
 * under the provider root (traversal-rejected), `tmp/` is never reachable,
 * and there is no directory listing. MEDIA_LOCAL_ROOT is never leaked.
 */
export const runtime = 'nodejs';

const CACHE_CONTROL = 'public, max-age=31536000, immutable';
const MAX_RANGE_LENGTH = 10 * 1024 * 1024;

type SegmentContext = { params: Promise<{ segments: string[] }> };

function parseRange(header: string, size: number): { start: number; end: number } | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;
  const [, rawStart, rawEnd] = match;
  if (rawStart === '' && rawEnd === '') return null;
  let start: number;
  let end: number;
  if (rawStart === '') {
    // Suffix range: last N bytes.
    const suffix = Number(rawEnd);
    if (!Number.isFinite(suffix) || suffix <= 0) return null;
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(rawStart);
    end = rawEnd === '' ? size - 1 : Number(rawEnd);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) return null;
  }
  if (start >= size) return null;
  end = Math.min(end, size - 1);
  return { start, end };
}

async function serve(request: Request, segments: string[], headOnly: boolean): Promise<Response> {
  const provider = getMediaStorageProvider();
  if (!(provider instanceof LocalMediaStorageProvider)) {
    return new Response(null, { status: 404 });
  }

  const storageKey = `public/${segments.join('/')}`;
  const parsed = parsePublicMediaKey(storageKey);
  if (!parsed) return new Response(null, { status: 404 });

  let filePath: string;
  try {
    filePath = provider.resolvePath(storageKey);
  } catch {
    return new Response(null, { status: 404 });
  }

  const info = await stat(filePath).catch(() => null);
  if (!info || !info.isFile()) return new Response(null, { status: 404 });

  const mime = getMimeForExtension(parsed.ext);
  if (!mime) return new Response(null, { status: 404 });

  const baseHeaders: Record<string, string> = {
    'Content-Type': mime,
    'Cache-Control': CACHE_CONTROL,
    'Accept-Ranges': 'bytes',
  };

  const rangeHeader = request.headers.get('range');
  if (rangeHeader) {
    const range = parseRange(rangeHeader, info.size);
    if (!range || range.end - range.start + 1 > MAX_RANGE_LENGTH) {
      return new Response(null, {
        status: 416,
        headers: { 'Content-Range': `bytes */${info.size}` },
      });
    }
    const headers = {
      ...baseHeaders,
      'Content-Range': `bytes ${range.start}-${range.end}/${info.size}`,
      'Content-Length': String(range.end - range.start + 1),
    };
    if (headOnly) return new Response(null, { status: 206, headers });
    return new Response(
      createReadStream(filePath, {
        start: range.start,
        end: range.end,
      }) as unknown as BodyInit,
      { status: 206, headers },
    );
  }

  const headers = { ...baseHeaders, 'Content-Length': String(info.size) };
  if (headOnly) return new Response(null, { status: 200, headers });
  return new Response(createReadStream(filePath) as unknown as BodyInit, {
    status: 200,
    headers,
  });
}

export async function GET(request: Request, ctx: SegmentContext) {
  const { segments } = await ctx.params;
  return serve(request, segments, false);
}

export async function HEAD(request: Request, ctx: SegmentContext) {
  const { segments } = await ctx.params;
  return serve(request, segments, true);
}
