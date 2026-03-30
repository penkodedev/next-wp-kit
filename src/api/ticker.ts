import { fetchAPI } from './client';

export interface TickerSettings {
  enabled: boolean;
  pages: string[];
  text: string;
  link?: string;
  speed: number;
  size: 'small' | 'medium' | 'big' | 'extra-big';
  noAnimate: boolean;
  pauseOnHover: boolean;
  message?: string;
}

export async function getTickerSettings(lang?: string): Promise<TickerSettings | null> {
  const endpoint = lang ? `/custom/v1/ticker?lang=${lang}` : '/custom/v1/ticker';
  return await fetchAPI<TickerSettings>(endpoint);
}

let tickerCache: { data: TickerSettings | null; timestamp: number } = { data: null, timestamp: 0 };

/**
 * Get Ticker Settings with in-memory caching (5 minutes).
 * @param lang - Optional language code for WPML translation
 */
export async function getCachedTickerSettings(lang?: string): Promise<TickerSettings | null> {
  const CACHE_DURATION = 5 * 60 * 1000;
  
  if (tickerCache.data && (Date.now() - tickerCache.timestamp < CACHE_DURATION)) {
    return tickerCache.data;
  }
  
  const data = await getTickerSettings(lang);
  tickerCache = { data, timestamp: Date.now() };
  
  return data;
}

export function invalidateTickerCache(): void {
  tickerCache = { data: null, timestamp: 0 };
}
