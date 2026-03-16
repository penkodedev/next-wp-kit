// src/types/wordpressTypes.ts


// -----------------------------------------------------
//             Custom Field Schema Types
// -----------------------------------------------------

// Optional enum for known CPT slugs (extend as needed)
export type CptSlug = 'recursos' | 'noticias' | 'eventos' | string;

// Supported custom field types
export type CustomFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'url'
  | 'file'
  | 'repeater'
  | 'relation'
  | 'color'
  | 'group';

export interface CustomFieldOption {
  value: string | number;
  label: Record<string, string>; // Multilingual label
}

// Base interface for all custom fields
export interface CustomFieldSchemaBase {
  id: string;
  label: Record<string, string>; // Multilingual label
  type: CustomFieldType;
  cpts: CptSlug[]; // Associated CPTs
  required?: boolean;
  description?: Record<string, string>; // Multilingual description
  showIf?: { fieldId: string; value: CustomFieldValue }; // Conditional display
}

// Text, textarea, url, date, number, file
export interface CustomFieldText extends CustomFieldSchemaBase {
  type: 'text' | 'textarea' | 'url' | 'date';
  placeholder?: Record<string, string>;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface CustomFieldNumber extends CustomFieldSchemaBase {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
}

export interface CustomFieldSelect extends CustomFieldSchemaBase {
  type: 'select' | 'radio';
  options: CustomFieldOption[];
}

export interface CustomFieldCheckbox extends CustomFieldSchemaBase {
  type: 'checkbox';
  options?: CustomFieldOption[]; // Optional: for multi-checkbox
}

export interface CustomFieldMedia extends CustomFieldSchemaBase {
  type: 'file';
  allowedTypes?: string[]; // e.g. ['image/jpeg', 'application/pdf']
  maxSizeMB?: number;
}

export interface CustomFieldColor extends CustomFieldSchemaBase {
  type: 'color';
  default?: string;
}

export interface CustomFieldRelation extends CustomFieldSchemaBase {
  type: 'relation';
  relationTo: 'post' | 'user' | 'media' | string;
  multiple?: boolean;
}

export interface CustomFieldRepeater extends CustomFieldSchemaBase {
  type: 'repeater';
  fields: CustomFieldSchema[];
}

export interface CustomFieldGroup extends CustomFieldSchemaBase {
  type: 'group';
  fields: CustomFieldSchema[];
}

// Main union for all custom field schemas
export type CustomFieldSchema =
  | CustomFieldText
  | CustomFieldNumber
  | CustomFieldSelect
  | CustomFieldCheckbox
  | CustomFieldMedia
  | CustomFieldColor
  | CustomFieldRelation
  | CustomFieldRepeater
  | CustomFieldGroup;

// -----------------------------------------------------
//             Custom Field Value Types
// -----------------------------------------------------

// File metadata structure returned by WordPress
export interface FileMetadata {
  id: number;
  url: string;
  filename: string;
  filesize?: number;
  mime_type?: string;
}

// Relation data structure
export interface RelationData {
  id: number;
  title: string;
  type: string;
}

// Color value structure
export interface ColorValue {
  r: number;
  g: number;
  b: number;
  a?: number; // alpha/opacity
}

// Discriminated union for custom field values based on type
export type CustomFieldValue =
  | string                    // text, textarea, url, date
  | number                    // number
  | boolean                   // checkbox (single)
  | string[]                  // select (multiple), checkbox (multiple)
  | FileMetadata              // file
  | RelationData[]            // relation
  | ColorValue                // color
  | Record<string, unknown>[] // repeater (array of field groups)
  | Record<string, unknown>;  // group (nested fields)

// Type guard helpers
export const isFileMetadata = (value: CustomFieldValue): value is FileMetadata => {
  return typeof value === 'object' && value !== null && 'url' in value && 'filename' in value;
};

export const isRelationData = (value: CustomFieldValue): value is RelationData[] => {
  return Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null && 'id' in value[0] && 'title' in value[0];
};

export const isColorValue = (value: CustomFieldValue): value is ColorValue => {
  return typeof value === 'object' && value !== null && 'r' in value && 'g' in value && 'b' in value;
};

// Example usage:
// const fields: CustomFieldSchema[] = [...]

// -----------------------------------------------------
//             Taxonomy & Term Types
// -----------------------------------------------------


export interface Taxonomy {
  name: string;
  slug: string;
  types: string[]; // Associated CPTs
  description?: string;
  hierarchical: boolean;
  rest_base: string;
  show_ui: boolean;
  show_in_rest: boolean;
}

export interface Term {
  id: number;
  name: string;
  slug: string;
  taxonomy: string;
  description?: string;
  parent?: number;
  count?: number;
  meta?: Record<string, unknown>;
}



// -----------------------------------------------------
//             Menu Types
// -----------------------------------------------------
/**
 * Interface for a menu item, potentially with children (submenus).
 * Matches the structure returned by the `clean_menu_items` PHP function.
 */
export interface MenuItem {
  id: number;
  parent: string | number; // Parent can be 0
  title: string;
  url: string;
  target?: string; // E.g. '_blank'
  classes?: string[]; // CSS classes assigned in the WP menu
  children?: MenuItem[]; // Optional, recursive
  description?: string; // Native WP (Description in menu editor)
  image?: string; // Image URL for Mega Menu
}

/** API response when fetching menu by location/slug */
export interface MenuResponse {
  items: MenuItem[];
  mega_menu_enabled: boolean;
}

// -----------------------------------------------------
//             All Menus Type
// -----------------------------------------------------
/**
 * Object containing all site menus, indexed by their slug.
 * Matches the structure returned by `get_all_menus_data` in PHP.
 */
export type AllMenus = {
  [slug: string]: {
    slug: string;
    name: string;
    location: string | null; // Theme location, if set
    items: MenuItem[];
  };
};


// -----------------------------------------------------
//             Site Info Types
// -----------------------------------------------------
/**
 * Interface for basic site information.
 */
export interface SiteInfo {
  title: string;
  description: string;
  back_url: string;
  front_url: string;
  light_logo: string;
  dark_logo: string;
  favicons: {
    icon_32: string;
    icon_180: string;
    icon_192: string;
    icon_512: string;
  };
  date_format: string;
  language: string;
  social: SocialLink[];
  contact: ContactInfo[];
  analytics: {
    google_analytics_id: string;
    facebook_pixel_id: string;
    gtm_id: string;
    twitter_pixel_id: string;
  };
  i18n: {
    default_locale: string;
    locales: string[];
  };
}

export interface SocialLink {
  name: string;
  url: string;
  icon?: string;
}

export interface ContactInfo {
  type: string;
  value: string;
}


// -----------------------------------------------------
//             WordPress Content Types
// -----------------------------------------------------
/**
 * Base interface for any type of WordPress content.
 */
export interface WpContent {
  id: number;
  date: string;
  slug: string;
  type: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  _embedded?: EmbeddedData; // Embedded data like author, featured image, etc.
  meta?: Record<string, any>; // Custom fields (REST API)
  likes?: number; // Like count from custom endpoint
  audio_url?: string; // Audio file URL for text-to-speech
  yoast_head_json?: {
    title?: string;
    description?: string;
    robots?: {
      index?: string;
      follow?: string;
      'max-snippet'?: string;
      'max-image-preview'?: string;
      'max-video-preview'?: string;
    };
    canonical?: string;
    og_locale?: string;
    og_type?: string;
    og_title?: string;
    og_description?: string;
    og_url?: string;
    og_site_name?: string;
    og_image?: Array<{
      url: string;
      width?: number;
      height?: number;
      type?: string;
    }>;
    twitter_card?: string;
    twitter_title?: string;
    twitter_description?: string;
    twitter_image?: string;
    schema?: Record<string, any>; // JSON-LD structured data
  };
  // Custom meta fields exposed at root level via register_rest_field
  recurso_autoria?: string;
  recurso_web_url?: string;
  recurso_pdf_url?: string;
  recurso_pdf_id?: string;
  [key: string]: any; // Allow any other custom fields dynamically
}

export interface EmbeddedData {
  author?: Array<{ id: number; name: string; }>; // Typical WP REST author
  'wp:featuredmedia'?: Array<{ id: number; source_url: string; }>; // Featured image
  // Allow any other embedded keys (for taxonomies, terms, etc.)
  [key: string]: unknown;
}

// -----------------------------------------------------
//             Post & Page Types
// -----------------------------------------------------

// Interface for a WordPress Post
export interface Post extends WpContent {}

// Interface for a WordPress Page
export interface Page extends WpContent {
  parent: number;
}

// -----------------------------------------------------
//             Custom Post Types (CPT)
// -----------------------------------------------------
/*
 * Generic types for Custom Post Types
 *
 * All CPTs use the base WpContent interface.
 * For specific type safety, use WpContent directly
 * or create specific types in your components if needed.
 */

// -----------------------------------------------------
//             Modal CPT Type
// -----------------------------------------------------
/*
 * Interface for the 'Modal' CPT.
 */
export interface Modal extends WpContent {
  popup_settings?: {
    is_popup: boolean;
    delay: number;
    frequency: string;
    display_pages: string[];
  };
}

// -----------------------------------------------------
//             Search Result Type
// -----------------------------------------------------
/*
 * Interface for a WordPress search endpoint result.
 */
export interface SearchResult {
  id: number;
  // The search endpoint returns 'title' as a simple string,
  // but sometimes it comes as an object { rendered: string }.
  // We handle it as a union type to be robust.
  title: string | { rendered: string };
  url: string;
  type: 'post' | 'page' | string; // Can be 'post', 'page' or any CPT slug.
  _embedded?: {
    self: [{
      excerpt: {
        rendered: string;
      }
    }]
  }
}

// -----------------------------------------------------
//             Post Navigation Type
// -----------------------------------------------------
/**
 * Interface for post navigation data (previous/next).
 */
export interface PostNavigation {
  previous: {
    title: string;
    slug: string;
  } | null;
  next: { title: string; slug: string } | null;
}