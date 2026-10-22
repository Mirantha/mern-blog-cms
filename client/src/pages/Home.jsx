import { useEffect, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchPosts } from "../api/posts";
import PostCard from "../components/PostCard";

export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["posts", { search, tag, page }],
    queryFn: () => fetchPosts({ search, tag, page, limit: 6 }),
    placeholderData: keepPreviousData,
  });

  const pagination = data?.pagination;

  return (
    <>
      <div className="card toolbar">
        <input
          placeholder="Search posts..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        {tag && (
          <button
            className="tag"
            onClick={() => {
              setTag("");
              setPage(1);
            }}
          >
            #{tag} ✕
          </button>
        )}
      </div>

      {isLoading && <p>Loading...</p>}
      {isError && <p className="error">Failed to load posts. Is the server running?</p>}
      {data && data.data.length === 0 && <p className="muted">No posts found.</p>}

      <div style={{ opacity: isFetching ? 0.6 : 1 }}>
        {data?.data.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onTagClick={(t) => {
              setTag(t);
              setPage(1);
            }}
          />
        ))}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            ← Prev
          </button>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>
            Next →
          </button>
        </div>
      )}
    </>
  );
}