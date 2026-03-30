import { fetchAPI } from './client';

/**
 * Fetches ChatBot configuration from WordPress.
 * @param lang - Optional language code for WPML translation (e.g. 'en', 'es', 'pt-br')
 */
export async function getChatBotConfig(lang?: string): Promise<any> {
  const endpoint = lang ? `/custom/v1/chatbot?lang=${lang}` : '/custom/v1/chatbot';
  return await fetchAPI<any>(endpoint);
}
