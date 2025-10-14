// src/app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  
  return (
    <div className="container text-center">
      <h1>404 - Página No Encontrada</h1>
      <p>Lo sentimos, la página que buscas no existe.</p>

      <Link href="/">
        Volver a la página de inicio
      </Link>
    </div>
  );
}