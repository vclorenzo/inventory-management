export interface Review {
	reviewId?: string
	userId: string
	reviewerId: string
	reviewerName: string
	orderId?: string | null
	rating: number
	comment: string
}

export interface NewReview {
	reviewId?: string
	userId: string
	reviewerId?: string
	reviewerName?: string
	orderId?: string | null
	rating: number
	comment: string
}

export interface ProductReviewInput {
	productId: string
	rating: number
	comment?: string
}

export interface CreateOrderReviewRequest {
	sellerId: string
	orderId: string
	sellerRating: number
	sellerComment: string
	productReviews: ProductReviewInput[]
}

export interface CreateOrderReviewResponse {
	sellerReview: Review
	productReviews: Array<{
		productReviewId: string
		productId: string
		reviewerId: string
		orderId: string | null
		rating: number
		comment: string
	}>
}
