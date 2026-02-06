// src/components/layout/content/GridGNews.tsx
import type { GNewsArticle } from '@/services/gnews';
import { Icons } from '@/components/ui/Icons';

type GridGNewsProps = {
  news: GNewsArticle[];
  cols?: number;
};

export default function GridGNews({ news, cols = 4 }: GridGNewsProps) {
  return (
    <div className={`post-grid cols-${cols}`}>
      {news.map((article, index) => (
        <article key={index} className="post-card news-card">
          {article.image && (
            <div className="post-card-image">
              <img src={article.image} alt={article.title} />
            </div>
          )}
          <div className="post-card-content">
            <h3 className="post-card-title">
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                {article.title}
              </a>
            </h3>
            <p className="post-card-excerpt">
              {article.description?.slice(0, 150)}...
            </p>
            <div className="post-card-meta">
              <span className="post-date">
                {/* <Icons.Clock size={14} /> */}
                {/* {new Date(article.publishedAt).toLocaleDateString()} */}
              </span>
              {article.source?.name && (
                <span className="post-source">{article.source.name}</span>
              )}
            </div>
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="button button-outline"
            >
              Leer más <Icons.ExternalLink size={14} />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
