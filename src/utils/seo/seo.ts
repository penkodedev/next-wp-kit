// src/utils/seo.ts
import type { Metadata } from 'next';
import type { Post, Page } from '@/types/wordpressTypes';
import { getWpmlLanguages, getWpmlTranslation } from '@/api/wordpressApi';

/**
 * Generates metadata for a page or post, prioritizing Yoast SEO data.
 * Includes hreflang tags for multilingual SEO (WPML integration).
 * @param {Post | Page | null} content - The WordPress post or page object.
 * @param {string} currentLocale - The current language code (e.g., 'es', 'en').
 * @returns {Metadata} The metadata object for Next.js.
 */
export async function generateSeoMetadata(
	content: Post | Page | null, 
	currentLocale: string
): Promise<Metadata> {
	if (!content) {
		return {};
	}

	// Fetch WPML languages for hreflang generation
	const wpmlData = await getWpmlLanguages();
	const languages = wpmlData?.languages || [];

	// Generate hreflang alternate URLs
	const hreflangAlternates: Record<string, string> = {};
	
	// Only generate hreflang if we have a post ID (single posts/pages, not archives)
	if (content.id && languages.length > 0) {
		// Use FRONTEND base URL (Next.js deployment URL)
		const frontendUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
		
		for (const lang of languages) {
			if (lang.code === currentLocale) {
				// Current page URL - extract path from WordPress link and use frontend URL
				const path = content.link.replace(/^https?:\/\/[^\/]+/, '');
				hreflangAlternates[lang.code] = `${frontendUrl}${path}`;
			} else {
				// Fetch translated URL from WPML
				const translation = await getWpmlTranslation(content.id, lang.code);
				if (translation?.exists && translation.url) {
					// Use only the path (relative URL) and prepend frontend URL
					const path = translation.url.startsWith('http') 
						? translation.url.replace(/^https?:\/\/[^\/]+/, '')
						: translation.url;
					hreflangAlternates[lang.code] = `${frontendUrl}${path}`;
				}
			}
		}
	}

	// SEO logic: prioritize Yoast data if available
	if (content.yoast_head_json) {
		const yoast = content.yoast_head_json;
		
		// Use FRONTEND base URL for canonical and hreflang
		const frontendUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
		
		// Extract path from WordPress canonical URL and use frontend URL
		const canonicalPath = yoast.canonical 
			? yoast.canonical.replace(/^https?:\/\/[^\/]+/, '')
			: content.link.replace(/^https?:\/\/[^\/]+/, '');

		const description = yoast.description
			|| yoast.og_description
			|| content.excerpt?.rendered?.replace(/<[^>]+>/g, '').trim()
			|| undefined;

		return {
			title: yoast.title,
			description,

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

			// Canonical URL + Hreflang (multilingual SEO) - ALL using FRONTEND URLs
			alternates: {
				canonical: `${frontendUrl}${canonicalPath}`,
				languages: Object.keys(hreflangAlternates).length > 0 ? hreflangAlternates : undefined,
			},

			// Robots meta tags (index/follow)
			robots: {
				index: yoast.robots?.index === 'index',
				follow: yoast.robots?.follow === 'follow',
			},
		};
	}

	// Fallback: use basic content data if no Yoast
	const frontendUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
	const path = content.link.replace(/^https?:\/\/[^\/]+/, '');
	
	return {
		title: content.title.rendered,
		description: content.excerpt.rendered.replace(/<[^>]+>/g, ''),
		alternates: {
			canonical: `${frontendUrl}${path}`,
			languages: Object.keys(hreflangAlternates).length > 0 ? hreflangAlternates : undefined,
		},
	};
}
