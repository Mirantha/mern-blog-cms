import { Link } from "react-router-dom";

export default function PostCard({ post, onTagClick }) {
  const date = new Date(post.publishedAt || post.createdAt).toLocaleDateString();

  return (
    <article className="card post">
      {post.coverImage && <img className="cover" src={post.coverImage} alt="" loading="lazy" />}
      <h3>
        <Link to={`/posts/${post.slug}`}>{post.title}</Link>
      </h3>
      <p className="muted">
        By {post.author?.name} · {date}
      </p>
      {post.excerpt && <p>{post.excerpt}</p>}
      <div className="tags">
        {post.tags.map((t) => (
          <button key={t} className="tag" onClick={() => onTagClick?.(t)}>
            #{t}
          </button>
        ))}
      </div>
    </article>
  );
}