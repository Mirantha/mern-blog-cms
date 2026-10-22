import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login, logout, me } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { message: "Too many attempts, try again later" },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.get("/me", protect, me);

export default router;