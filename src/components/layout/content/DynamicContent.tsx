// src/components/layout/content/DynamicContent.tsx

import { splitContentSegments, hasComponentMarkers } from '@/utils/wordpress/processContent';
import SliderRenderer from '@/components/sections/sliders/SliderRenderer';
import CounterStatsRenderer from '@/components/features/counter-stats/CounterStatsRenderer';

interface DynamicContentProps {
  html: string;
  lang?: string;
  /** Render function for plain HTML segments (e.g. wrap with ContactForm7Content) */
  renderHtml?: (html: string, index: number) => React.ReactNode;
}

/**
 * Renders WordPress content that may contain dynamic component markers
 * (sliders, stats, etc.). Splits the HTML at marker boundaries and
 * renders the appropriate React component for each one.
 *
 * When adding a new dynamic component, update ONLY this file.
 */
export default function DynamicContent({ html, lang, renderHtml }: DynamicContentProps) {
  if (!hasComponentMarkers(html)) {
    return renderHtml
      ? <>{renderHtml(html, 0)}</>
      : <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  const segments = splitContentSegments(html);

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === 'html') {
          return renderHtml
            ? <span key={i}>{renderHtml(seg.content, i)}</span>
            : <div key={i} dangerouslySetInnerHTML={{ __html: seg.content }} />;
        }
        if (seg.type === 'slider') return <SliderRenderer key={i} sliderId={seg.sliderId} lang={lang} />;
        if (seg.type === 'stats') return <CounterStatsRenderer key={i} statsId={seg.statsId} lang={lang} />;
        return null;
      })}
    </>
  );
}
