import z from 'zod'

const ratingSchema = z
	.number()
	.int()
	.min(1, 'Rating must be at least 1')
	.max(5, 'Rating must be at most 5')

export const createSellerReviewSchema = z.object({
	userId: z.string().uuid(),
	reviewerId: z.string().uuid().optional(),
	rating: ratingSchema,
	comment: z.string().trim().min(1, 'Comment is required'),
	orderId: z.string().uuid().optional().nullable(),
})

export const updateReviewSchema = z.object({
	rating: ratingSchema,
	comment: z.string().trim().min(1, 'Comment is required'),
})

export const createOrderReviewSchema = z.object({
	sellerId: z.string().uuid(),
	orderId: z.string().uuid(),
	sellerRating: ratingSchema,
	sellerComment: z.string().trim().min(1, 'Seller comment is required'),
	productReviews: z
		.array(
			z.object({
				productId: z.string().uuid(),
				rating: ratingSchema,
				comment: z.string().trim().optional().default(''),
			}),
		)
		.min(1, 'Rate at least one product'),
})

export type CreateOrderReviewInput = z.infer<typeof createOrderReviewSchema>
