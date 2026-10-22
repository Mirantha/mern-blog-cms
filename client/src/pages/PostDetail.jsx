import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPost } from "../api/posts";
import { useAuth } from "../context/AuthContext";

export default function PostDetail() {
  const { slug } = useParams();
  const { user } = useAuth();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPost(slug),
    retry: false,
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError)
    return (
      <div className="card">
        <p className="error">Post not found.</p>
        <Link to="/">← Back to posts</Link>
      </div>
    );

  const canEdit =
    user &&
    ["editor", "admin"].includes(user.role) &&
    (user.role === "admin" || post.author?._id === user.id);

  return (
    <article className="card stack">
      <Link to="/">← Back</Link>
      {post.coverImage && <img className="cover" src={post.coverImage} alt={post.title} />}
      <h1>{post.title}</h1>
      <p className="muted">
        By {post.author?.name} · {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
        {post.status === "draft" && <span className="badge"> draft</span>}
      </p>
      <div className="tags">
        {post.tags.map((t) => (
          <span key={t} className="tag">#{t}</span>
        ))}
      </div>
      <div className="content">{post.content}</div>
      {canEdit && (
        <div>
          <Link className="btn" to={`/editor/${post.slug}`}>Edit post</Link>
        </div>
      )}
    </article>
  );
}