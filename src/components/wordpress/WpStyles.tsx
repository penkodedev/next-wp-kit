// src/components/WpStyles.tsx

import { logger } from '@/utils/wordpress/logger';

/**
 * Dynamically fetches block styles and global/theme styles
 * from the WordPress installation and injects them into the <head>.
 */

// Function to get global styles using the official WordPress endpoint
async function getWpGlobalStyles() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
    if (!apiUrl) {
      logger.error("NEXT_PUBLIC_WORDPRESS_API_URL is not configured");
      return null;
    }

    const response = await fetch(
      `${apiUrl.replace(/\/$/, '')}/wp/v2/global-styles/themes/${process.env.WP_THEME_SLUG || 'twentytwentyfour'}`,
      {
        next: { revalidate: 3600 },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(3000)
      }
    );

    if (!response.ok) {
      // Fallback: try to get global styles from the active theme
      const fallbackResponse = await fetch(
        `${apiUrl.replace(/\/$/, '')}/wp/v2/global-styles`,
        {
          next: { revalidate: 3600 },
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(3000)
        }
      );

      if (!fallbackResponse.ok) return null;
      const fallbackData = await fallbackResponse.json();
      return fallbackData[0] || null; // Take the first element (active theme)
    }

    return await response.json();
  } catch (error) {
    // Don't log timeout errors as they are expected
    if (error instanceof Error && error.name !== 'TimeoutError') {
      logger.error("Error fetching WordPress global styles:", error);
    }
    return null;
  }
}

// Function to generate CSS from WordPress global styles
function generateCSSFromGlobalStyles(globalStyles: any) {
  if (!globalStyles) return '';
  
  let css = ':root {\n';
  
  // Extract color configuration
  const colorSettings = globalStyles.settings?.color;
  if (colorSettings?.palette?.theme) {
    colorSettings.palette.theme.forEach((color: any) => {
      css += `  --wp--preset--color--${color.slug}: ${color.color};\n`;
    });
  }
  
  // Gradients omitted - not used
  
  // Typography omitted - handled by SASS
  
  css += '}\n\n';
  
  // Generar clases auxiliares para colores
  if (colorSettings?.palette?.theme) {
    colorSettings.palette.theme.forEach((color: any) => {
      css += `
.has-${color.slug}-color {
  color: var(--wp--preset--color--${color.slug}) !important;
}

.has-${color.slug}-background-color {
  background-color: var(--wp--preset--color--${color.slug}) !important;
}

.has-${color.slug}-border-color {
  border-color: var(--wp--preset--color--${color.slug}) !important;
}
`;
    });
  }
  
  // Gradientes omitidos - no se utilizan
  
  return css;
}

// Improved function to get theme styles
async function getWpThemeStyles() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
    if (!apiUrl) {
      logger.error("NEXT_PUBLIC_WORDPRESS_API_URL is not configured");
      return null;
    }

    // First try the enhanced endpoint
    const enhancedResponse = await fetch(
      `${apiUrl.replace(/\/$/, '')}/wp/v2/theme-styles-enhanced`,
      {
        next: { revalidate: 3600 },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      }
    );

    if (enhancedResponse.ok) {
      const data = await enhancedResponse.json();
      return data.styles || '';
    }

    // Fallback to the original endpoint
    const response = await fetch(
      `${apiUrl.replace(/\/$/, '')}/wp/v2/theme-styles`,
      {
        next: { revalidate: 3600 },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      }
    );
    if (!response.ok) return null;
    const data = await response.json();

    const globalStyles = data.styles || '';
    const elementStyles = data.elements_styles || '';

    return globalStyles + elementStyles;
  } catch (error) {
    // Don't log timeout errors as they are expected
    if (error instanceof Error && error.name !== 'TimeoutError') {
      logger.error("Error fetching WordPress theme styles:", error);
    }
    return null;
  }
}

export default async function WpStyles() {
  const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace("/wp-json", "");

  if (!wpUrl) {
    return null;
  }

  // 1. Obtener los estilos globales usando la API oficial de WordPress
  const globalStyles = await getWpGlobalStyles();
  const generatedCSS = generateCSSFromGlobalStyles(globalStyles);

  // 2. Fallback: obtener estilos del tema usando tu endpoint custom
  const themeStyles = await getWpThemeStyles();

  // 3. URLs for standard Gutenberg stylesheets (ensure valid URLs)
  const blockLibraryUrl = `${wpUrl}/wp-includes/css/dist/block-library/style.css`;
  const themeLibraryUrl = `${wpUrl}/wp-includes/css/dist/block-library/theme.css`;
  const editorLibraryUrl = `${wpUrl}/wp-includes/css/dist/block-editor/style.css`;
  const hasValidUrls = blockLibraryUrl.startsWith('http') && themeLibraryUrl && editorLibraryUrl;

  if (!hasValidUrls) return null;

  return (
    <>
      {/* Standard WordPress/Gutenberg stylesheets */}
      <link rel="stylesheet" href={blockLibraryUrl} />
      <link rel="stylesheet" href={themeLibraryUrl} />
      <link rel="stylesheet" href={editorLibraryUrl} />

      {/* Essential styles (including base CSS variables) */}
      {/* <style dangerouslySetInnerHTML={{ __html: essentialStyles }} /> */}

      {/* CSS generated from WordPress global styles */}
      {generatedCSS && (
        <style dangerouslySetInnerHTML={{ __html: generatedCSS }} />
      )}

      {/* Theme styles (fallback) */}
      {themeStyles && (
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      )}
    </>
  );
}