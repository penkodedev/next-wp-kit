// src/components/layout/footer/FooterSocial.tsx
import type { SiteInfo } from "@/types/wordpressTypes";
import { Icons } from "@/components/ui/Icons";

interface FooterSocialProps {
  social: SiteInfo['social'];
}

// Map social network names to Lucide icons
const getSocialIcon = (name: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    'LinkedIn': Icons.Linkedin,
    'Instagram': Icons.Instagram,
    'Facebook': Icons.Facebook,
    'Twitter': Icons.Twitter,
    'YouTube': Icons.Youtube,
    'GitHub': Icons.Github,
    'TikTok': Icons.Video, // Using Video icon as fallback for TikTok
    'WhatsApp': Icons.MessageCircle,
    'Telegram': Icons.Send,
  };

  return iconMap[name] || Icons.Globe; // Default to Globe icon
};

export default function FooterSocial({ social }: FooterSocialProps) {
  if (!social || social.length === 0) {
    return null;
  }

  return (
    <div className="footer-social">
      {/* <h2>Redes Sociales</h2> */}
      <ul className="social-links">
        {social.map((socialItem, index) => {
          const IconComponent = getSocialIcon(socialItem.name);
          return (
            <li key={index}>
              <a href={socialItem.url} target="_blank" rel="noopener noreferrer" title={socialItem.name}>
                <IconComponent size={22} strokeWidth={1.3} />
                {/* <span className="sr-only">{socialItem.name}</span> */}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}