import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

const KNOWN_TAGS = ['site-info', 'all-posts', 'all-pages', 'all-menus', 'taxonomies'];

/**
 * On-demand revalidation webhook for WordPress → Next.js.
 *
 * WordPress calls this endpoint (via wp_remote_post) whenever
 * content changes (save_post, update_option, nav_menu_updated, etc.)
 *
 * Body JSON:
 *   { secret, tag?, tags?, path? }
 *
 * - tag   (string)   → revalidateTag(tag)
 * - tags  (string[]) → revalidateTag for each
 * - path  (string)   → revalidatePath(path)
 *
 * If none of tag/tags/path is provided, all known tags are revalidated.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { secret, tag, tags, path } = body as {
      secret?: string;
      tag?: string;
      tags?: string[];
      path?: string;
    };

    if (!REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: 'REVALIDATE_SECRET is not configured on the server' },
        { status: 500 },
      );
    }

    if (secret !== REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    const revalidated: string[] = [];

    if (tag) {
      revalidateTag(tag);
      revalidated.push(`tag:${tag}`);
    }

    if (Array.isArray(tags)) {
      for (const t of tags) {
        revalidateTag(t);
        revalidated.push(`tag:${t}`);
      }
    }

    if (path) {
      revalidatePath(path);
      revalidated.push(`path:${path}`);
    }

    // If nothing specific was requested, revalidate all known tags.
    if (!tag && !tags?.length && !path) {
      for (const t of KNOWN_TAGS) {
        revalidateTag(t);
        revalidated.push(`tag:${t}`);
      }
    }

    return NextResponse.json({ revalidated, now: Date.now() });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 },
    );
  }
}
