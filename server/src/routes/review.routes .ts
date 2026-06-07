import {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from "#controllers/review.controller.ts";
import { Router } from "express";

const router = Router();

router.get("/:id", getReviewById);
router.get("/", getAllReviews);
router.post("/", createReview);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);

export default router;
