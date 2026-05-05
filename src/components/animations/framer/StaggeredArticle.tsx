"use client";

import { useRef, useMemo } from 'react';
import { motion, useInView } from "framer-motion";
import parse from 'html-react-parser';

type StaggeredArticleProps = {
  htmlContent: string;
  className?: string;
  staggerDelay?: number;
};

export default function StaggeredArticle({
  htmlContent,
  className = "article-content",
  staggerDelay = 0.15
}: StaggeredArticleProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  // Procesar HTML para animar elementos individuales
  const processedContent = useMemo(() => {
    if (!htmlContent) return null;

    let elementIndex = 0;

    const parsed = parse(htmlContent, {
      replace: (domNode: any) => {
        // Animar elementos de bloque comunes
        if (domNode.type === 'tag' && ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'ul', 'ol'].includes(domNode.name)) {
          const content = domNode.children ? domNode.children.map((child: any) => {
            if (child.type === 'text') return child.data;
            if (child.type === 'tag') return parse(child.children ? child.children.map((c: any) => c.data || '').join('') : '');
            return '';
          }).join('') : '';

          return (
            <motion.div
              key={`stagger-${elementIndex++}`}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                ease: "easeOut",
                delay: (elementIndex - 1) * staggerDelay
              }}
              style={{ marginBottom: '1rem' }}
              dangerouslySetInnerHTML={{ __html: `<${domNode.name}>${content}</${domNode.name}>` }}
            />
          );
        }
      }
    });

    return parsed;
  }, [htmlContent, inView, staggerDelay]);

  return (
    <article ref={ref} className={className}>
      {processedContent}
    </article>
  );
}
