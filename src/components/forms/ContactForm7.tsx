// src/components/forms/ContactForm7.tsx

"use client";

import { useEffect, ReactNode } from 'react';
import { logger } from '@/utils/wordpress/logger';

interface ContactForm7Props {
  children: ReactNode;
}

/**
 * ContactForm7 component that enables Contact Form 7 forms to work in headless WordPress setup.
 * Intercepts form submissions and sends them via AJAX to the CF7 REST API endpoint.
 */
export default function ContactForm7({ children }: ContactForm7Props) {
  useEffect(() => {
    // Initialize floating labels for CF7 inputs
    const initFloatingLabels = () => {
      const cf7Forms = document.querySelectorAll('.wpcf7-form');
      
      cf7Forms.forEach(form => {
        // Find all CF7 form control wraps that don't have labels yet
        const wraps = form.querySelectorAll('.wpcf7-form-control-wrap');
        
        wraps.forEach(wrap => {
          const input = wrap.querySelector('input[type="text"], input[type="email"], input[type="tel"], input[type="url"], textarea') as HTMLInputElement | HTMLTextAreaElement;
          
          if (!input || wrap.querySelector('label')) return; // Skip if no input or label already exists
          
          // Get the label text from the wrap's attribute name or placeholder
          const wrapName = wrap.getAttribute('data-name') || input.getAttribute('name') || '';
          const placeholderText = input.getAttribute('placeholder') || wrapName;
          
          if (!placeholderText) return;
          
          // Create label element
          const label = document.createElement('label');
          label.setAttribute('for', input.id || wrapName);
          label.textContent = placeholderText;
          
          // Set placeholder to empty space (required for CSS :placeholder-shown)
          input.setAttribute('placeholder', ' ');
          
          // Add label to wrap
          wrap.appendChild(label);
        });
      });
    };

    // Run on mount and after a short delay (CF7 might inject HTML asynchronously)
    initFloatingLabels();
    const timer = setTimeout(initFloatingLabels, 500);

    // Function to handle form submission
    const handleFormSubmit = async (event: Event) => {
      event.preventDefault();

      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);

      // Get the form ID from the form's data-cf7-form attribute or hidden input
      const formId = form.querySelector('input[name="_wpcf7"]')?.getAttribute('value');

      if (!formId) {
        logger.error('Contact Form 7: Form ID not found');
        return;
      }

      // Get the WordPress API URL
      const wpApiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
      if (!wpApiUrl) {
        logger.error('Contact Form 7: WordPress API URL not configured');
        return;
      }

      // Prepare the submission URL
      const submitUrl = `${wpApiUrl.replace('/wp-json', '')}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`;

      try {
        // Show loading state
        const submitButton = form.querySelector('input[type="submit"], button[type="submit"]') as HTMLInputElement | HTMLButtonElement;
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.value = submitButton.tagName === 'INPUT' ? 'Sending...' : 'Sending...';
        }

        // Send the form data
        const response = await fetch(submitUrl, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        // Handle the response
        if (result.status === 'mail_sent') {
          // Success
          showMessage(form, result.message, 'success');
          form.reset();
        } else if (result.status === 'validation_failed') {
          // Validation errors
          showValidationErrors(form, result.invalid_fields);
        } else {
          // Other errors
          showMessage(form, result.message || 'Error al enviar el formulario', 'error');
        }

      } catch (error) {
        logger.error('Contact Form 7 submission error:', error as Error);
        showMessage(form, 'Error de conexión. Por favor, inténtalo de nuevo.', 'error');
      } finally {
        // Reset loading state
        const submitButton = form.querySelector('input[type="submit"], button[type="submit"]') as HTMLInputElement | HTMLButtonElement;
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.value = submitButton.tagName === 'INPUT' ? 'Enviar' : 'Enviar';
        }
      }
    };

    // Function to show messages
    const showMessage = (form: HTMLFormElement, message: string, type: 'success' | 'error') => {
      // Remove existing messages
      const existingMessages = form.querySelectorAll('.wpcf7-response-output');
      existingMessages.forEach(msg => msg.remove());

      // Create new message element
      const messageDiv = document.createElement('div');
      messageDiv.className = `wpcf7-response-output ${type === 'success' ? 'wpcf7-mail-sent-ok' : 'wpcf7-validation-errors'}`;
      messageDiv.innerHTML = message;

      // Insert before the form
      form.parentNode?.insertBefore(messageDiv, form);

      // Scroll to message
      messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // Function to show validation errors
    const showValidationErrors = (form: HTMLFormElement, invalidFields: any[]) => {
      // Clear previous errors
      const errorElements = form.querySelectorAll('.wpcf7-not-valid-tip');
      errorElements.forEach(el => el.remove());

      // Add new errors
      invalidFields.forEach(field => {
        const input = form.querySelector(`[name="${field.field}"]`) as HTMLElement;
        if (input) {
          const errorDiv = document.createElement('span');
          errorDiv.className = 'wpcf7-not-valid-tip';
          errorDiv.innerHTML = field.message;
          input.parentNode?.insertBefore(errorDiv, input.nextSibling);
        }
      });

      showMessage(form, 'There are errors in the form. Please review the marked fields.', 'error');
    };

    // Find all CF7 forms within this component and attach event listeners
    const cf7Forms = document.querySelectorAll('.wpcf7-form');

    cf7Forms.forEach(form => {
      // Only attach if not already attached
      if (!(form as any)._cf7HandlerAttached) {
        form.addEventListener('submit', handleFormSubmit);
        (form as any)._cf7HandlerAttached = true;
      }
    });

    // Cleanup function
    return () => {
      clearTimeout(timer);
      cf7Forms.forEach(form => {
        form.removeEventListener('submit', handleFormSubmit);
        (form as any)._cf7HandlerAttached = false;
      });
    };
  }, []);

  return <>{children}</>;
}