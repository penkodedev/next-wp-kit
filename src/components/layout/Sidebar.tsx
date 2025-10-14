// src/components/layout/Sidebar.tsx

import { getAllContent } from '@/api/wordpressApi';
import Link from 'next/link';
import type { Recurso } from '@/types/wordpressTypes';

export default async function Sidebar() {

  // Fetch the 5 latest resources
  const params = `?per_page=5&page=1&_embed&orderby=date&order=desc`;
  const latestRecursos = await getAllContent<Recurso>('recursos', params);

  return (
    <aside className="sidebar">

      <div className="sidebox">
        <h2>Ultimos recursos</h2>
        {(!latestRecursos || latestRecursos.length === 0) ? (
          <p>No se encontraron recursos recientes.</p>
        ) : (
          <ul>
            {latestRecursos.map((recurso) => (
              <li key={recurso.id}>
                <Link href={`/recursos/${recurso.slug}`}>
                  {recurso.title.rendered}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* You can add more .sidebox divs here for other widgets like search, categories, etc. */}

    </aside>
  );
}