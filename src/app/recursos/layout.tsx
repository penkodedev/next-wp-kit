// src/app/recursos/layout.tsx

/**
 * This is the layout for the "Resources" section.
 * It wraps both the archive page (page.tsx) and individual pages ([slug]/page.tsx).
 * No need to define <html> or <body>, as it inherits from the root layout.
 */

export default function RecursosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
