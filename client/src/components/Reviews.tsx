import { sellerReviews } from "@/constants/Reviews";
import { Rating } from "@mui/material";
import React from "react";

const Reviews = () => {
  return (
    <>
      <div className="flex flex-wrap items-center gap-5 mt-5">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">
          Seller Reviews
        </h2>
      </div>

      <div className="mt-5 space-y-7">
        {sellerReviews.map((review) => (
          <article
            key={`${review.reviewer}-${review.comment}`}
            className="space-y-2"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold uppercase text-gray-700">
                {review.avatarLabel}
              </div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{review.reviewer}</p>
                <span className="text-gray-400">•</span>
                <p className="text-sm text-gray-500">
                  {review.monthsAgo
                    ? `${review.monthsAgo} months ago`
                    : `${review.yearsAgo} years ago`}
                </p>
              </div>
            </div>

            <div className="pl-14">
              <Rating value={5} readOnly size="small" />
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
