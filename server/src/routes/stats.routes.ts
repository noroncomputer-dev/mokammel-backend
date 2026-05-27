// backend/src/routes/stats.routes.ts
import express from "express";
import { getHomeStats } from "../controllers/stats.controller";

const router = express.Router();

router.get("/home", getHomeStats);

export default router;
