import * as reviewService from "../services/review.service";
import { Request, Response } from "express";

export const getReviewById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await reviewService.getReviewById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    } else {
      res
        .status(200)
        .json({ message: "Review retrieved successfully", data: review });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving review" });
  }
};

export const getAllReviews = async (req: Request, res: Response) => {
  const sortOrder = req.query.sortOrder?.toString() as
    | "asc"
    | "desc"
    | undefined;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const parsedLimit = Number(req.query.limit);
  const limit =
    req.query.limit !== undefined && !Number.isNaN(parsedLimit)
      ? Math.max(parsedLimit, 1)
      : undefined;

  try {
    const { reviews, totalCount } = await reviewService.getAllReviews({
      sortOrder,
      page,
      limit,
    });
    const totalPages =
      limit !== undefined ? Math.max(Math.ceil(totalCount / limit), 1) : 1;
    res.status(200).json({
      message: "Successfully retrieved products",
      data: reviews,
      page,
      limit,
      totalPages,
      totalCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving reviews" });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const { userId, reviewerId, rating, comment } = req.body;
    const review = await reviewService.createReview({
      userId,
      reviewerId,
      rating,
      comment,
    });
    res.status(201).json({ message: "Review created successfully", review });
  } catch (error) {
    res.status(500).json({ message: "Error creating review" });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedReview = await reviewService.updateReview(id, data);
    res
      .status(200)
      .json({ message: "Review updated successfully", data: updatedReview });
  } catch (error) {
    res.status(500).json({ message: "Error updating review" });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedReview = await reviewService.deleteReview(id);
    res
      .status(200)
      .json({ message: "Review deleted successfully", data: deletedReview });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review" });
  }
};
