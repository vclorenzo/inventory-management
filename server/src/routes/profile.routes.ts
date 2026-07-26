import {
  createAddress,
  deleteAddress,
  getProfileById,
  updateAddress,
  updateProfile,
} from "#controllers/profile.controller.ts";
import { validate } from "#middleware/validate.middleware.ts";
import {
  createAddressSchema,
  updateAddressSchema,
  updateProfileSchema,
} from "#validations/profile.validations.ts";
import { Router } from "express";

const router = Router();

router.get("/:id", getProfileById);
router.put("/:id", validate(updateProfileSchema), updateProfile);

router.post(
  "/:id/addresses",
  validate(createAddressSchema),
  createAddress,
);
router.put(
  "/:id/addresses/:addressId",
  validate(updateAddressSchema),
  updateAddress,
);
router.delete("/:id/addresses/:addressId", deleteAddress);

export default router;
