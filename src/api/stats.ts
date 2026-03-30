import { fetchAPI } from './client';

export interface StatsItem {
  number: number;
  label: string;
  suffix?: string;
}

export interface StatsGroup {
  title: string;
  type: 'counter' | 'countdown';
  align?: 'left' | 'center' | 'right';
  duration?: number;
  items?: StatsItem[];
  start_date?: string;
  end_date?: string;
}

export async function getStatsById(id: number, lang?: string): Promise<StatsGroup | null> {
  const endpoint = lang ? `/custom/v1/stats/${id}?lang=${lang}` : `/custom/v1/stats/${id}`;
  return await fetchAPI<StatsGroup>(endpoint);
}
