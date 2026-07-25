import {
  getProfileById,
  updateProfile,
} from "#controllers/profile.controller.ts";
import { validate } from "#middleware/validate.middleware.ts";
import { updateProfileSchema } from "#validations/profile.validations.ts";
import { Router } from "express";

const router = Router();

router.get("/:id", getProfileById);
router.put("/:id", validate(updateProfileSchema), updateProfile);

export default router;
