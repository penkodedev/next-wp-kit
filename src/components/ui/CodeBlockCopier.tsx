'use client';

import { useEffect, useState } from 'react';
import { Icons } from './Icons'; // Ajusta la ruta según tu estructura
import { renderToString } from 'react-dom/server';

export default function CodeBlockCopier() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const addCopyButtons = () => {
      const preElements = document.querySelectorAll('pre.wp-block-code:not(.processed)');
      
      preElements.forEach((pre) => {
        const codeElement = pre.querySelector('code');
        const code = codeElement?.textContent || '';
        
        const link = document.createElement('a');
        link.className = 'copy-btn';
        link.href = '#';
        // Convertir el componente React a HTML string
        link.innerHTML = renderToString(<Icons.Copy size={17} strokeWidth={2.2} />);
        link.setAttribute('aria-label', 'Copiar código');
        
        link.onclick = async (e) => {
          e.preventDefault(); // Evitar que navegue
          await navigator.clipboard.writeText(code);
          // Cambiar a icono de check
          link.innerHTML = renderToString(<Icons.Check size={17} strokeWidth={2.2} />);
          setTimeout(() => {
            link.innerHTML = renderToString(<Icons.Copy size={17} strokeWidth={2.2} />);
          }, 2000);
        };
        
        (pre as HTMLElement).style.position = 'relative';
        pre.appendChild(link);
        pre.classList.add('processed');
      });
    };

    addCopyButtons();
    const timeout1 = setTimeout(addCopyButtons, 100);
    const timeout2 = setTimeout(addCopyButtons, 500);
    
    const observer = new MutationObserver(addCopyButtons);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      observer.disconnect();
    };
  }, [mounted]);

  return null;
}