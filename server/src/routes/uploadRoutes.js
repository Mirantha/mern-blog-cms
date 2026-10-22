import { Router } from "express";
import { uploadImage } from "../controllers/uploadController.js";
import { protect, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.post("/image", protect, authorize("editor", "admin"), upload.single("image"), uploadImage);

export default router;