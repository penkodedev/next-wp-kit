import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import localesConfig from '@/i18n/locales.generated.json';
import { getSiteInfo } from '@/api/wordpressApi';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const postType = searchParams.get('post_type');
  const lang = searchParams.get('lang');
  const token = searchParams.get('token');

  if (!id || !postType) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  // (Opcional) Validar el token aquí
  // if (!isValidToken(token)) return NextResponse.json({ error: 'Invalid token' }, { status: 403 });

  // Activa el modo preview
  cookies().set('nextjs.preview.mode', 'true', { path: '/' });
  cookies().set('nextjs.preview.data', JSON.stringify({ id, postType, lang, token }), { path: '/' });

  // Fetch al endpoint de WP para obtener el slug real
  let wpApiUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/${postType}s/${id}`;
  if (lang) wpApiUrl += `?lang=${lang}`;

  let slug = '';
  let fetchError = '';
  try {
    const res = await fetch(wpApiUrl);
    if (res.ok) {
      const data = await res.json();
      slug = data.slug;
    } else {
      fetchError = `WP API error: ${res.status} ${res.statusText}`;
    }
  } catch (err) {
    fetchError = `Fetch exception: ${err}`;
  }

  // Construir la URL pública
  const siteInfo = await getSiteInfo();
  const defaultLocale = siteInfo?.i18n?.default_locale || localesConfig.defaultLocale;
  
  let redirectUrl = '/';
  if (lang && lang !== defaultLocale) redirectUrl += lang + '/';
  if (slug) {
    redirectUrl += slug + '/';
  } else {
    // fallback
    redirectUrl += 'preview/' + postType + '/' + id;
  }

  // Si no hay slug, mostrar error en JSON para debug
  if (!slug) {
    return NextResponse.json(
      {
        error: 'No slug found for this post',
        wpApiUrl,
        fetchError,
        id,
        postType,
        lang,
        token,
      },
      { status: 500 }
    );
  }

  return NextResponse.redirect(redirectUrl);
}
