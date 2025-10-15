// src/utils/processContent.ts

/**
 * Processes HTML content from WordPress to make it compatible with the Next.js frontend.
 * 1. Replaces absolute backend URLs with relative frontend paths.
 * 2. Adds `data-next-ignore="true"` to modal links (`/modals/...`) to prevent
 *    Next.js's App Router from hijacking the click event. This allows our
 *    `ModalController` to handle it and open the modal popup.
 *
 * @param {string} content - The HTML content string from the WordPress API.
 * @returns {string} The processed HTML content with corrected links.
 */
export function processContent(content: string): string {
  if (!content) return '';
  
  const backendUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/wp-json', '');
  
  let processedContent = content;
  
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