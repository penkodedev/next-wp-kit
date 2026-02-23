// src/app/search/page.tsx

"use client"; // Esta página usa hooks de cliente para leer los parámetros de la URL

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { searchSite } from '@/api/wordpressApi';
import { cleanInternalUrl } from '@/utils/wordpress/url';
import AnimatedFadeIn from '@/components/animations/framer/AnimatedFadeIn';
import { logger } from '@/utils/wordpress/logger';

// La API de búsqueda devuelve un 'subtype' que es más útil
interface SearchResultWithSubtype {
  id: number;
  title: string | { rendered: string };
  url: string;
  type: string;
  _embedded?: any; // Añadimos _embedded para el extracto
  subtype: 'post' | 'page' | string; // 'page', 'post', o el slug de un CPT
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResultWithSubtype[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (query) {
      setIsLoading(true);
      searchSite(query)
        .then(data => {
          setResults((data as SearchResultWithSubtype[]) || []); 
          setIsLoading(false);
        })
        .catch(error => {
          logger.error("Error durante la búsqueda:", error);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [query]);

  // Función auxiliar para resaltar la query en un texto dado
  const highlightQuery = (text: string | null | undefined, query: string): string => {
    if (!text || !query) return text || ''; // Retorna el texto original o cadena vacía si es null/undefined
    // Use a regular expression for case-insensitive and global replacement
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="bg-query">$1</span>');
  };

  const getResultTitle = (result: SearchResultWithSubtype, query: string): string => {
    const titleText = typeof result.title === 'string' ? result.title : result.title.rendered;
    return highlightQuery(titleText, query);
  };


/**********************************************
      START BUILDING THE PAGE CONTENT HTML
**********************************************/
  return (
    <div className="page-one-col">
      <article className="page-content search-page-content">
          <header className="page-header">
            <h1>Resultados de búsqueda para: <span className="bg-query">{query}</span></h1>
          </header>

          <div className="search-results-container">
            {isLoading ? (
              <p>Buscando...</p>
            ) : !isLoading && results.length > 0 ? (
              <ul className="space-y-6">
                {results.map((result, index) => (
                  <AnimatedFadeIn as="li" key={result.id} transition={{ delay: index * 0.033 }}>
                    <Link href={cleanInternalUrl(result.url)} className="search-result-link hover:underline">
                      <h3
                        className="text-xl font-semibold"
                        dangerouslySetInnerHTML={{ __html: getResultTitle(result, query) }}
                      >
                      </h3>
                      <small 
                        className="text-sm text-gray-500"
                        dangerouslySetInnerHTML={{ __html: highlightQuery(typeof window !== 'undefined' ? `${window.location.origin}${cleanInternalUrl(result.url)}` : cleanInternalUrl(result.url), query) }}
                      />
                    </Link>
                    {result._embedded?.self?.[0]?.excerpt?.rendered && ( // Check if excerpt exists
                      <div className="search-result-excerpt mt-2" dangerouslySetInnerHTML={{ __html: highlightQuery(result._embedded.self[0].excerpt.rendered, query) }} />
                    )}
                  </AnimatedFadeIn>
                ))}
              </ul>
            ) : !isLoading && (
              <p>No se encontraron resultados para tu búsqueda.</p>
            )}
          </div>
        </article>
    </div>
  );
}