// src/components/wordpress/CustomFields/CustomFieldInput.tsx

/**
 * Individual custom field editor (form input mode)
 * Handles editing/input of a single field based on its type
 */

import React from 'react';
import type { CustomFieldSchema, CustomFieldValue } from '@/types/wordpressTypes';

interface CustomFieldInputProps {
  field: CustomFieldSchema;
  value: CustomFieldValue;
  locale?: string;
  onChange?: (id: string, value: CustomFieldValue) => void;
}

export default function CustomFieldInput({ field, value, locale = 'es', onChange }: CustomFieldInputProps) {
  const label = field.label[locale] || field.label['es'] || field.id;

  switch (field.type) {
    case 'text':
    case 'url':
    case 'date':
      return (
        <div className="custom-field">
          <label htmlFor={field.id}>{label}</label>
          <input
            id={field.id}
            type={field.type === 'date' ? 'date' : field.type === 'url' ? 'url' : 'text'}
            value={typeof value === 'string' ? value : ''}
            placeholder={field.placeholder?.[locale] || ''}
            required={field.required}
            onChange={(e) => onChange?.(field.id, e.target.value)}
          />
        </div>
      );

    case 'textarea':
      return (
        <div className="custom-field">
          <label htmlFor={field.id}>{label}</label>
          <textarea
            id={field.id}
            value={typeof value === 'string' ? value : ''}
            placeholder={field.placeholder?.[locale] || ''}
            required={field.required}
            onChange={(e) => onChange?.(field.id, e.target.value)}
          />
        </div>
      );

    case 'select':
    case 'radio':
      return (
        <div className="custom-field">
          <label>{label}</label>
          <select
            id={field.id}
            value={typeof value === 'string' || typeof value === 'number' ? value : ''}
            required={field.required}
            onChange={(e) => onChange?.(field.id, e.target.value)}
          >
            <option value="">Selecciona...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label[locale] || opt.label['es'] || opt.value}
              </option>
            ))}
          </select>
        </div>
      );

    case 'checkbox':
      return (
        <div className="custom-field">
          <label>
            <input
              type="checkbox"
              id={field.id}
              checked={!!value}
              onChange={(e) => onChange?.(field.id, e.target.checked)}
            />
            {label}
          </label>
        </div>
      );

    default:
      return (
        <div className="custom-field">
          <label>{label}</label>
          <span>Tipo de campo no soportado: {field.type}</span>
        </div>
      );
  }
}
