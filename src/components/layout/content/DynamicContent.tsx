// src/components/layout/content/DynamicContent.tsx

import parse from 'html-react-parser';
import type { DOMNode } from 'html-react-parser';
import SliderRenderer from '@/components/sections/sliders/SliderRenderer';
import CounterStatsRenderer from '@/components/features/counter-stats/CounterStatsRenderer';
import MapRenderer from '@/components/features/map/MapRenderer';
import ContactForm7 from '@/components/forms/ContactForm7';

interface DynamicContentProps {
  html: string;
  lang?: string;
  /** Wrap output with ContactForm7 client handler when the page contains a CF7 form */
  hasForm?: boolean;
}

/**
 * Renders WordPress content that may contain dynamic component markers
 * (sliders, stats, map). Uses html-react-parser to replace marker nodes
 * in-place, preserving the full DOM tree (columns, groups, etc.).
 *
 * When adding a new dynamic component, update ONLY this file.
 */
export default function DynamicContent({ html, lang, hasForm }: DynamicContentProps) {
  const content = parse(html, {
    replace(domNode: DOMNode) {
      if (domNode.type !== 'tag') return;

      const el = domNode as DOMNode & { attribs: Record<string, string> };
      const componentType = el.attribs?.['data-component'];
      if (!componentType) return;

      if (componentType === 'map') {
        const group = el.attribs['data-map-group'] || undefined;
        return <MapRenderer lang={lang} group={group} />;
      }
      if (componentType === 'slider') {
        const id = el.attribs['data-slider-id'];
        if (id) return <SliderRenderer sliderId={Number(id)} lang={lang} />;
      }
      if (componentType === 'stats') {
        const id = el.attribs['data-stats-id'];
        if (id) return <CounterStatsRenderer statsId={Number(id)} lang={lang} />;
      }
    },
  });

  if (hasForm) {
    return <ContactForm7>{content}</ContactForm7>;
  }

  return <>{content}</>;
}
