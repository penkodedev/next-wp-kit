'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Loader2 } from 'lucide-react';
import { getChatBotConfig } from '@/api/wordpressApi';
import { usePathname } from 'next/navigation';
import localesConfig from '@/i18n/locales.generated.json';

// Types
interface ChatBotConfig {
  enabled: boolean;
  name: string;
  welcome: string;
  avatar: string;
  systemPrompt: string;
  placeholder: string;
  position: 'bottom-right' | 'bottom-left';
  color: string;
}

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

// CSS class names
const CLASSES = {
  chatBot: 'chat-bot',
  positionRight: 'chat-bot-position-right',
  positionLeft: 'chat-bot-position-left',
  chatButton: 'chat-bot-button',
  chatButtonIcon: 'chat-bot-button-icon',
  chatWindow: 'chat-bot-window',
  chatHeader: 'chat-bot-header',
  chatHeaderInfo: 'chat-bot-header-info',
  avatar: 'chat-bot-avatar',
  avatarPlaceholder: 'chat-bot-avatar-placeholder',
  avatarIcon: 'chat-bot-avatar-icon',
  chatName: 'chat-bot-name',
  chatStatus: 'chat-bot-status',
  closeButton: 'chat-bot-close-button',
  closeIcon: 'chat-bot-close-icon',
  chatMessages: 'chat-bot-messages',
  message: 'chat-bot-message',
  messageUser: 'chat-bot-message-user',
  messageBot: 'chat-bot-message-bot',
  messageBubble: 'chat-bot-message-bubble',
  loadingBubble: 'chat-bot-loading-bubble',
  spinnerIcon: 'chat-bot-spinner-icon',
  chatInput: 'chat-bot-input',
  input: 'chat-bot-input-field',
  sendButton: 'chat-bot-send-button',
  sendButtonDisabled: 'chat-bot-send-button-disabled',
  sendIcon: 'chat-bot-send-icon',
};

// Helper function to convert URLs to clickable links
function formatMessageContent(content: string) {
  // URL regex pattern
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
  
  // Split content by URLs
  const parts = content.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="chat-bot-link"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

// Animation variants
const buttonVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
} as const;

const chatVariants = {
  initial: { 
    opacity: 0, 
    y: 50,
    scale: 0.9
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      type: 'spring', 
      stiffness: 300, 
      damping: 25 
    }
  },
  exit: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
    transition: { duration: 0.2 }
  }
} as const;

const messageVariants = {
  initial: { 
    opacity: 0, 
    y: 10 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
} as const;

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ChatBotConfig | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  
  // Get current locale from URL pathname
  const currentLocale = pathname ? pathname.split('/')[1] || localesConfig.defaultLocale : localesConfig.defaultLocale;

  // Fetch config when locale changes (e.g. language switch)
  useEffect(() => {
    async function fetchConfig() {
      try {
        const data = await getChatBotConfig(currentLocale);
        setConfig(data);
        
        if (data.enabled && data.welcome) {
          setMessages([{ role: 'bot', content: data.welcome }]);
        }
      } catch (error) {
        console.error('Error fetching ChatBot config:', error);
      }
    }
    fetchConfig();
  }, [currentLocale]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Don't render if disabled or no config
  if (!config?.enabled) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const wpApiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/wp-json', '') || '';
      const res = await fetch(`${wpApiUrl}/wp-json/custom/v1/chatbot?lang=${currentLocale}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'bot', content: data.reply }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: 'Lo siento, hubo un error. Por favor, inténtalo de nuevo.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const positionClass = config.position === 'bottom-left' 
    ? CLASSES.positionLeft 
    : CLASSES.positionRight;

  
  return (
    <div className={`${CLASSES.chatBot} ${positionClass}`}>
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            type="button"
            key="chatButton"
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            className={CLASSES.chatButton}
            onClick={() => setIsOpen(true)}
            aria-label={`Abrir chat con ${config.name}`}
          >
            <Bot className={CLASSES.chatButtonIcon} />
          </motion.button>
        ) : (
          <motion.div
            key="chatWindow"
            variants={chatVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={CLASSES.chatWindow}
            role="dialog"
            aria-label={`Chat con ${config.name}`}
          >
            {/* Header */}
            <div 
              className={CLASSES.chatHeader}
            >
              <div className={CLASSES.chatHeaderInfo}>
                {config.avatar ? (
                  <img 
                    src={config.avatar} 
                    alt={config.name}
                    className={CLASSES.avatar}
                  />
                ) : (
                  <div className={CLASSES.avatarPlaceholder}>
                    <Bot className={CLASSES.avatarIcon} />
                  </div>
                )}
                <div>
                  <h3 className={CLASSES.chatName}>{config.name}</h3>
                  <p className={CLASSES.chatStatus}>Status: Online</p>
                </div>
              </div>
              <button
                type="button"
                className={CLASSES.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar chat"
              >
                <X className={CLASSES.closeIcon} />
              </button>
            </div>

            {/* Messages */}
            <div className={CLASSES.chatMessages}>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  variants={messageVariants}
                  initial="initial"
                  animate="animate"
                  className={`${CLASSES.message} ${msg.role === 'user' ? CLASSES.messageUser : CLASSES.messageBot}`}
                >
                  <div 
                    className={CLASSES.messageBubble}
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {formatMessageContent(msg.content)}
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  variants={messageVariants}
                  initial="initial"
                  animate="animate"
                  className={`${CLASSES.message} ${CLASSES.messageBot}`}
                >
                  <div className={`${CLASSES.messageBubble} ${CLASSES.loadingBubble}`}>
                    <Loader2 className={CLASSES.spinnerIcon} />
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className={CLASSES.chatInput}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={config.placeholder || 'Escribe tu mensaje...'}
                className={CLASSES.input}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`${CLASSES.sendButton} ${!input.trim() || isLoading ? CLASSES.sendButtonDisabled : ''}`}
                aria-label="Enviar mensaje"
              >
                <Send className={CLASSES.sendIcon} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
