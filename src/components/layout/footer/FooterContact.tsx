// src/components/layout/footer/FooterContact.tsx
import type { SiteInfo } from "@/types/wordpressTypes";
import { Icons } from "@/components/ui/Icons";

interface FooterContactProps {
  contact: SiteInfo['contact'];
}

// Map contact types to Lucide icons
const getContactIcon = (type: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    'Teléfono': Icons.Phone,
    'Email': Icons.Mail,
    'Correo': Icons.Mail,
    'Dirección': Icons.MapPin,
    'Dónde estamos': Icons.MapPin,
    'Ubicación': Icons.MapPin,
  };

  return iconMap[type] || Icons.Globe; // Default to Globe icon
};

export default function FooterContact({ contact }: FooterContactProps) {
  if (!contact || Object.keys(contact).length === 0) {
    return null;
  }

  return (
    <div className="footer-contact">
      <h2>Contacto</h2>
      {Object.values(contact).map((contactItem: any, index) => {
        const IconComponent = getContactIcon(contactItem.type);
        return (
          <p key={index} className="contact-item">
            <IconComponent size={22} strokeWidth={1.5} className="contact-icon" />
            <span dangerouslySetInnerHTML={{ __html: `<strong>${contactItem.type}:</strong> ${contactItem.value}` }} />
          </p>
        );
      })}
    </div>
  );
}