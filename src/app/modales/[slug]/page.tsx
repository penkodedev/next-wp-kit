// src/app/modales/[slug]/page.tsx
import { getAllContent, getContentBySlug } from "@/api/wordpressApi";
import type { Modal } from "@/types/wordpressTypes";
import { notFound } from "next/navigation";
import { processContent } from "@/utils/processContent";

type ModalPageProps = {
  params: {
    slug: string;
  };
};

// This function generates the static pages at build time
export async function generateStaticParams() {
  const modales = await getAllContent<Modal>('modales');
  if (!modales) return [];

  return modales.map((modal) => ({
    slug: modal.slug,
  }));
}

// This function fetches the data for a specific modal page
export default async function ModalPage({ params }: ModalPageProps) {
  const modal = await getContentBySlug<Modal>('modales', params.slug);

  if (!modal) {
    notFound();
  }

 return (
   <div className="page-one-col">
     <main>
       <article className="page-content">
         <header className="page-header">
           <h1 dangerouslySetInnerHTML={{ __html: processContent(modal.title.rendered) }} />
         </header>

         <div
           dangerouslySetInnerHTML={{ __html: processContent(modal.content.rendered) }}
         />
       </article>
     </main>
  </div>
  );
}