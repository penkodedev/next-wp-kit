// src/app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {

  return (
    <div className="page-centered">
      <main>
        <article className="page-content">
          <header className="page-header">
            <h1>404 - Página No Encontrada</h1>
          </header>

          <p>Lo sentimos, la página que buscas no existe.</p>

          <Link href="/">
            Volver a la página de inicio
          </Link>
        </article>
      </main>
    </div>
  );
}