// src/components/layout/footer/FooterCopyright.tsx

interface FooterCopyrightProps {
  title?: string;
  description?: string;
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
      {showTitle && <>&copy; {new Date().getFullYear()} {title}</>}
      {showDescription && description && (
        <>
          <br />
          {description}
        </>
      )}
    </div>
  );
}