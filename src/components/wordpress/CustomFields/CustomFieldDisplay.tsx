// src/components/wordpress/CustomFields/CustomFieldDisplay.tsx

/**
 * Individual custom field renderer (read-only mode)
 * Handles display of a single field based on its type
 */

import React from 'react';
import { Icons } from '@/components/ui/Icons';
import type { CustomFieldSchema, CustomFieldValue } from '@/types/wordpressTypes';
import { getFileIcon, formatDate, getFieldText } from '@/utils/wordpress/customFieldHelpers';

interface CustomFieldDisplayProps {
  field: CustomFieldSchema;
  value: CustomFieldValue;
  locale?: string;
}

export default function CustomFieldDisplay({ field, value, locale = 'es' }: CustomFieldDisplayProps) {
  const label = field.label[locale] || field.label['es'] || field.id;

  switch (field.type) {
    case 'text':
    case 'textarea':
      return (
        <div className="custom-field-item">
          <p>
            <strong className="field-label">{label}: </strong>
            <span className="field-value">{typeof value === 'string' ? value : String(value)}</span>
          </p>
        </div>
      );

    case 'url':
      return (
        <div className="custom-field-item">
          <p>
            <strong className="field-label">{label}: </strong>
            <a
              href={typeof value === 'string' ? value : ''}
              target="_blank"
              rel="noopener noreferrer"
              className="field-value field-link external-link"
            >
              {/* <Icons.ExternalLink size={18} strokeWidth={1.5} /> */}
              <span>{getFieldText('visitWebsite', locale)}</span>
            </a>
          </p>
        </div>
      );

    case 'file':
      const fileUrl = typeof value === 'string' ? value : '';
      const iconName = getFileIcon(fileUrl);
      const FileIcon = Icons[iconName];

      return (
        <div className="custom-field-item">
          <p>
            <strong className="field-label">{label}: </strong>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="field-value field-link file-download-link"
            >
              {/* <FileIcon size={18} strokeWidth={1.5} /> */}
              <span>{getFieldText('viewFile', locale)}</span>
            </a>
          </p>
        </div>
      );

    case 'date':
      const dateValue = typeof value === 'string' ? value : '';
      const formattedDate = formatDate(dateValue, locale);
      return (
        <div className="custom-field-item">
          <p>
            <strong className="field-label">{label}: </strong>
            <span className="field-value">{formattedDate}</span>
          </p>
        </div>
      );

    case 'select':
    case 'radio':
      const selectedOption = field.options?.find((opt) => opt.value === value);
      const displayValue = selectedOption
        ? selectedOption.label[locale] || selectedOption.label['es'] || String(value)
        : String(value);
      return (
        <div className="custom-field-item">
          <p>
            <strong className="field-label">{label}: </strong>
            <span className="field-value">{displayValue}</span>
          </p>
        </div>
      );

    case 'checkbox':
      return value ? (
        <div className="custom-field-item">
          <p>
            <strong className="field-label">{label}: </strong>
            <span className="field-value">✓ Sí</span>
          </p>
        </div>
      ) : null;

    default:
      return (
        <div className="custom-field-item">
          <p>
            <strong className="field-label">{label}: </strong>
            <span className="field-value">{String(value)}</span>
          </p>
        </div>
      );
  }
}
