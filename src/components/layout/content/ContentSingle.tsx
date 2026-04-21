// src/components/layout/content/ContentSingle.tsx

import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import AnimatedArticle from '@/components/animations/framer/AnimatedArticle';
import { TaxonomyTermsList, TaxonomyPost } from '@/components/wordpress/CustomTaxonomies';
import CustomFields from '@/components/wordpress/CustomFields';
import AudioPlayer from '@/components/ui/AudioPlayer';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import PostNav from '@/components/navigation/PostNav';
import Sidebar from '@/components/layout/sidebar/Sidebar';
import ButtonShare from '@/components/ui/ButtonShare';
import ButtonLike from '@/components/ui/ButtonLike';
import PostDate from '@/components/ui/PostDate';
import ButtonCopyLink from '@/components/ui/ButtonCopyLink';
import { WpPageId } from '@/utils/wordpress/WpPageId';
import { processContent } from '@/utils/wordpress/processContent';
import DynamicContent from './DynamicContent';
import YoastJsonLd from '@/components/seo/YoastJsonLd';
import { getTranslatedCptSlug } from '@/utils/config/cptConfig';
import { getAppearanceSettings } from '@/api/wordpressApi';
import type { WpContent } from '@/types/wordpressTypes';
import localesConfig from '@/i18n/locales.generated.json';

type ContentSingleProps = {
  post: WpContent;
  postType: string;   // 'posts', 'news', 'personal', etc.
  locale: string;     // 'es', 'en', etc.
};

/*
 * Template to display a single post from any post type
 * Internally computes backToArchiveUrl and archiveName based on postType and locale
 */
export default async function ContentSingle({
  post,
  postType,
  locale
}: ContentSingleProps) {
  const appearance = await getAppearanceSettings(locale);
  const processedContent = processContent(post.content.rendered);
  const hasForm = post.content.rendered.includes('wpcf7-form');
  const translatedSlug = getTranslatedCptSlug(postType, locale);
  const safeSlug = translatedSlug || postType || 'posts'; // Triple fallback
  const archiveName = safeSlug.charAt(0).toUpperCase() + safeSlug.slice(1);
  const backToArchiveUrl = locale === localesConfig.defaultLocale ? `/${safeSlug}` : `/${locale}/${safeSlug}`;


  return (
    <div className="page-sidebar">
      <YoastJsonLd content={post} />
      <WpPageId id={post.id} />
      <div className="article-sidebar">
        <article className="page-content">
          <Link href={backToArchiveUrl} className="back-to-archive-link">
            <Icons.ArrowLeft size={26} strokeWidth={1} className="arrow-left" />
            {archiveName}
          </Link>

          <section className="page-title">
            <h1>{post.title.rendered}</h1>

            <div className="icons-wrap">
              {appearance?.copyLink !== false && <ButtonCopyLink className="copy-link" />}
              {appearance?.shareButton !== false && (
                <ButtonShare 
                  title={post.title.rendered}
                  description={post.excerpt?.rendered?.replace(/<[^>]*>/g, '')}
                />
              )}
              {appearance?.likeButton !== false && (
                <ButtonLike 
                  postId={post.id}
                  initialLikes={post.likes || 0}
                />
              )}
            </div>
          </section>
          <Breadcrumbs />
          

          {/* AUDIO PLAYER GOOGLE TEXT TO SPEECH (config. CPTs*/}
          {appearance?.ttsEnabled !== false && ['posts', 'recursos', 'noticias'].includes(postType) && post.audio_url && ( 
            <div className="audio-player-section">
              <AudioPlayer
                src={post.audio_url}
                title={post.title.rendered}
                className="resource-audio-player"
              />
            </div>
          )}

          <AnimatedArticle className="custom-article-class" amount={0.5}>
            <PostDate date={post.date} />
            
            <DynamicContent html={processedContent} lang={locale} hasForm={hasForm} />
          </AnimatedArticle>

          {/* // Dynamic custom fields – automatically displayed if they exist */}
          <CustomFields
            cpt={postType}
            locale={locale}
            values={post}
            readOnly={true}
          />

          <TaxonomyPost post={post} taxonomies={['nivel_educativo', 'categoria']} title="Niveles de contenido" link />
        </article>
        
        <PostNav
          postId={post.id}
          postType={postType}
          basePath={backToArchiveUrl}
          locale={locale}
        />
      </div>
      <Sidebar />
    </div>
  );
}
