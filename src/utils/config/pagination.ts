// src/utils/config/pagination.ts

/**
 * Global pagination configuration
 * Centralized control for posts per page across the entire site
 */

export const PAGINATION_CONFIG = {
  /** Default posts per page for archives */
  postsPerPage: 12,
  
  /** Posts per page for specific CPTs (override default) */
  cptOverrides: {
    recursos: 6,
    resorts: 6,
    noticias: 2,
    news: 2,
  } as Record<string, number>, // Allow dynamic access
  
  /** Posts per page for "Load More" button */
  loadMoreIncrement: 8,
};

/**
 * Get posts per page for a specific CPT
 * @param cpt - Custom Post Type slug
 * @returns Number of posts to show per page
 */
export function getPostsPerPage(cpt: string): number {
  return PAGINATION_CONFIG.cptOverrides[cpt] || PAGINATION_CONFIG.postsPerPage;
}
