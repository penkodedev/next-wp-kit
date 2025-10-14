// src/components/content/SingleContentLayout.tsx

import type { WpContent } from '@/types/wordpressTypes';
import DOMPurify from 'isomorphic-dompurify';

type SingleContentProps = {
  content: WpContent;
};

export default function SingleContent({ content }: SingleContentProps) {
  // Limpiamos el HTML para evitar ataques XSS
  const cleanContent = DOMPurify.sanitize(content.content.rendered);
  

/**********************************************
      START BUILDING THE PAGE CONTENT HTML
**********************************************/
  return (
    <>
      <article className="single-content">
        <h1>{content.title.rendered}</h1>
        <div dangerouslySetInnerHTML={{ __html: cleanContent }} />
      </article>
    </>
  );
}