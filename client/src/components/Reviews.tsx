import { sellerReviews } from "@/constants/Reviews";
import { Review } from "@/types/pages/Reviews";
import { Rating } from "@mui/material";
import React from "react";

const Reviews = ({
  reviews,
  userId,
}: {
  reviews: Review[];
  userId: string;
}) => {
  return (
    <>
      <div className="flex flex-wrap items-center gap-5 mt-5">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">
          Seller Reviews
        </h2>
      </div>

      <div className="mt-5 space-y-7">
        {reviews
          ?.filter((review) => review.userId === userId)
          ?.map((review) => (
            <article
              key={`${review.reviewId}-${review.comment}`}
              className="space-y-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold uppercase text-gray-700">
                  {review.reviewerName.charAt(0)}
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">
                    {review.reviewerName}
                  </p>
                </div>
              </div>

              <div className="pl-14">
                <Rating value={review.rating} readOnly size="small" />
                <p className="mt-1 text-gray-700">{review.comment}</p>
              </div>
            </article>
          ))}
      </div>

      <button
        type="button"
        className="mt-6 inline-flex items-center text-sm font-medium text-teal-700 hover:text-teal-800"
      >
        Read all reviews
        <span className="ml-1 text-base">›</span>
      </button>
    </>
  );
};

export default Reviews;
