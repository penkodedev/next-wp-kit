// src/utils/processContent.ts

/**
 * Processes HTML content from WordPress to make it compatible with the Next.js frontend.
 * Currently, it replaces absolute backend URLs with relative paths.
 *
 * @param {string} content - The HTML content string from the WordPress API.
 * @returns {string} The processed HTML content with corrected links.
 */
export function processContent(content: string): string {
  if (!content) {
    return '';
  }

  const backendUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/wp-json', '');
  if (!backendUrl) {
    return content;
  }

  const regex = new RegExp(backendUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
  return content.replace(regex, '');
}