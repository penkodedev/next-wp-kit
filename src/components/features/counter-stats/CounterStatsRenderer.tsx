// src/components/features/counter-stats/CounterStatsRenderer.tsx

/**
 * Server Component that fetches a counter stats group from the API
 * and renders an animated grid of counter cards.
 */

import { getStatsById } from '@/api/wordpressApi';
import CounterStatCard from './CounterStatCard';

interface CounterStatsRendererProps {
  statsId: number;
  lang?: string;
}

export default async function CounterStatsRenderer({ statsId, lang }: CounterStatsRendererProps) {
  const data = await getStatsById(statsId, lang);

  if (!data || !data.items || data.items.length === 0) return null;

  return (
    <section className="counter-stats">
      <div className="counter-stats-grid">
        {data.items.map((item, i) => (
          <CounterStatCard
            key={i}
            number={item.number}
            label={item.label}
            duration={data.duration}
          />
        ))}
      </div>
    </section>
  );
}
