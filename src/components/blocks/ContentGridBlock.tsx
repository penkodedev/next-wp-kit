import Link from 'next/link';
import { fetchAPI } from '@/api/client';
import GridPosts from '@/components/layout/content/GridPosts';
import type { WpBlock, WpContent } from '@/types/wordpressTypes';
import localesConfig from '@/i18n/locales.generated.json';

interface ContentGridBlockProps {
  block: WpBlock;
  lang?: string;
}

type DisplayMode = 'simple' | 'links' | 'image' | 'excerpt';

export default async function ContentGridBlock({ block, lang }: ContentGridBlockProps) {
  const postType      = (block.attrs.postType      as string)      || 'post';
  const perPage       = (block.attrs.postsPerPage   as number)      || 6;
  const displayMode   = (block.attrs.displayMode    as DisplayMode) || 'simple';
  const excerptLength = (block.attrs.excerptLength  as number)      || 120;

  const needsEmbed = displayMode === 'image' || displayMode === 'excerpt';
  const query = `/wp/v2/${postType}?per_page=${perPage}&status=publish${needsEmbed ? '&_embed' : '&_fields=id,slug,title,link'}${lang ? `&lang=${lang}` : ''}`;

  const posts = await fetchAPI<WpContent[]>(query);
  if (!posts || posts.length === 0) return null;

  const basePath = lang && lang !== localesConfig.defaultLocale
    ? `/${lang}/${postType}`
    : `/${postType}`;

  // Image and excerpt modes reuse GridPosts (PostCard HTML structure)
  if (displayMode === 'image') {
    return <GridPosts posts={posts} basePath={basePath} excerptLength={0} />;
  }

  if (displayMode === 'excerpt') {
    return <GridPosts posts={posts} basePath={basePath} excerptLength={excerptLength} />;
  }

  // Simple and links modes
  return (
    <ul className={`content-grid__list content-grid__list--${displayMode}`}>
      {posts.map((post) => (
        <li key={post.id} className="content-grid__item">
          {displayMode === 'links' ? (
            <Link href={`${basePath}/${post.slug}`}>{post.title.rendered}</Link>
          ) : (
            <span>{post.title.rendered}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
