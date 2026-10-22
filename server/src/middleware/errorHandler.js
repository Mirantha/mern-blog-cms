export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);
    if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Image must be under 2MB" });
  }

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: "Validation failed", errors });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: "Duplicate value, already exists" });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Server error",
  });
};