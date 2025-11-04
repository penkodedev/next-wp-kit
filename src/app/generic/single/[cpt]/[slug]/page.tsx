// src/app/generic/single/[cpt]/[slug]/page.tsx
// Generic single page for any CPT

import { getContentBySlug } from "@/api/wordpressApi";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Sidebar from "@/components/layout/Sidebar";
import { generateSeoMetadata } from "@/utils/seo";
import type { WpContent } from "@/types/wordpressTypes";
import { processContent } from "@/utils/processContent";
import { WpPageId } from "@/utils/WpPageId";
import PostNav from "@/components/navigation/PostNav";
import { Icons } from "@/components/ui/Icons";
import Link from "next/link";
import AnimatedArticle from "@/components/animations/AnimatedArticle";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";

type GenericCptPageProps = {
  params: {
    cpt: string;
    slug: string;
  };
};

export async function generateMetadata({
  params,
}: GenericCptPageProps): Promise<Metadata> {
  const post = await getContentBySlug<WpContent>(params.cpt, params.slug);
  if (!post) {
    return {};
  }
  return generateSeoMetadata(post);
}

export default async function GenericCptPage({ params }: GenericCptPageProps) {
  const post = await getContentBySlug<WpContent>(params.cpt, params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="page-sidebar">
      <WpPageId id={post.id} />
      <main>
        <article className="entry-content">
          <Link href={`/${params.cpt}`} className="back-to-archive-link">
            <Icons.ArrowLeft size={26} strokeWidth={1} className="arrow-left" />
            Back to {params.cpt.charAt(0).toUpperCase() + params.cpt.slice(1)}
          </Link>

          <section className="page-title">
            <h1>{post.title.rendered}</h1>

            <div className="icons-wrap">
              <Icons.Share2
                size={21}
                strokeWidth={1.5}
                className="icons-page-title icon-share"
              />
              <Icons.Heart
                size={21}
                strokeWidth={1.5}
                className="icons-page-title icon-heart"
              />
            </div>
          </section>
          <Breadcrumbs />
          <AnimatedArticle className="custom-article-class" amount={0.5}>
            <div
              dangerouslySetInnerHTML={{
                __html: processContent(post.content.rendered),
              }}
            />
          </AnimatedArticle>
        </article>
        <PostNav
          postId={post.id}
          postType={post.type}
          basePath={`/${params.cpt}`}
        />
      </main>
      <Sidebar />
    </div>
  );
}