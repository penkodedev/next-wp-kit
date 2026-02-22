// src/components/layout/footer/FooterContact.tsx
"use client";

import { useState, useEffect } from "react";
import { Icons } from "@/components/ui/Icons";
import { useTranslations } from 'next-intl';

interface ContactItem {
  type: string;
  value: string;
}

interface FooterContactProps {
  contact: ContactItem[];
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
  const t = useTranslations('Footer');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!contact || Object.keys(contact).length === 0) {
    return null;
  }

  return (
    <div className="footer-contact">
      <h3>{t('contact')}</h3>
      {Object.values(contact).map((contactItem: any, index) => {
        const IconComponent = getContactIcon(contactItem.type);
        return (
          <p key={index} className="contact-item">
            <IconComponent size={22} strokeWidth={1.5} className="contact-icon" />
            <span>
              <strong className="contact-type">{contactItem.type}:</strong>{' '}
              {isClient ? (
                <span dangerouslySetInnerHTML={{ __html: contactItem.value || '' }} />
              ) : (
                <span>{contactItem.value || ''}</span>
              )}
            </span>
          </p>
        );
      })}
    </div>
  );
}