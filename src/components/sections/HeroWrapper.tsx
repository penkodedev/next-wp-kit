// src/components/sections/HeroWrapper.tsx
// Server Component that fetches Hero data from WordPress and passes it to the client Hero component

import { getHeroData } from '@/api/wordpressApi';
import HeroConfig from './HeroConfig';

interface HeroWrapperProps {
  position: 'home' | 'page' | 'archive' | 'custom';
  lang?: string;
}

/**
 * Server Component wrapper for Hero
 * Fetches data from WordPress API and renders Hero with that data
 * Falls back to hardcoded HeroConfig if WordPress data is unavailable
 */
export default async function HeroWrapper({ position, lang }: HeroWrapperProps) {
  const heroData = await getHeroData(position, lang);
  
  // If no active hero for this position, don't render anything
  if (!heroData || !heroData.active || !heroData.slides || heroData.slides.length === 0) {
    // Fallback to hardcoded hero
    return <HeroConfig />;
  }
  
  // Pass WordPress data to HeroConfig
  return <HeroConfig heroData={heroData} />;
}
