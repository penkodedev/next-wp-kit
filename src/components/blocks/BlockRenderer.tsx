import type { WpBlock } from '@/types/wordpressTypes';
import ContentGridBlock from './ContentGridBlock';

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

        // Native WP block — use PHP-rendered HTML (handles nesting correctly)
        if (block.rendered) {
          return (
            <div
              key={index}
              dangerouslySetInnerHTML={{ __html: block.rendered }}
            />
          );
        }

        return null;
      })}
    </>
  );
}
