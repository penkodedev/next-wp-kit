// src/types/index.ts

/**
 * Representa un Recurso (post de WordPress) una vez que ha sido
 * limpiado y procesado por nuestra capa de /lib.
 * Esta es la forma que nuestros componentes React esperan.
 */
export interface Resource {
  id: number;
  slug: string;
  title: string;
  content: string; // HTML ya sanitizado
  excerpt: string;
  featuredImageUrl: string | null;
  authorName: string;
  publicationDate: string; // Formato ISO 8601
  likes: number;
  // ... cualquier otro campo que necesites en el frontend
}

/**
 * Representa el estado de una API call, muy útil para hooks.
 */
export type ApiState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

/**
 * Tipos para las opciones de la encuesta.
 */
export interface SurveyOption {
  id: string;
  text: string;
}

export interface SurveyQuestion {
  id: string;
  question: string;
  options: SurveyOption[];
}
