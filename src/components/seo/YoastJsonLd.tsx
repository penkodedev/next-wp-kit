import type { Post, Page } from '@/types/wordpressTypes';

interface YoastJsonLdProps {
  content: Post | Page;
}

export default function YoastJsonLd({ content }: YoastJsonLdProps) {
  const schema = content.yoast_head_json?.schema;
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
