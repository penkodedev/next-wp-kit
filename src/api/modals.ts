import { fetchAPI } from './client';
import type { Modal } from '@/types/wordpressTypes';

/** Fetches all modals that are configured as active popups. */
export async function getActivePopups(): Promise<Modal[] | null> {
  return await fetchAPI<Modal[]>('/custom/v1/active-popups');
}
