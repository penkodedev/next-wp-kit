// src/types/wordpress.ts

/**
 * Interfaz para un elemento de menú, potencialmente con hijos (submenús).
 */
export interface MenuItem {
  id: number;
  parent: string;
  title: string;
  url: string;
  children?: MenuItem[]; // Los hijos son opcionales y recursivos
}

/**
 * Interfaz para la información básica del sitio.
 */
export interface SiteInfo {
  title: string;
  description: string;
  site_url: string;
  wp_url: string;
  site_icon_url: string;
  date_format: string;
  language: string;
}

/**
 * Interfaz base para cualquier tipo de contenido de WordPress.
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
    rendered:string;
  };
  excerpt: {
    rendered: string;
  };
  _embedded: any; // Para datos embebidos como autor, imagen destacada, etc.
}

/**
 * Interfaz para un Post de WordPress.
 */
export interface Post extends WpContent {}

/**
 * Interfaz para una Página de WordPress.
 */
export interface Page extends WpContent {}

/**
 * Interfaz para el CPT 'Proyecto'.
 */
export interface Proyecto extends WpContent {}

/**
 * Interfaz para el CPT 'Recursos'.
 */
export interface Recurso extends WpContent {}

/**
 * Interfaz para el CPT 'Modal'.
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
 * Interfaz para un resultado del endpoint de búsqueda de WordPress.
 */
export interface SearchResult {
  id: number;
  // El endpoint de búsqueda devuelve 'title' como un string simple,
  // pero a veces puede venir como un objeto { rendered: string }.
  // Lo manejamos como un tipo de unión para ser robustos.
  title: string | { rendered: string };
  url: string;
  type: 'post' | 'page'  | 'recursos' | string; // Puede ser 'post', 'page' o el slug de un CPT.
  _embedded?: {
    self: [{
      excerpt: {
        rendered: string;
      }
    }]
  }
}

/**
 * Interfaz para los datos de navegación de un post (anterior/siguiente).
 */
export interface PostNavigation {
  previous: {
    title: string;
    slug: string;
  } | null;
  next: { title: string; slug: string } | null;
}