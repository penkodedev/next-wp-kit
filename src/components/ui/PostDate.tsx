// src/components/ui/PostDate.tsx

//***** USAGE *****/
// Basic usage -  <PostDate date={post.date} />
// With variante short (6 feb.) - <PostDate date={post.date} variant="short" />
// With date & time - <PostDate date={post.date} variant="datetime" />
// With translated label - <PostDate date={post.date} showLabel />
// With custom class - <PostDate className="custom-class" date={post.date} />


import { useTranslations } from 'next-intl';
import { Icons } from '@/components/ui/Icons';

interface PostDateProps {
  date: string; // ISO 8601 date string (e.g., "2026-02-06T10:00:00")
  variant?: 'short' | 'long' | 'datetime';
  showLabel?: boolean;
  className?: string;
}

export default function PostDate({ date, variant = 'long', showLabel = false, className = '' }: PostDateProps) {
  const t = useTranslations('Content');

  const formatDate = (dateString: string, locale: string) => {
    const d = new Date(dateString);

    switch (variant) {
      case 'short':
        return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
      case 'datetime':
        return d.toLocaleDateString(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      case 'long':
      default:
        return d.toLocaleDateString(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
    }
  };

  // Get current locale from the HTML lang attribute
  const locale = typeof window !== 'undefined'
    ? document.documentElement.lang || 'es'
    : 'es';

  const formattedDate = formatDate(date, locale);

  if (showLabel) {
    return (
      <time dateTime={date} className={className}>
        <span className="post-date-label">{t('publishedOn')}: </span>
        <span className="post-date-value">{formattedDate}</span>
      </time>
    );
  }

  return (

    <time className={`post-date ${className}`} dateTime={date}>
      <Icons.Clock size={14} className="post-date-icon" />
      {formattedDate}
      </time>

  );
}
