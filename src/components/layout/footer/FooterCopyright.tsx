// src/components/layout/footer/FooterCopyright.tsx
import type { SiteInfo } from "@/types/wordpressTypes";

interface FooterCopyrightProps {
  title: SiteInfo['title'];
  description: SiteInfo['description'];
}

export default function FooterCopyright({ title, description }: FooterCopyrightProps) {
  return (
    <div className="footer-copy">
      &copy; {new Date().getFullYear()} {title}
      <br />
      {description}
      <br />
    </div>
  );
}