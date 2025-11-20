// --- Taxonomy & Term Types ---

export interface Taxonomy {
  name: string;
  slug: string;
  types: string[]; // CPTs asociados
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
// src/types/wordpressTypes.ts

/**
 * Interface for a menu item, potentially with children (submenus).
 * This interface reflects the structure returned by the `clean_menu_items` function in PHP.
 */
export interface MenuItem {
  id: number;
  parent: string | number; // Parent can be 0
  title: string;
  url: string;
  target?: string; // E.g. '_blank'
  classes?: string[]; // CSS classes assigned in the WP menu
  children?: MenuItem[]; // Children are optional and recursive
}

/**
 * Object containing all site menus, indexed by their slug.
 * Reflects the structure returned by `get_all_menus_data` in PHP.
 */
export type AllMenus = {
  [slug: string]: {
    slug: string;
    name: string;
  location: string | null; // Theme location, if set
    items: MenuItem[];
  };
};

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
  // Puedes añadir más campos según tu WP
  i18n: {
    default_locale: string;
    locales: string[];
  };
}

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
  _embedded?: EmbeddedData; // For embedded data like author, featured image, etc.
}

export interface EmbeddedData {
  author?: Array<{ id: number; name: string; }>; // Typical WP REST author
  'wp:featuredmedia'?: Array<{ id: number; source_url: string; }>; // Featured image
  // Allow any other embedded keys (for taxonomies, terms, etc.)
  [key: string]: unknown;
}

/**
 * Interface for a WordPress Post.
 */
export interface Post extends WpContent {}

/**
 * Interface for a WordPress Page.
 */
export interface Page extends WpContent {
  parent: number;
}

/**
 * Generic types for Custom Post Types
 *
 * All CPTs use the base WpContent interface.
 * For specific type safety, use WpContent directly
 * or create specific types in your components if needed.
 */

/**
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

/**
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