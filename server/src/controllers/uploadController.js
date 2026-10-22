import cloudinary from "../config/cloudinary.js";

const uploadBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "blog-cms",
        resource_type: "image",
        transformation: [{ width: 1600, crop: "limit", quality: "auto", fetch_format: "auto" }],
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });
    const result = await uploadBuffer(req.file.buffer);
    res.status(201).json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    next(err);
  }
};