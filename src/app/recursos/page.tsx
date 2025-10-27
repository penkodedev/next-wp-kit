// src/app/recursos/page.tsx
// Like an archive.php page on a WP theme
// 

"use client"; 

import { useState, useEffect } from 'react';
import { getAllContent } from '@/api/wordpressApi';
import PostCard from '@/components/ui/PostCard';
import type { Recurso } from '@/types/wordpressTypes';
import LoadingSpinner from '@/components/ui/LoadingSpiner'
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const POSTS_PER_PAGE = 8; // Number of posts for the archive page

// Función auxiliar para generar los parámetros de la API
const getApiParams = (page: number) => {
  return `?per_page=${POSTS_PER_PAGE}&page=${page}&_embed&orderby=date&order=desc`;
};

export default function RecursosArchivePage() {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // Carga inicial de recursos
  useEffect(() => {
    const fetchInitialRecursos = async () => {
      setIsLoading(true);
      const initialRecursos = await getAllContent<Recurso>('recursos', getApiParams(1));
      setRecursos(initialRecursos || []);
      setHasMore((initialRecursos || []).length === POSTS_PER_PAGE);
      setIsLoading(false);
    };
    fetchInitialRecursos();
  }, []);

  const handleLoadMore = async () => {
    setIsLoading(true);
    const nextPage = page + 1;
    const newRecursos = await getAllContent<Recurso>('recursos', getApiParams(nextPage));

    if (newRecursos && newRecursos.length > 0) {
      setRecursos((prevRecursos) => [...prevRecursos, ...newRecursos]);
      setPage(nextPage);
      setHasMore(newRecursos.length === POSTS_PER_PAGE);
    } else {
      setHasMore(false);
    }
    setIsLoading(false);
  };


/**********************************************
      START BUILDING THE PAGE CONTENT HTML
**********************************************/
  return (
    <div className="main-container">
      <section className='page-title'>
        <h1>Recursos</h1>
        
      </section>
      {recursos.length === 0 && !isLoading ? (
        <article>
          <p>No se encontraron recursos en este momento.</p>
        </article>
      ) : (
          <div className="post-grid cols-2">
            
          {recursos.map((recurso) => (
            <PostCard key={recurso.id} item={recurso} basePath="/recursos" excerptLength={150} />
          ))}
        </div>
      )}

      {/* Spinner inline durante carga inicial */}
      {/* {isLoading && recursos.length === 0 && (
        <LoadingSpinner />
      )} */}
      
      {hasMore && (
        <div className="load-more-container" style={{ textAlign: 'center', marginTop: '3rem',marginBottom: '6rem' }}>
          <button onClick={handleLoadMore} disabled={isLoading} className="button">
            {isLoading ? 'Cargando...' : 'cargar más'}
            </button>
            
        </div>
      )}
    </div>
  )
}
