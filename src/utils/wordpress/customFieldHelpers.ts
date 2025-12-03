// src/utils/wordpress/customFieldHelpers.ts

/**
 * Utility functions for custom fields validation and formatting
 */

import type { CustomFieldValue } from '@/types/wordpressTypes';

/**
 * Validates if a field value should be considered "not empty"
 */
export function hasValue(value: CustomFieldValue, fieldType: string): boolean {
  // Explicitly empty values
  if (value === null || value === undefined || value === '') return false;
  
  // For file/relation fields, validate URL or ID > 0
  if (fieldType === 'file' || fieldType === 'relation') {
    // If it's a URL (string starting with http), it's valid
    if (typeof value === 'string' && value.startsWith('http')) {
      return true;
    }
    // If it's a numeric ID, validate > 0
    const numValue = typeof value === 'string' ? parseInt(value, 10) : typeof value === 'number' ? value : 0;
    return !isNaN(numValue) && numValue > 0;
  }
  
  // For arrays (multi-checkbox, repeater)
  if (Array.isArray(value)) return value.length > 0;
  
  // For objects
  if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
  
  return true;
}

/**
 * Determines the appropriate icon for a file based on its extension
 */
export function getFileIcon(fileUrl: string): 'FileText' | 'Image' | 'File' {
  const fileName = fileUrl.split('/').pop() || '';
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (extension === 'pdf' || extension?.match(/doc|docx/)) {
    return 'FileText';
  }
  
  if (extension?.match(/jpg|jpeg|png|gif|webp|svg/)) {
    return 'Image';
  }
  
  return 'File';
}

/**
 * Formats a date value according to locale
 */
export function formatDate(dateValue: string, locale: string = 'es'): string {
  try {
    return new Date(dateValue).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US');
  } catch {
    return dateValue;
  }
}

/**
 * Gets translated text for common field actions
 */
export function getFieldText(key: 'visitWebsite' | 'viewFile', locale: string = 'es'): string {
  const translations = {
    visitWebsite: { es: 'Visitar web', en: 'Visit website' },
    viewFile: { es: 'Ver archivo', en: 'View file' },
  };
  
  return translations[key][locale as 'es' | 'en'] || translations[key].es;
}
