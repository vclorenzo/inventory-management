import {
  addBid,
  getBids,
  removeBid,
  updateBid,
} from "#controllers/bid.controller.ts";
import { authenticateToken } from "#middleware/auth.middleware.ts";
import { validate } from "#middleware/validate.middleware.ts";
import {
  addBidSchema,
  updateBidSchema,
} from "#validations/bid.validations.ts";
import { Router } from "express";

const router = Router();

router.use(authenticateToken);

router.get("/", getBids);
router.post("/", validate(addBidSchema), addBid);
router.put("/:id", validate(updateBidSchema), updateBid);
router.delete("/:id", removeBid);

export default router;
