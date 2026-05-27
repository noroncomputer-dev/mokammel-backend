// server/src/routes/compare.routes.ts

import { Router } from "express";
import {
  getCompareList,
  addToCompare,
  removeFromCompare,
  clearCompare,
  getCompareFields,
} from "../controllers/compare.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// همه روت‌ها نیاز به احراز هویت دارند
router.use(protect);

router.get("/", getCompareList);
router.get("/fields", getCompareFields);
router.post("/", addToCompare);
router.delete("/:productId", removeFromCompare);
router.delete("/", clearCompare);

export default router;
