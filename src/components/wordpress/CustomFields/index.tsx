// src/components/wordpress/CustomFields/index.tsx

/**
 * Main CustomFields component - orchestrates field schema fetching and rendering
 * Supports both display (readOnly) and edit modes
 * 
 * @example
 * // Display all fields for a CPT
 * <CustomFields cpt="recursos" locale="es" values={post} readOnly />
 */

"use client";

import React, { useEffect, useState } from "react";
import type { CustomFieldSchema, CustomFieldValue } from "@/types/wordpressTypes";
import { hasValue } from "@/utils/wordpress/customFieldHelpers";
import CustomFieldDisplay from "./CustomFieldDisplay";
import CustomFieldInput from "./CustomFieldInput";

interface CustomFieldsProps {
  cpt: string; // CPT slug (e.g. 'recursos', 'noticias')
  locale?: string; // Current language
  values?: Record<string, CustomFieldValue>; // Current field values
  onChange?: (id: string, value: CustomFieldValue) => void; // Callback for changes (edit mode)
  readOnly?: boolean; // Display mode vs edit mode
}

export default function CustomFields({
  cpt,
  locale = "es",
  values = {},
  onChange,
  readOnly = false,
}: CustomFieldsProps) {
  const [fields, setFields] = useState<CustomFieldSchema[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch custom fields schema from WordPress
  useEffect(() => {
    async function fetchFields() {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/custom/v1/custom-fields-schema`);
        const data: CustomFieldSchema[] = await res.json();
        setFields(data.filter((field) => field.cpts.includes(cpt)));
      } catch (e) {
        setFields([]);
      }
      setLoading(false);
    }
    fetchFields();
  }, [cpt]);

  if (loading) return null;
  if (!fields.length) return null;

  // In readOnly mode, filter to show only fields with values
  const fieldsToShow = readOnly
    ? fields.filter((field) => hasValue(values[field.id], field.type))
    : fields;

  if (readOnly && !fieldsToShow.length) return null;

  return (
    <div className={readOnly ? "custom-fields-display" : "custom-fields"}>
      {fieldsToShow.map((field) => {
        const value = values[field.id] ?? "";

        if (readOnly) {
          return <CustomFieldDisplay key={field.id} field={field} value={value} locale={locale} />;
        }

        return <CustomFieldInput key={field.id} field={field} value={value} locale={locale} onChange={onChange} />;
      })}
    </div>
  );
}
