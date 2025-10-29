// src/components/forms/ContactForm7Content.tsx
"use client";

import { ReactNode } from 'react';
import ContactForm7 from './ContactForm7';

interface ContactForm7ContentProps {
  content: string;
  hasForm: boolean;
}

/**
 * Component that conditionally wraps content with ContactForm7 if it contains CF7 forms.
 */
export default function ContactForm7Content({ content, hasForm }: ContactForm7ContentProps) {
  if (hasForm) {
    return (
      <ContactForm7>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </ContactForm7>
    );
  }

  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}