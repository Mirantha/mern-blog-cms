import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) return res.status(401).json({ message: "User no longer exists" });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

  // Login වෙලා ඉන්නවා නම් req.user දානවා, නැත්නම් නොසලකා යනවා
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      const { id } = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(id);
    }
  } catch {
    // invalid token නම් guest කෙනෙක් විදියට ඉදිරියට යනවා
  }
  next();
};