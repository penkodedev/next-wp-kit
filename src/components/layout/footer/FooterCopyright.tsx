// src/components/layout/footer/FooterCopyright.tsx
import type { SiteInfo } from "@/types/wordpressTypes";

interface FooterCopyrightProps {
  title: SiteInfo['title'];
  description?: SiteInfo['description'];
  showTitle?: boolean;
  showDescription?: boolean;
}

export default function FooterCopyright({ 
  title, 
  description, 
  showTitle = true,
  showDescription = false 
}: FooterCopyrightProps) {
  return (
    <div className="footer-copy">
      &copy; {new Date().getFullYear()} {title}
      {showDescription && description && (
        <>
          <br />
          {description}
        </>
      )}
    </div>
  );
}