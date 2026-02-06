// src/services/gnews.ts

export interface GNewsArticle {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
  source?: {
    name: string;
    url: string;
  };
}

// Mapeo Next.js locale → Gnews lang
const LOCALE_TO_GNEWS_LANG: Record<string, string> = {
  es: 'es',
  en: 'en',
  pt: 'pt',
};

/**
 * Fetch news from GNews API
 * @param query - Search term (default: 'technology')
 * @param locale - Next.js locale (default: 'es')
 * @returns Array of GNews articles
 */
export async function getGNews(
  query = 'technology',
  locale = 'es'
): Promise<GNewsArticle[]> {
  const gnewsLang = LOCALE_TO_GNEWS_LANG[locale] ?? 'en';

  // Verificar API key
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    console.warn('GNEWS_API_KEY not configured');
    return [];
  }

  const params = new URLSearchParams({
    q: query,
    lang: gnewsLang,
    max: '8',
    token: apiKey,
  });

  try {
    const res = await fetch(
      `https://gnews.io/api/v4/search?${params.toString()}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      console.error(`GNews API error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return (data.articles || []) as GNewsArticle[];
  } catch (error) {
    console.error('Failed to fetch GNews:', error);
    return [];
  }
}
