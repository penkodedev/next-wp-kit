// src/app/recursos/layout.tsx

/**
 * Este es el layout para la sección de "Recursos".
 * Envuelve tanto la página de archivo (page.tsx) como las páginas individuales ([slug]/page.tsx).
 * No necesita definir <html> o <body>, ya que hereda del layout raíz.
 */
export default function RecursosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
