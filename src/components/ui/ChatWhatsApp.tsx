'use client';

import { motion } from 'framer-motion';
// import { MessageCircle } from 'lucide-react';

// Configuración - Teléfono en formato internacional (sin +)
const WHATSAPP_NUMBER = '34676666854';
const DEFAULT_MESSAGE = 'Hola, me gustaría más información sobre tus servicios.';

// Generar URL de WhatsApp
const getWhatsAppUrl = (message?: string) => 
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message || DEFAULT_MESSAGE)}`;

export default function ChatWhatsApp({ 
  position = 'bottom-right',
  customMessage 
}: { 
  position?: 'bottom-right' | 'bottom-left'
  customMessage?: string 
}) {
  const whatsappUrl = getWhatsAppUrl(customMessage);
  
  const positionClass = position === 'bottom-left' ? 'whatsapp-left' : 'whatsapp-right';

  return (
    <div className={`whatsapp-container ${positionClass}`}>
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-button"
        aria-label="Contactar por WhatsApp"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          transition: { type: 'spring', stiffness: 300, damping: 20 }
        }}
      >
        {/* <MessageCircle size={24} /> */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width={24}
          height={24}
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.528 5.845L.057 23.882l6.198-1.448A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.36-.213-3.68.86.876-3.593-.234-.37A9.818 9.818 0 1112 21.818z" />
        </svg>
      </motion.a>
    </div>
  );
}
