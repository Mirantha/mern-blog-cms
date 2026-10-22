import { z } from "zod";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const sendToken = (res, user, status = 200) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(status).json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

export const register = async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }
    const { name, email, password } = parsed.data;

    if (await User.findOne({ email })) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });
    sendToken(res, user, 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const { email, password } = parsed.data;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    sendToken(res, user);
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};

export const me = (req, res) => {
  const u = req.user;
  res.json({ user: { id: u._id, name: u.name, email: u.email, role: u.role } });
};