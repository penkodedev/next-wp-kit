// Función auxiliar para procesar HTML de WordPress
function processExternalLinks(htmlString: string): string {
  if (typeof window === 'undefined') return htmlString;
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const currentHost = window.location.hostname;
  
  doc.querySelectorAll('a[href]').forEach(link => {
    const anchor = link as HTMLAnchorElement;
    const href = anchor.getAttribute('href');
    
    if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
      try {
        const url = new URL(href, window.location.origin);
        if (url.hostname !== currentHost) {
          anchor.setAttribute('target', '_blank');
          anchor.setAttribute('rel', 'noopener noreferrer');
        }
      } catch (e) {
        // URL relativa, no hacer nada
      }
    }
  });
  
  return doc.body.innerHTML;
}

// Usar en tu componente
function ContentSingle({ content }: { content: string }) {
  const processedContent = processExternalLinks(content);
  
  return (
    <article dangerouslySetInnerHTML={{ __html: processedContent }} />
  );
}