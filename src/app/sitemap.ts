import { MetadataRoute } from 'next';
import { getAllPosts, getAllPages } from '@/api/wordpressApi';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  const [posts, pages] = await Promise.all([
    getAllPosts('?per_page=100&_fields=slug,modified'),
    getAllPages('?per_page=100&_fields=slug,modified'),
  ]);

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  const postUrls: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.modified),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const pageUrls: MetadataRoute.Sitemap = (pages || [])
    .filter((page) => page.slug !== 'home' && page.slug !== 'front-page')
    .map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date(page.modified),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  return [...staticUrls, ...pageUrls, ...postUrls];
}
