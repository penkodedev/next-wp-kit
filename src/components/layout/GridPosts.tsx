// src/components/layout/SingleContentLayout.tsx

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
      <section className="post-grid">
        <div className="post-col col-5">
          <div className="grid-item">

            <div className="grid-item-content">
              <h5>
                <a href="#">Título del recurso</a></h5>
                          
                  <p className="grid-item-excerpt"></p>

              <div className="post-links">
                <a href="#" className="button">Ver y descargar</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}