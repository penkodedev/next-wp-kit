// src/components/layout/footer/FooterLastPosts.tsx

import { getAllContent } from '@/api/wordpressApi';
import Link from 'next/link';
import type { WpContent } from '@/types/wordpressTypes';
import { Icons } from "@/components/ui/Icons";
import { Suspense } from 'react';

interface FooterLastPostsProps {
  postType?: string;
  perPage?: number;
}

async function FooterLastPostsContent({
  postType = 'recursos', // Post Type to show
  perPage = 4 // Number of posts
}: FooterLastPostsProps) {
  // Fetch the latest posts
  const params = `?per_page=${perPage}&page=1&_embed&orderby=date&order=desc`;
  const latestPosts = await getAllContent<WpContent>(postType, params);

  return (
    <>
      {(!latestPosts || latestPosts.length === 0) ? (
        <p>No se encontraron {postType} recientes.</p>
      ) : (
        <ul>
          {latestPosts.map((post) => (
            <li key={post.id}>
              <Link href={`/${postType}/${post.slug}`}>
                <Icons.Check size={20} strokeWidth={3} className="list-icon" />
                {post.title.rendered}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function FooterLastPostsSkeleton() {
  return (
    <ul>
      {Array.from({ length: 4 }).map((_, index) => (
        <li key={index}>
          <div className="skeleton-link">
            <div className="skeleton-icon"></div>
            <div className="skeleton-text"></div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function FooterLastPosts(props: FooterLastPostsProps) {
  return (
    <div className="footer-resources">
      <h3>Últimos {props.postType || 'recursos'}</h3>
      <Suspense fallback={<FooterLastPostsSkeleton />}>
        <FooterLastPostsContent {...props} />
      </Suspense>
    </div>
  );
}