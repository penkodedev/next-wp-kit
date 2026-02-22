// src/components/layout/footer/FooterSocial.tsx
'use client';

import { Icons } from "@/components/ui/Icons";
import { useTranslations } from 'next-intl';

interface SocialItem {
  name: string;
  url: string;
}

interface FooterSocialProps {
  social: SocialItem[];
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
  const t = useTranslations('Footer');
  
  if (!social || social.length === 0) {
    return null;
  }

  return (
    <div className="footer-social">
      <h3>{t('socialMedia')}</h3>
      <ul className="social-links">
        {social.map((socialItem, index) => {
          const IconComponent = getSocialIcon(socialItem.name);
          return (
            <li key={index}>
              <a href={socialItem.url} target="_blank" rel="noopener noreferrer" title={socialItem.name}>
                <IconComponent size={22} strokeWidth={1.6} />
                {/* <span className="sr-only">{socialItem.name}</span> */}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}