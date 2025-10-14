// src/components/layout/SingleContentSidebar.tsx

import type { WpContent } from '@/types/wordpressTypes';
import SingleContent from '@/components/layout/SingleContent';
import Sidebar from '@/components/layout/Sidebar';

type LayoutProps = {
  content: WpContent;
};

export default function SingleContentSidebar({ content }: LayoutProps) {

/**********************************************
      START BUILDING THE PAGE CONTENT HTML
**********************************************/
  return (
    <div className="container with-sidebar">
      <main>
        <SingleContent content={content} />
      </main>
      <Sidebar />
    </div>
  );
}