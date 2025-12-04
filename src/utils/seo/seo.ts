// src/utils/seo.ts
import type { Metadata } from 'next';
import type { Post, Page } from '@/types/wordpressTypes';

/**
 * Generates metadata for a page or post, prioritizing Yoast SEO data.
 * @param {Post | Page | null} content - The WordPress post or page object.
 * @returns {Metadata} The metadata object for Next.js.
 */
export function generateSeoMetadata(content: Post | Page | null): Metadata {
	if (!content) {
		return {};
	}

	// SEO logic: prioritize Yoast data if available
	if (content.yoast_head_json) {
		const yoast = content.yoast_head_json;

		return {
			title: yoast.title,
			description: yoast.description,

			// Open Graph for Facebook, LinkedIn, etc.
			openGraph: {
				title: yoast.og_title,
				description: yoast.og_description,
				url: yoast.og_url,
				siteName: yoast.og_site_name,
				type: yoast.og_type as 'website' | 'article',
				locale: yoast.og_locale,
				images: yoast.og_image?.map(img => ({
					url: img.url,
					width: img.width,
					height: img.height,
					alt: yoast.og_title,
				})),
			},

			// Twitter Cards
			twitter: {
				card: 'summary_large_image',
				title: yoast.twitter_title || yoast.og_title,
				description: yoast.twitter_description || yoast.og_description,
				images: yoast.twitter_image || yoast.og_image?.[0]?.url,
			},

			// Canonical URL (evita contenido duplicado)
			alternates: {
				canonical: yoast.canonical || content.link,
			},

			// Robots meta tags (index/follow)
			robots: {
				index: yoast.robots?.index === 'index',
				follow: yoast.robots?.follow === 'follow',
			},
		};
	}

	// Fallback: use basic content data if no Yoast
	return {
		title: content.title.rendered,
		description: content.excerpt.rendered.replace(/<[^>]+>/g, ''),
		alternates: {
			canonical: content.link,
		},
	};
}
