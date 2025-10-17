// src/components/navigation/PostNav.tsx

import Link from 'next/link';
import { getPostNavigation } from '@/api/wordpressApi';
import { Icons } from '@/components/ui/Icons';

type PostNavigationProps = {
  postId: number;
  postType: string;
  basePath: string; // Añadimos la ruta base del CPT (ej: "/recursos")
};

/**
 * A Server Component that fetches and displays previous/next post navigation.
  * It fetches data on the server, providing better performance and SEO.
 */
export default async function PostNav({ postId, postType, basePath }: PostNavigationProps) {
  const navigation = await getPostNavigation(postId, postType);

  if (!navigation || (!navigation.previous && !navigation.next)) {
    return null; // Don't render anything if there's no previous or next post
  }


/**********************************************
      START BUILDING THE PAGE CONTENT HTML
**********************************************/
  return (
    <nav className="post-navigation">

      {navigation.previous && (
        <div className="nav-previous">
        <Link href={`${basePath}/${navigation.previous.slug}`} rel="prev" className="prev-link">
          <Icons.ArrowLeft size={26} strokeWidth={1} className="arrow-left" />
          {navigation.previous.title}
        </Link>
      </div>
      )}

      {navigation.next && (
        <div className="nav-next">
        <Link href={`${basePath}/${navigation.next.slug}`} rel="next" className="next-link">
            {navigation.next.title}
            <Icons.ArrowRight size={26} strokeWidth={1} className="arrow-right" />
        </Link>
      </div>
      )}

    </nav>
  );
}