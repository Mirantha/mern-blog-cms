import multer from "multer";

const allowed = ["image/jpeg", "image/png", "image/webp"];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (allowed.includes(file.mimetype)) return cb(null, true);
    const err = new Error("Only JPG, PNG or WebP images are allowed");
    err.statusCode = 400;
    cb(err);
  },
});