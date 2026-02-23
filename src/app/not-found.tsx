// src/app/not-found.tsx
"use client";

import Link from 'next/link';
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    // Force body classes for 404 page
    document.body.classList.add('page', 'not-found', 'page-404');

    return () => {
      // Clean up on unmount
      document.body.classList.remove('page', 'not-found', 'page-404');
    };
  }, []);

  return (
    <div className="page-centered">
      <article className="page-content">
          <header className="page-header">
            <h1>404 - Página No Encontrada</h1>
          </header>

          <div className='image-404'></div>

          <p>Lo sentimos, la página que buscas no existe.</p>

          <Link href="/">
            Volver a la página de inicio
          </Link>
        </article>
    </div>
  );
}