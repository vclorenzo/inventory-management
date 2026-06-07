export interface Review {
  reviewId?: string;
  userId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
}
export interface NewReview {
  reviewId: string;
  userId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
}
