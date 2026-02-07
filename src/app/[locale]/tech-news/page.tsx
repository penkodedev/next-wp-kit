// src/app/[locale]/tech-news/page.tsx
import { getGNews } from '@/services/gnews';
import { getPage } from '@/api/wordpressApi';
import localesConfig from '@/i18n/locales.generated.json';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GridGNews from '@/components/layout/content/GridGNews';
import parse from 'html-react-parser';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: 'Tech News - External News',
    description: 'Latest technology news from around the web',
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function TechNewsPage({ params }: PageProps) {
  const { locale } = await params;
  
  // Validate locale
  if (!localesConfig.supportedLocales.includes(locale)) {
    notFound();
  }

  // Fetch GNews
  const news = await getGNews('technology', locale);

  // Fetch WordPress page content for intro
  const wpPage = await getPage('tech-news', locale);

  return (
    <div className="page-fullwidth">
      <section className="page-title">
        <h1>Tech News</h1>
      </section>

      {/* WordPress Page Content */}
      {wpPage && (
        <div className="page-content tech-news-intro">
          {parse(wpPage.content?.rendered || '')}
        </div>
      )}

      {/* GNews Grid */}
      {news.length > 0 ? (
        <GridGNews news={news} cols={4} />
      ) : (
        <article>
          <p>No news available at the moment.</p>
        </article>
      )}
    </div>
  );
}
