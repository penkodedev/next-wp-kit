import type { WpContent } from "@/types/wordpressTypes";

// Local WpBlock interface for block processing
interface WpBlock {
	blockName: string;
	attrs: WpBlockAttrs;
	innerHTML: string;
	innerBlocks?: WpBlock[];
}

interface WpBlockAttrs {
	backgroundColor?: string;
	className?: string;
	[key: string]: unknown;
	innerBlocks?: WpBlock[];
	innerHTML: string;
}

/**
 * Processes HTML content from WordPress to make it compatible with the Next.js frontend.
 *
 * - Replaces absolute backend URLs with relative frontend paths.
 * - Adds `data-next-ignore="true"` to modal links so ModalController can intercept them.
 * - Re-wraps `wp-block-group` elements with their original classes (background colors, etc.).
 * - Processes shortcodes not handled by the backend.
 *
 * @param {string} content - HTML content string from the WordPress API.
 * @param {WpBlock[]} [blocks] - Optional array of block data from the API.
 * @returns {string} Processed HTML content with corrected links and wrappers.
 */
export function processContent(content: string, blocks?: WpBlock[]): string {
	if (!content) return "";

	let processedContent = content;

	// Fix wp-block-group wrappers if block data is available
	if (blocks && blocks.length > 0) {
		processedContent = fixBlockGroupHTML(processedContent, blocks);
	}

	const backendUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/wp-json', '');

	// Replace backend URLs with relative paths
	if (backendUrl) {
		const backendUrlRegex = new RegExp(backendUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
		processedContent = processedContent.replace(backendUrlRegex, '');
	}

	// Add data-next-ignore to modal links
	// This prevents Next.js router from handling these links, letting ModalController intercept them
	processedContent = processedContent.replace(
		/<a\s+([^>]*?)\bhref\s*=\s*["']\/modales\/[^"']+["']([^>]*?)>/gi,
		(match) => {
			// Only add data-next-ignore if not already present
			if (match.includes('data-next-ignore')) {
				return match;
			}
			return match.replace(/<a\s+/, '<a data-next-ignore="true" ');
		}
	);

	// Add sizes attribute to img tags that don't have it (for Next.js Image optimization)
	const imgRegex = /<img\s+(?!.*\bsizes\s*=\s*["'][^"']*["'])([^>]*)>/g;
	processedContent = processedContent.replace(
		imgRegex,
		'<img sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" $1>'
	);

	// Process any remaining shortcodes (fallback for frontend processing)
	processedContent = processShortcodes(processedContent);

	return processedContent;
}

/**
 * Processes shortcodes in content. This is a fallback for shortcodes not handled by the backend.
 * For proper shortcode processing, they should be handled by WordPress's do_shortcode() on the backend.
 * @param content HTML content containing shortcodes
 */
function processShortcodes(content: string): string {
	// Process [modales id="X"] shortcode
	const modalesRegex = /\[modales\s+id=["'](\d+)["']\]/g;
	content = content.replace(modalesRegex, (match, id) => {
	// Return a placeholder indicating the shortcode should be processed on backend
		return `<div class="shortcode-placeholder" data-shortcode="modales" data-id="${id}">Modal content for ID ${id} should be processed on backend</div>`;
	});

	// Process [page id="X"] shortcode
	const pageRegex = /\[page\s+id=["'](\d+)["']\]/g;
	content = content.replace(pageRegex, (match, id) => {
	// Return a placeholder indicating the shortcode should be processed on backend
		return `<div class="shortcode-placeholder" data-shortcode="page" data-id="${id}">Page content for ID ${id} should be processed on backend</div>`;
	});

	return content;
}


// ===================================================================
// Content Segments — splits HTML at slider markers so templates
// can render React components between HTML blocks.
// ===================================================================

export type ContentSegment =
	| { type: 'html'; content: string }
	| { type: 'slider'; sliderId: number }
	| { type: 'stats'; statsId: number }
	| { type: 'map' };

const COMPONENT_MARKER_REGEX = /<div\s+data-component="(slider|stats|map)"(?:\s+data-(?:slider|stats)-id="(\d+)")?[^>]*><\/div>/gi;

/**
 * Splits processed HTML into segments of plain HTML, slider markers, and stats markers.
 * Use this in templates that need to render interactive React components
 * within WordPress content.
 */
export function splitContentSegments(html: string): ContentSegment[] {
	const segments: ContentSegment[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	COMPONENT_MARKER_REGEX.lastIndex = 0;

	while ((match = COMPONENT_MARKER_REGEX.exec(html)) !== null) {
		const before = html.slice(lastIndex, match.index);
		if (before.trim()) {
			segments.push({ type: 'html', content: before });
		}

		const componentType = match[1];
		const idStr = match[2];

		if (componentType === 'slider' && idStr) {
			segments.push({ type: 'slider', sliderId: parseInt(idStr, 10) });
		} else if (componentType === 'stats' && idStr) {
			segments.push({ type: 'stats', statsId: parseInt(idStr, 10) });
		} else if (componentType === 'map') {
			segments.push({ type: 'map' });
		}

		lastIndex = match.index + match[0].length;
	}

	const after = html.slice(lastIndex);
	if (after.trim()) {
		segments.push({ type: 'html', content: after });
	}

	return segments;
}

/**
 * Quick check: does this content contain component markers (sliders, stats, etc.)?
 */
export function hasComponentMarkers(html: string): boolean {
	return /data-component="(slider|stats|map)"/.test(html);
}

/** @deprecated Use hasComponentMarkers instead */
export function hasSliderMarkers(html: string): boolean {
	return hasComponentMarkers(html);
}


/**
 * Re-wraps `wp-block-group` HTML with the necessary classes that the REST API strips.
 * Uses the block's attributes to reconstruct the wrapper div.
 * @param html Raw HTML content.
 * @param blocks Array of block objects from the API.
 */
function fixBlockGroupHTML(html: string, blocks: WpBlock[]): string {
	let fixedHtml = html;

	const findGroupBlocks = (blocksToSearch: WpBlock[]) => {
		for (const block of blocksToSearch) {
			if (block.blockName === 'core/group') {
				const { backgroundColor, align, className } = block.attrs;
	// Check if there are any attributes that require a wrapper
				if (backgroundColor || align || (className && className.includes('is-style-'))) {
					const originalHtml = block.innerHTML;
					// Find the corresponding HTML part. The API often returns just the inner container.
					const innerContainerMatch = originalHtml.match(/<div class="wp-block-group__inner-container".*?>/);

					if (innerContainerMatch && fixedHtml.includes(originalHtml)) {
						const wrapperClasses = [
							'wp-block-group',
							align ? `align${align}` : '',
							backgroundColor ? `has-${backgroundColor}-background-color has-background` : '',
							className || ''
						].filter(Boolean).join(' ');

						const wrappedHtml = `<div class="${wrapperClasses}">${originalHtml}</div>`;
						fixedHtml = fixedHtml.replace(originalHtml, wrappedHtml);
					}
				}
			}
			// Recursively search in inner blocks
			if (block.innerBlocks && block.innerBlocks.length > 0) {
				findGroupBlocks(block.innerBlocks);
			}
		}
	};

	findGroupBlocks(blocks);
	return fixedHtml;
}
