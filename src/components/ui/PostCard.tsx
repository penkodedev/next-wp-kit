"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { WpContent } from "@/types/wordpressTypes";
import { useInView } from "framer-motion";

interface PostCardProps {
  item: WpContent;
  basePath: string;
  excerptLength?: number;
  imageLink?: boolean;
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
  // length === 0 significa sin límite → texto completo.
  if (length > 0 && plainText.length > length) {
    return plainText.substring(0, length) + "...";
  }

  // 3. Si no, devuelve el texto plano tal cual.
  return plainText;
}

export default function PostCard({
  item,
  basePath,
  excerptLength = 150,
  imageLink = true,
}: PostCardProps) {
  const featuredMedia = item._embedded?.["wp:featuredmedia"]?.[0];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mediaDetails = featuredMedia as any;
  const imageUrl =
    mediaDetails?.media_details?.sizes?.large?.source_url ||
    featuredMedia?.source_url;
  const excerptText = createExcerpt(item, excerptLength);

  // Estado para controlar cuándo animar (permite re-animación)
  const [isVisible, setIsVisible] = useState(false);

  // Hook para detectar cuando el card entra/sale de vista
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, amount: 0.1 });

  useEffect(() => {
    setIsVisible(inView);
  }, [inView]);


/**********************************************
      START BUILDING THE POST CARD
**********************************************/
  return (
    <article
      ref={ref}
      className="post-card"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
      }}
    >
      {imageUrl && (
        imageLink ? (
          <Link href={`${basePath}/${item.slug}`} className="post-card-link">
            <div
              className="post-card-image"
              style={{ position: "relative", aspectRatio: "16 / 10" }}
            >
              <Image
                src={imageUrl}
                alt={mediaDetails?.alt_text || item.title.rendered}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: "cover", objectPosition: "center center" }}
              />
            </div>
          </Link>
        ) : (
          <div
            className="post-card-image"
            style={{ position: "relative", aspectRatio: "16 / 10" }}
          >
            <Image
              src={imageUrl}
              alt={mediaDetails?.alt_text || item.title.rendered}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "cover", objectPosition: "center center" }}
            />
          </div>
        )
      )}
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

    </article>
  );
}
