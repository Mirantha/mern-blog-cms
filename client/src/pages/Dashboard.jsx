import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMyPosts, deletePost } from "../api/posts";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const canWrite = ["editor", "admin"].includes(user.role);

  const { data, isLoading } = useQuery({
    queryKey: ["my-posts"],
    queryFn: fetchMyPosts,
    enabled: canWrite,
  });

  const remove = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-posts"] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return (
    <>
      <div className="card">
        <h2>Dashboard</h2>
        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
        <p>
          Role: <strong>{user.role}</strong>
        </p>
      </div>

      {canWrite && (
        <div className="card">
          <div className="row">
            <h3>My posts</h3>
            <Link className="btn" to="/editor/new">+ New post</Link>
          </div>

          {isLoading && <p>Loading...</p>}
          {data?.data.length === 0 && <p className="muted">No posts yet.</p>}

          {data?.data.map((post) => (
            <div className="row" key={post._id}>
              <div>
                <Link to={`/posts/${post.slug}`}>{post.title}</Link>{" "}
                <span className={`badge ${post.status}`}>{post.status}</span>
              </div>
              <div className="actions">
                <Link to={`/editor/${post.slug}`}>Edit</Link>
                <button
                  className="danger"
                  onClick={() => {
                    if (confirm("Delete this post?")) remove.mutate(post._id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}