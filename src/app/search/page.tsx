// src/app/search/page.tsx

"use client"; // Esta página usa hooks de cliente para leer los parámetros de la URL

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { searchSite } from '@/api/wordpressApi';
import { cleanInternalUrl } from '@/utils/url';

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
          console.error("Error durante la búsqueda:", error);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [query]);

  const getResultTitle = (result: SearchResultWithSubtype): string => {
    if (typeof result.title === 'string') return result.title;
    return result.title.rendered;
  }

  return (
    <div className="container">
      <h1>Resultados de búsqueda para: "{query}"</h1>
      {isLoading ? (
        <p>Buscando...</p>
      ) : results.length > 0 ? (
        <ul>
          {results.map(result => (
            <li key={result.id}>
              <h3>
                <Link href={cleanInternalUrl(result.url)}>{getResultTitle(result)}</Link>
              </h3>
              <small>
                {/* Construimos la URL absoluta del frontend combinando el origen actual con la ruta limpia */}
                {typeof window !== 'undefined' && `${window.location.origin}${cleanInternalUrl(result.url)}`}
              </small>
              {result._embedded?.self?.[0]?.excerpt?.rendered && (
                <div className="search-result-excerpt" dangerouslySetInnerHTML={{ __html: result._embedded.self[0].excerpt.rendered }} />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No se encontraron resultados para tu búsqueda.</p>
      )}
    </div>
  );
}