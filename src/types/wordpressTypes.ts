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
  showIf?: { fieldId: string; value: any }; // Conditional display
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
  site_icon_url: string;
  date_format: string;
  language: string;
  social: SocialLink[];
  contact: ContactInfo[];
  analytics: AnalyticsInfo[];
}

export interface SocialLink {
  name: string;
  url: string;
  icon?: string;
}

export interface ContactInfo {
  name: string;
  value: string;
  type?: string;
}

export interface AnalyticsInfo {
  provider: string;
  id: string;
  // You can add more fields depending on your WP setup
  i18n: {
    default_locale: string;
    locales: string[];
  };
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
  yoast_head_json?: {
    title?: string;
    description?: string;
    og_title?: string;
    og_description?: string;
    og_url?: string;
    og_image?: Array<{ url: string }>;
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