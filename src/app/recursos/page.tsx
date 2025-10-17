"use client"; // Convertir a Componente de Cliente para manejar estado e interactividad

import { useState, useEffect } from 'react';
import { getAllContent } from '@/api/wordpressApi';
import PostCard from '@/components/ui/PostCard';
import PostCardSkeleton from '@/components/ui/PostCardSkeleton';
import type { Recurso } from '@/types/wordpressTypes';

const POSTS_PER_PAGE = 9;

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

  // Muestra los esqueletos de carga solo en la carga inicial.
  if (isLoading && recursos.length === 0) {
    return (
      <div className="container">
        <h1>Recursos</h1>
        <div className="post-grid">
          {/* Muestra 8 esqueletos para coincidir con POSTS_PER_PAGE */}
          {Array.from({ length: POSTS_PER_PAGE }).map((_, index) => (
            <PostCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (recursos.length === 0) {
    return (
      <article className='form-container'>
        <h1>Recursos</h1>
        <p>No se encontraron recursos en este momento.</p>
      </article>
    );
  }


  return(
    <div className="container">
      <section className='page-title'>
        <h1>Recursos</h1>
      </section>
      
      <div className="post-grid cols-3">
        {recursos.map((recurso) => (
          <PostCard key={recurso.id} item={recurso} basePath="/recursos" excerptLength={80} />
        ))}
      </div>

      {hasMore && (
        <div className="load-more-container" style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button onClick={handleLoadMore} disabled={isLoading} className="button">
            {isLoading ? 'Cargando...' : 'cargar más'}
          </button>
        </div>
      )}
    </div>
  )
}
