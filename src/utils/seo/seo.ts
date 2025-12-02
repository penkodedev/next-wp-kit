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
		return {
			title: content.yoast_head_json.title,
			description: content.yoast_head_json.description,
			openGraph: {
				title: content.yoast_head_json.og_title,
				description: content.yoast_head_json.og_description,
				url: content.yoast_head_json.og_url,
				images: content.yoast_head_json.og_image?.map(img => ({ url: img.url })),
			},
		};
	}

	// Fallback: use basic content data if no Yoast
	return {
		title: content.title.rendered,
		description: content.excerpt.rendered.replace(/<[^>]+>/g, ''),
	};
}
