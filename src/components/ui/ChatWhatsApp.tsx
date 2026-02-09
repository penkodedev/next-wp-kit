'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

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
        <MessageCircle size={24} />
      </motion.a>
    </div>
  );
}
