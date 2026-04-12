import {
  getProfileById,
  updateProfile,
} from "#controllers/profile.controller.ts";
import { Router } from "express";

const router = Router();

router.get("/:id", getProfileById);
router.put("/:id", updateProfile);

export default router;
