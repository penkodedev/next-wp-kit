// src/components/features/counter-stats/CounterStatsRenderer.tsx

/**
 * Server Component that fetches a counter stats group from the API
 * and renders either animated counter cards or a countdown timer.
 */

import dynamic from 'next/dynamic';
import { getStatsById } from '@/api/wordpressApi';
import CounterStatCard from './CounterStatCard';

const CountdownTimer = dynamic(() => import('./CountdownTimer').then((m) => m.default), {
  ssr: false,
  loading: () => <div className="counter-stats" style={{ minHeight: 80 }} />,
});

interface CounterStatsRendererProps {
  statsId: number;
  lang?: string;
}

export default async function CounterStatsRenderer({ statsId, lang }: CounterStatsRendererProps) {
  const data = await getStatsById(statsId, lang);

  if (!data) return null;

  const align = data.align ?? 'center';

  if (data.type === 'countdown') {
    if (!data.end_date) return null;
    return (
      <CountdownTimer
        startDate={data.start_date || null}
        endDate={data.end_date}
        align={align}
      />
    );
  }

  if (!data.items || data.items.length === 0) return null;

  return (
    <section className={`counter-stats counter-stats--${align}`}>
      <div className="counter-stats-grid">
        {data.items.map((item, i) => (
          <CounterStatCard
            key={i}
            number={item.number}
            label={item.label}
            suffix={item.suffix}
            duration={data.duration ?? 2000}
          />
        ))}
      </div>
    </section>
  );
}
