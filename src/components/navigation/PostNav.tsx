// src/components/ui/PostNavigation.tsx
"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getPostNavigation } from '@/api/wordpressApi';
import type { PostNavigation } from '@/types/wordpressTypes';

type PostNavigationProps = {
  postId: number;
  postType: string;
};

export default function PostNavigationComponent({ postId, postType }: PostNavigationProps) {
  const [navigation, setNavigation] = useState<PostNavigation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (postId && postType) {
      getPostNavigation(postId, postType).then(data => {
        setNavigation(data);
        setIsLoading(false);
      });
    }
  }, [postId, postType]);

  // if (isLoading) {
  //   return <div className="post-navigation container"><p>Cargando navegación...</p></div>;
  // }

  if (!navigation || (!navigation.previous && !navigation.next)) {
    return null; // No renderizar nada si no hay post anterior ni siguiente
  }


/**********************************************
      START BUILDING THE PAGE CONTENT HTML
**********************************************/
  return (
    <nav className="post-navigation container">
      {navigation.previous && (
        <div className="nav-previous">
          <Link href={`/${postType}/${navigation.previous.slug}`} rel="prev">← {navigation.previous.title}</Link>
        </div>
      )}
      {navigation.next && (
        <div className="nav-next">
          <Link href={`/${postType}/${navigation.next.slug}`} rel="next">{navigation.next.title} →</Link>
        </div>
      )}
    </nav>
  );
}