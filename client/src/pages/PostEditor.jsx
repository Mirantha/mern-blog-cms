import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPost, createPost, updatePost } from "../api/posts";
import ImageUpload from "../components/ImageUpload";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  content: z.string().min(10, "Content must be at least 10 characters"),
  excerpt: z.string().max(300, "Max 300 characters").optional(),
  tags: z.string().optional(), // comma separated: "mern, intro"
  status: z.enum(["draft", "published"]),
  coverImage: z.string().optional(),
});

export default function PostEditor() {
  const { slug } = useParams(); // slug තියෙනවා නම් edit mode
  const isEdit = Boolean(slug);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: existing, isLoading } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPost(slug),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      tags: "",
      status: "draft",
      coverImage: "",
    },
  });

  // Edit mode: ගෙනාපු data form එකට පුරවනවා
  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        content: existing.content,
        excerpt: existing.excerpt || "",
        tags: existing.tags.join(", "),
        status: existing.status,
        coverImage: existing.coverImage || "",
      });
    }
  }, [existing, reset]);

  const save = useMutation({
    mutationFn: (payload) =>
      isEdit ? updatePost({ id: existing._id, data: payload }) : createPost(payload),
    onSuccess: (post) => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["my-posts"] });
      qc.invalidateQueries({ queryKey: ["post"] });
      navigate(post.status === "published" ? `/posts/${post.slug}` : "/dashboard");
    },
  });

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      tags: values.tags
        ? values.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    };
    try {
      await save.mutateAsync(payload);
    } catch (err) {
      setError("root", { message: err.response?.data?.message || "Save failed" });
    }
  };

  if (isEdit && isLoading) return <p>Loading...</p>;

  return (
    <form className="card stack" onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2>{isEdit ? "Edit post" : "New post"}</h2>

      <ImageUpload
        value={watch("coverImage")}
        onChange={(url) => setValue("coverImage", url, { shouldDirty: true })}
      />

      <input placeholder="Title" {...register("title")} />
      {errors.title && <p className="error">{errors.title.message}</p>}

      <textarea rows={10} placeholder="Write your post..." {...register("content")} />
      {errors.content && <p className="error">{errors.content.message}</p>}

      <textarea rows={2} placeholder="Short excerpt (optional)" {...register("excerpt")} />
      {errors.excerpt && <p className="error">{errors.excerpt.message}</p>}

      <input placeholder="Tags (comma separated, e.g. mern, intro)" {...register("tags")} />

      <select {...register("status")}>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>

      {errors.root && <p className="error">{errors.root.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save post"}
      </button>
    </form>
  );
}