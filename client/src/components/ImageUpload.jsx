import { useState } from "react";
import { uploadImage } from "../api/uploads";

export default function ImageUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2MB");
      e.target.value = "";
      return;
    }
    try {
      setUploading(true);
      setError("");
      const { url } = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="stack">
      <label className="muted">Cover image (JPG, PNG, WebP · max 2MB)</label>
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} />
      {uploading && <p className="muted">Uploading...</p>}
      {error && <p className="error">{error}</p>}
      {value && (
        <>
          <img className="cover" src={value} alt="Cover preview" />
          <button type="button" className="danger" onClick={() => onChange("")}>
            Remove image
          </button>
        </>
      )}
    </div>
  );
}