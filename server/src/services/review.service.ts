import { AppError } from "#error/AppError.ts";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Review = {
  userId: string;
  reviewerId: string;
  rating: number;
  comment: string;
};

export const getAllReviews = async ({
  sortOrder = "desc",
  page = 1,
  limit,
}: {
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}) => {
  try {
    const [totalCount, reviews] = await prisma.$transaction([
      prisma.reviews.count(),
      prisma.reviews.findMany({
        include: {
          reviewedUser: {
            select: {
              name: true,
            },
          },
          reviewer: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);
    return {
      reviews: reviews.map((review) => ({
        reviewId: review.reviewId,
        userId: review.userId,
        rating: review.rating,
        comment: review.comment,
        userName: review.reviewedUser.name,
        reviewerName: review.reviewer.name,
      })),
      totalCount,
    };
  } catch (error) {
    throw error;
  }
};

export const getReviewById = async (reviewId: string) => {
  try {
    return await prisma.reviews.findFirst({
      where: { reviewId },
    });
  } catch (error) {
    throw error;
  }
};

export const createReview = async (data: Review) => {
  try {
    return await prisma.reviews.create({
      data: {
        userId: data.userId,
        reviewerId: data.reviewerId,
        rating: data.rating,
        comment: data.comment,
      },
    });
  } catch (error) {
    throw error;
  }
};

type ReviewUpdatePayload = {
  rating: number;
  comment: string;
};

export const updateReview = async (
  reviewId: string,
  data: ReviewUpdatePayload,
) => {
  try {
    const existingReview = await getReviewById(reviewId);
    if (!existingReview) {
      throw new AppError("Review does not exist");
    }

    return await prisma.reviews.update({
      where: { reviewId },
      data: {
        rating: data.rating,
        comment: data.comment,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const deleteReview = async (id: string) => {
  try {
    const existingReview = await getReviewById(id);
    if (!existingReview) {
      throw new AppError("Review does not exist");
    }

    return await prisma.reviews.delete({
      where: { reviewId: id },
    });
  } catch (error) {
    throw error;
  }
};
