// src/types/wordpressTypes.ts

/**
 * Interface for a menu item, potentially with children (submenus).
 */
export interface MenuItem {
  id: number;
  parent: string;
  title: string;
  url: string;
  children?: MenuItem[]; // Children are optional and recursive
}

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
  social: any[];
  contact: any[];
  analytics: any;
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
  _embedded: any; // For embedded data like author, featured image, etc.
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