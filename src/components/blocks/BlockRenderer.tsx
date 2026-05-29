import type { WpBlock } from '@/types/wordpressTypes';
import ContentGridBlock from './ContentGridBlock';
import DynamicContent from '@/components/layout/content/DynamicContent';

// Map block names to React components.
// Add new custom blocks here — nothing else needs to change.
const blockComponents: Record<string, React.ComponentType<{ block: WpBlock; lang?: string }>> = {
  'penkode/content-grid': ContentGridBlock,
};

interface BlockRendererProps {
  blocks: WpBlock[];
  lang?: string;
}

export default function BlockRenderer({ blocks, lang }: BlockRendererProps) {
  return (
    <>
      {blocks.map((block, index) => {
        const Component = blockComponents[block.blockName];

        if (Component) {
          return <Component key={index} block={block} lang={lang} />;
        }

        // Native WP block — use DynamicContent so data-component markers
        // (map, stats, slider) are replaced with their React components.
        if (block.rendered) {
          const hasForm = block.rendered.includes('wpcf7-form');
          return (
            <DynamicContent
              key={index}
              html={block.rendered}
              lang={lang}
              hasForm={hasForm}
            />
          );
        }

        return null;
      })}
    </>
  );
}
