import { api } from "./client";

export const fetchPosts = (params) => api.get("/posts", { params }).then((r) => r.data);
export const fetchPost = (slug) => api.get(`/posts/${slug}`).then((r) => r.data);
export const fetchMyPosts = () => api.get("/posts/mine").then((r) => r.data);
export const createPost = (data) => api.post("/posts", data).then((r) => r.data);
export const updatePost = ({ id, data }) => api.put(`/posts/${id}`, data).then((r) => r.data);
export const deletePost = (id) => api.delete(`/posts/${id}`).then((r) => r.data);