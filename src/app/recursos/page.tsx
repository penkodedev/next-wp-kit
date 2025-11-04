// src/app/recursos/page.tsx
// Like an archive.php page on a WP theme

"use client";

import { useState, useEffect } from "react";
import { getAllContent } from "@/api/wordpressApi";
import PostCard from "@/components/ui/PostCard";
import type { WpContent } from "@/types/wordpressTypes";
import LoadingSpinner from "@/components/ui/LoadingSpiner";

const POSTS_PER_PAGE = 8; // Number of posts for the archive page

// Función auxiliar para generar los parámetros de la API
const getApiParams = (page: number) => {
  return `?per_page=${POSTS_PER_PAGE}&page=${page}&_embed&orderby=date&order=desc`;
};

export default function RecursosArchivePage() {
  const [recursos, setRecursos] = useState<WpContent[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // Carga inicial de recursos
  useEffect(() => {
    const fetchInitialRecursos = async () => {
      setIsLoading(true);
      const initialRecursos = await getAllContent<WpContent>(
        "recursos",
        getApiParams(1)
      );
      setRecursos(initialRecursos || []);
      setHasMore((initialRecursos || []).length === POSTS_PER_PAGE);
      setIsLoading(false);
    };
    fetchInitialRecursos();
  }, []);

  const handleLoadMore = async () => {
    setIsLoading(true);
    const nextPage = page + 1;
    const newRecursos = await getAllContent<WpContent>(
      "recursos",
      getApiParams(nextPage)
    );

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
      START BUILDING THE PAGE CONTENT
**********************************************/
  return (
    <div className="page-fullwidth">
      <section className="page-title">
        <h1>Recursos</h1>
      </section>

      {recursos.length === 0 && !isLoading ? (
        <article>
          <p>No se encontraron recursos en este momento.</p>
        </article>
      ) : (
        <div className="post-grid cols-4">
          {recursos.map((recurso) => (
            <PostCard
              key={recurso.id}
              item={recurso}
              basePath="/recursos"
              excerptLength={150}
            />
          ))}
        </div>
      )}

      {/* Spinner durante carga inicial */}
      {isLoading && recursos.length === 0 && <LoadingSpinner />}

      {/* Botón cargar más - solo cuando hay recursos y no está cargando */}
      {recursos.length > 0 && hasMore && !isLoading && (
        <div
          className="load-more-container"
          style={{
            textAlign: "center",
            marginTop: "3rem",
            marginBottom: "6rem",
          }}
        >
          <button onClick={handleLoadMore} className="button">
            cargar más
          </button>
        </div>
      )}

      {/* Spinner durante carga de más recursos */}
      {isLoading && recursos.length > 0 && <LoadingSpinner />}
    </div>
  );
}
