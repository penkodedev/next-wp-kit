import type { WpBlock } from "@/types/wordpressTypes";
// src/utils/processContent.ts

/**
 * Processes HTML content from WordPress to make it compatible with the Next.js frontend.
 * 1. Replaces absolute backend URLs with relative frontend paths.
 * 2. Adds `data-next-ignore="true"` to modal links (`/modals/...`) to prevent
 *    Next.js's App Router from hijacking the click event. This allows our
 *    `ModalController` to handle it.
 * 3. Re-wraps `wp-block-group` elements with their original classes (like background
 *    colors) that are often stripped by the WordPress REST API.
 *
 * @param {string} content - The HTML content string from the WordPress API.
 * @param {WpBlock[]} [blocks] - The array of block data from the API.
 * @returns {string} The processed HTML content with corrected links.
 */
export function processContent(content: string, blocks?: WpBlock[]): string {
  if (!content) return "";

  let processedContent = content;

  // Fix for wp-block-group wrappers if block data is available
  if (blocks && blocks.length > 0) {
    processedContent = fixBlockGroupHTML(processedContent, blocks);
  }
  
  const backendUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/wp-json', '');
  
  // 1. Replace backend URLs with relative paths
  if (backendUrl) {
    const backendUrlRegex = new RegExp(backendUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
    processedContent = processedContent.replace(backendUrlRegex, '');
  }
  
  // 2. Add data-next-ignore to modal links
  // This regex finds all <a> tags whose href starts with /modals/
  // and adds the data-next-ignore="true" attribute.
  // It's careful not to modify links that already have this attribute.
  const modalLinkRegex = /<a\s+(?!.*\bdata-next-ignore\s*=\s*["']true["'])([^>]*\bhref\s*=\s*["']\/modales\/[^"']+["'][^>]*)>/g;
  
  processedContent = processedContent.replace(
    modalLinkRegex,
    '<a data-next-ignore="true" $1>'
  );
  
  return processedContent;
}

/**
 * Re-wraps `wp-block-group` HTML with the necessary classes that the REST API strips.
 * It uses the block's attributes to reconstruct the wrapper div.
 * @param html The raw HTML content.
 * @param blocks The array of block objects from the API.
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
          // Find the corresponding HTML part. We need to be careful here.
          // The API often returns just the inner container.
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