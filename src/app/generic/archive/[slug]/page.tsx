// src/app/generic/archive/[slug]/page.tsx
// Generic archive page for any CPT

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getAllContent } from "@/api/wordpressApi";
import PostCard from "@/components/ui/PostCard";
import type { WpContent } from "@/types/wordpressTypes";
import LoadingSpinner from "@/components/ui/LoadingSpiner";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";

const POSTS_PER_PAGE = 8;

const getApiParams = (page: number) => {
  return `?per_page=${POSTS_PER_PAGE}&page=${page}&_embed&orderby=date&order=desc`;
};

export default function GenericCptArchivePage() {
  const params = useParams();
  const cptSlug = params.slug as string;

  console.log('GenericCptArchivePage rendered for:', cptSlug);

  // Simple test render
  return (
    <div className="page-one-col">
      <h1>CPT Archive: {cptSlug}</h1>
      <p>This is a generic CPT archive page for {cptSlug}</p>
    </div>
  );

  const [posts, setPosts] = useState<WpContent[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      const initialPosts = await getAllContent<WpContent>(cptSlug, getApiParams(1));
      setPosts(initialPosts || []);
      setHasMore((initialPosts || []).length === POSTS_PER_PAGE);
      setIsLoading(false);
    };
    fetchPosts();
  }, [cptSlug]);

  const handleLoadMore = async () => {
    setIsLoading(true);
    const nextPage = page + 1;
    const newPosts = await getAllContent<WpContent>(cptSlug, getApiParams(nextPage));

    if (newPosts && newPosts.length > 0) {
      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      setPage(nextPage);
      setHasMore(newPosts.length === POSTS_PER_PAGE);
    } else {
      setHasMore(false);
    }
    setIsLoading(false);
  };

  return (
    <div className="page-fullwidth">
      <section className="page-title">
        <h1>{cptSlug.charAt(0).toUpperCase() + cptSlug.slice(1)}</h1>
      </section>

      {posts.length === 0 && !isLoading ? (
        <article>
          <p>No content found in this section.</p>
        </article>
      ) : (
        <div className="post-grid cols-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              item={post}
              basePath={`/${cptSlug}`}
              excerptLength={150}
            />
          ))}
        </div>
      )}

      {isLoading && posts.length === 0 && <LoadingSpinner />}

      {posts.length > 0 && hasMore && !isLoading && (
        <div
          className="load-more-container"
          style={{
            textAlign: "center",
            marginTop: "3rem",
            marginBottom: "6rem",
          }}
        >
          <button onClick={handleLoadMore} className="button">
            Load more
          </button>
        </div>
      )}

      {isLoading && posts.length > 0 && <LoadingSpinner />}
    </div>
  );
}