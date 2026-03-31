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

    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const fileUploadI18n: Record<string, { drag: string; browse: string }> = {
      es: { drag: 'Arrastra archivos aquí o',        browse: 'selecciona' },
      en: { drag: 'Drag files here or',              browse: 'browse' },
      pt: { drag: 'Arraste arquivos aqui ou',        browse: 'selecione' },
      fr: { drag: 'Glissez les fichiers ici ou',     browse: 'parcourir' },
      it: { drag: 'Trascina i file qui o',           browse: 'sfoglia' },
      de: { drag: 'Dateien hierher ziehen oder',     browse: 'durchsuchen' },
    };

    const initFileUpload = () => {
      const lang = document.documentElement.lang?.split('-')[0] || 'es';
      const t = fileUploadI18n[lang] || fileUploadI18n.es;
      const cf7Forms = document.querySelectorAll('.wpcf7-form');

      cf7Forms.forEach(form => {
        const fileInputs = form.querySelectorAll<HTMLInputElement>('input[type="file"]');

        fileInputs.forEach(input => {
          if (input.dataset.enhanced) return;
          input.dataset.enhanced = 'true';
          input.setAttribute('multiple', 'multiple');

          const wrap = input.closest('.wpcf7-form-control-wrap') as HTMLElement;
          if (!wrap) return;

          const dropZone = document.createElement('div');
          dropZone.className = 'cf7-file-dropzone';
          dropZone.innerHTML = `
            <div class="cf7-file-dropzone__label">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span>${t.drag} <span class="cf7-file-dropzone__browse">${t.browse}</span></span>
            </div>
            <div class="cf7-file-preview"></div>
          `;

          input.style.display = 'none';
          wrap.appendChild(dropZone);

          const previewContainer = dropZone.querySelector('.cf7-file-preview') as HTMLElement;

          const renderPreviews = () => {
            previewContainer.innerHTML = '';
            if (!input.files?.length) return;

            Array.from(input.files).forEach((file, i) => {
              const item = document.createElement('div');
              item.className = 'cf7-file-preview__item';

              if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.onload = () => URL.revokeObjectURL(img.src);
                item.appendChild(img);
              } else {
                const icon = document.createElement('span');
                icon.className = 'cf7-file-preview__file-icon';
                icon.textContent = file.name.split('.').pop()?.toUpperCase() || 'FILE';
                item.appendChild(icon);
              }

              const name = document.createElement('span');
              name.className = 'cf7-file-preview__name';
              name.textContent = file.name;
              item.appendChild(name);

              const size = document.createElement('span');
              size.className = 'cf7-file-preview__size';
              size.textContent = formatFileSize(file.size);
              item.appendChild(size);

              const removeBtn = document.createElement('button');
              removeBtn.type = 'button';
              removeBtn.className = 'cf7-file-preview__remove';
              removeBtn.setAttribute('aria-label', `Remove ${file.name}`);
              removeBtn.textContent = '×';
              removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dt = new DataTransfer();
                Array.from(input.files!).forEach((f, j) => {
                  if (j !== i) dt.items.add(f);
                });
                input.files = dt.files;
                renderPreviews();
              });
              item.appendChild(removeBtn);

              previewContainer.appendChild(item);
            });
          };

          dropZone.addEventListener('click', (e) => {
            if ((e.target as HTMLElement).closest('.cf7-file-preview__remove')) return;
            input.click();
          });

          dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('cf7-file-dropzone--active');
          });
          dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('cf7-file-dropzone--active');
          });
          dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('cf7-file-dropzone--active');
            if (e.dataTransfer?.files?.length) {
              const dt = new DataTransfer();
              if (input.files) {
                Array.from(input.files).forEach(f => dt.items.add(f));
              }
              Array.from(e.dataTransfer.files).forEach(f => dt.items.add(f));
              input.files = dt.files;
              renderPreviews();
            }
          });

          input.addEventListener('change', renderPreviews);
        });
      });
    };

    // Run on mount and after a short delay (CF7 might inject HTML asynchronously)
    initFloatingLabels();
    initFileUpload();
    const timer = setTimeout(() => {
      initFloatingLabels();
      initFileUpload();
    }, 500);

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
          form.querySelectorAll('.cf7-file-preview').forEach(p => { p.innerHTML = ''; });
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