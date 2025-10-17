"use client";

import Link from "next/link";
import Image from "next/image";
import type { WpContent } from "@/types/wordpressTypes";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface PostCardProps {
  item: WpContent;
  basePath: string;
  excerptLength?: number; // Prop opcional para la longitud del extracto
}
/**
 * Crea un extracto de texto plano a partir de contenido HTML.
 * Prioriza el extracto explícito, si no, lo genera del contenido principal.
 * @param {WpContent} content - El objeto de contenido de WP.
 * @param {number} length - La longitud máxima del extracto.
 * @returns {string} El extracto de texto plano.
 */
function createExcerpt(content: WpContent, length: number): string {
  // Prioriza el extracto explícito si existe, si no, usa el contenido principal.
  const sourceHtml = content.excerpt?.rendered || content.content.rendered;

  // 1. Elimina todas las etiquetas HTML para obtener texto plano.
  const plainText = sourceHtml.replace(/<[^>]+>/g, "");

  // 2. Si el texto es más largo que la longitud deseada, córtalo y añade puntos suspensivos.
  if (plainText.length > length) {
    return plainText.substring(0, length) + "...";
  }

  // 3. Si no, devuelve el texto plano tal cual.
  return plainText;
}

export default function PostCard({
  item,
  basePath,
  excerptLength = 150,
}: PostCardProps) {
  const featuredMedia = item._embedded?.["wp:featuredmedia"]?.[0];
  const imageUrl =
    featuredMedia?.media_details?.sizes?.large?.source_url ||
    featuredMedia?.source_url;
  const excerptText = createExcerpt(item, excerptLength);

  // Framer Motion: animar al entrar en viewport
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  /**********************************************
      START BUILDING THE PAGE CONTENT HTML
**********************************************/
  return (
    <motion.article
      ref={ref}
      className="post-card"
      whileHover={{ scale: 1.056 }}
      initial={{ opacity: 0, y: 80, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`${basePath}/${item.slug}`} className="post-card-link">
        {imageUrl && (
          <div
            className="post-card-image"
            style={{
              position: "relative",
              aspectRatio: "16 / 9",
            }}
          >
            <Image
              src={imageUrl}
              alt={featuredMedia?.alt_text || item.title.rendered}
              fill
              style={{ objectFit: "cover" }}
            />

          </div>
        )}
</Link>
        <div className="post-card-content">
          <h3 className="post-card-title">{item.title.rendered}</h3>
          {excerptText && <p className="post-card-excerpt">{excerptText}</p>}
          <div className="post-card-actions">
            <Link
              href={`${basePath}/${item.slug}`}
              className="button post-card-read-more"
            >
              Leer más
            </Link>
          </div>
        </div>
      
    </motion.article>
  );
}
