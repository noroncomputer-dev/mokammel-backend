import express from "express";
import { getSettings, updateSettings } from "../controllers/setting.controller";
import { protect, adminOnly } from "../middleware/auth.middleware";

const router = express.Router();

// همه مسیرها نیاز به احراز هویت و دسترسی ادمین دارند
router.use(protect, adminOnly);

router.route("/").get(getSettings).put(updateSettings);

export default router;
