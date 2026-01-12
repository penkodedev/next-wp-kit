// src/components/navigation/LoadMore.tsx
"use client";

import { useState, useEffect } from "react";
import { getAllContent } from "@/api/wordpressApi";
import PostCard from "@/components/ui/PostCard";
import LoadingSpinner from "@/components/ui/LoadingSpiner";
import type { WpContent } from "@/types/wordpressTypes";
import { getPostsPerPage } from "@/utils/config/pagination";
import { useTranslations } from "next-intl";
import localesConfig from "@/i18n/locales.generated.json";

interface LoadMoreProps {
  postType: string; 
  basePath: string; 
  locale: string; // 'es', 'en'
  initialPostsCount: number; // How many posts were server-rendered (to know if there might be more)
  defaultLocale?: string; // Default locale from WordPress
}

export default function LoadMore({
  postType,
  basePath,
  locale,
  initialPostsCount,
  defaultLocale = localesConfig.defaultLocale,
}: LoadMoreProps) {
  const t = useTranslations("Content");
  const [posts, setPosts] = useState<WpContent[]>([]);
  const [page, setPage] = useState(2); // Start from page 2 (page 1 was SSR)
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const postsPerPage = getPostsPerPage(postType);

  // Hide button if initial posts are less than postsPerPage (no more pages)
  if (initialPostsCount < postsPerPage) {
    return null;
  }

  const handleLoadMore = async () => {
    setIsLoading(true);

    const apiParams =
      locale === defaultLocale
        ? `?per_page=${postsPerPage}&page=${page}&_embed&orderby=date&order=desc`
        : `?per_page=${postsPerPage}&page=${page}&_embed&orderby=date&order=desc&lang=${locale}`;

    const newPosts = await getAllContent<WpContent>(postType, apiParams);

    if (newPosts && newPosts.length > 0) {
      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      setPage((prevPage) => prevPage + 1);
      setHasMore(newPosts.length === postsPerPage);
    } else {
      setHasMore(false);
    }

    setIsLoading(false);
  };

  return (
    <>
      {/* Render loaded posts */}
      {posts.length > 0 && (
        <div className="post-grid cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} item={post} basePath={basePath} />
          ))}
        </div>
      )}

      {/* Loading spinner */}
      {isLoading && <LoadingSpinner />}

      {/* Load more button */}
      {!isLoading && hasMore && (
        <div
          className="load-more-container"
          style={{
            textAlign: "center",
            marginTop: "3rem",
            marginBottom: "6rem",
          }}
        >
          <button onClick={handleLoadMore} className="button">
            {t("loadMore")}
          </button>
        </div>
      )}
    </>
  );
}
