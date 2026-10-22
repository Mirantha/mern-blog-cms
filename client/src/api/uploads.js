import { api } from "./client";

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  // Content-Type අතින් දාන්න එපා, axios/browser එක boundary එක්ක දෙනවා
  return api.post("/uploads/image", formData).then((r) => r.data);
};