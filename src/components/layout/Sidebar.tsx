// src/components/layout/Sidebar.tsx

import { getAllContent } from "@/api/wordpressApi";
import Link from "next/link";
import type { WpContent } from "@/types/wordpressTypes";
import { Icons } from "@/components/ui/Icons";

export default async function Sidebar() {

  // ******* Choose wich CPTs to fetch ******************** //
  const params = `?per_page=5&page=1&_embed&orderby=date&order=desc`;
  const latestRecursos = await getAllContent<WpContent>("recursos", params);
  const latestNews = await getAllContent<WpContent>("news", params);

  return (
    <aside>
      <div className="sidebox">
        <h2>Ultimos recursos</h2>
        {!latestRecursos || latestRecursos.length === 0 ? (
          <p>No se encontraron recursos recientes.</p>
        ) : (
          <ul>
            {latestRecursos.map((recurso) => (
              <li key={recurso.id}>
                <Link href={`/recursos/${recurso.slug}`}>
                  <Icons.Check
                    size={20}
                    strokeWidth={3}
                    className="list-icon"
                  />
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
