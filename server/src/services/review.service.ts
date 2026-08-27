import { AppError } from '#error/AppError.ts'
import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type SellerReviewInput = {
	userId: string
	reviewerId: string
	rating: number
	comment: string
	orderId?: string | null
}

type OrderReviewInput = {
	reviewerId: string
	sellerId: string
	orderId: string
	sellerRating: number
	sellerComment: string
	productReviews: Array<{
		productId: string
		rating: number
		comment?: string
	}>
}

type ReviewUpdatePayload = {
	rating: number
	comment: string
}

const assertValidRating = (rating: number) => {
	if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
		throw new AppError('Rating must be an integer from 1 to 5', 400)
	}
}

/** Average = sum of star ratings / total ratings received. */
export const averageRating = (ratings: number[]): number | null => {
	if (ratings.length === 0) return null
	const sum = ratings.reduce((total, value) => total + value, 0)
	return sum / ratings.length
}

export const recalculateProductRating = async (
	productId: string,
	client: Prisma.TransactionClient | PrismaClient = prisma,
) => {
	const reviews = await client.productReviews.findMany({
		where: { productId },
		select: { rating: true },
	})

	const rating = averageRating(reviews.map((review) => review.rating))

	return client.products.update({
		where: { productId },
		data: { rating },
	})
}

export const getAllReviews = async ({
	sortOrder = 'desc',
	page = 1,
	limit,
	userId,
}: {
	sortOrder?: 'asc' | 'desc'
	page?: number
	limit?: number
	userId?: string
}) => {
	try {
		const where = userId ? { userId } : undefined
		const skip =
			limit !== undefined ? Math.max(page - 1, 0) * limit : undefined

		const [totalCount, reviews] = await prisma.$transaction([
			prisma.reviews.count({ where }),
			prisma.reviews.findMany({
				where,
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
				orderBy: { created_at: sortOrder },
				...(skip !== undefined ? { skip } : {}),
				...(limit !== undefined ? { take: limit } : {}),
			}),
		])

		return {
			reviews: reviews.map((review) => ({
				reviewId: review.reviewId,
				userId: review.userId,
				reviewerId: review.reviewerId,
				orderId: review.orderId,
				rating: review.rating,
				comment: review.comment,
				userName: review.reviewedUser.name,
				reviewerName: review.reviewer.name,
			})),
			totalCount,
		}
	} catch (error) {
		throw error
	}
}

export const getReviewById = async (reviewId: string) => {
	try {
		return await prisma.reviews.findFirst({
			where: { reviewId },
		})
	} catch (error) {
		throw error
	}
}

export const createReview = async (data: SellerReviewInput) => {
	try {
		assertValidRating(data.rating)

		return await prisma.reviews.create({
			data: {
				userId: data.userId,
				reviewerId: data.reviewerId,
				orderId: data.orderId ?? null,
				rating: data.rating,
				comment: data.comment,
			},
		})
	} catch (error) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === 'P2002'
		) {
			throw new AppError(
				'You have already reviewed this seller for this order',
				409,
			)
		}
		throw error
	}
}

export const updateReview = async (
	reviewId: string,
	data: ReviewUpdatePayload,
) => {
	try {
		assertValidRating(data.rating)

		const existingReview = await getReviewById(reviewId)
		if (!existingReview) {
			throw new AppError('Review does not exist', 404)
		}

		return await prisma.reviews.update({
			where: { reviewId },
			data: {
				rating: data.rating,
				comment: data.comment,
			},
		})
	} catch (error) {
		throw error
	}
}

export const deleteReview = async (id: string) => {
	try {
		const existingReview = await getReviewById(id)
		if (!existingReview) {
			throw new AppError('Review does not exist', 404)
		}

		return await prisma.reviews.delete({
			where: { reviewId: id },
		})
	} catch (error) {
		throw error
	}
}

export const getProductReviews = async ({
	productId,
	sortOrder = 'desc',
	page = 1,
	limit,
}: {
	productId: string
	sortOrder?: 'asc' | 'desc'
	page?: number
	limit?: number
}) => {
	const where = { productId }
	const skip =
		limit !== undefined ? Math.max(page - 1, 0) * limit : undefined

	const [totalCount, reviews] = await prisma.$transaction([
		prisma.productReviews.count({ where }),
		prisma.productReviews.findMany({
			where,
			include: {
				reviewer: {
					select: {
						name: true,
					},
				},
			},
			orderBy: { created_at: sortOrder },
			...(skip !== undefined ? { skip } : {}),
			...(limit !== undefined ? { take: limit } : {}),
		}),
	])

	return {
		reviews: reviews.map((review) => ({
			reviewId: review.productReviewId,
			productId: review.productId,
			reviewerId: review.reviewerId,
			reviewerName: review.reviewer.name,
			orderId: review.orderId,
			rating: review.rating,
			comment: review.comment,
			createdAt: review.created_at.toISOString(),
		})),
		totalCount,
	}
}

export const createOrderReview = async (data: OrderReviewInput) => {
	assertValidRating(data.sellerRating)

	if (data.productReviews.length === 0) {
		throw new AppError('At least one product review is required', 400)
	}

	for (const productReview of data.productReviews) {
		assertValidRating(productReview.rating)
	}

	const purchases = await prisma.purchases.findMany({
		where: {
			userId: data.reviewerId,
			orderId: data.orderId,
		},
		include: {
			product: {
				select: {
					productId: true,
					userId: true,
				},
			},
		},
	})

	if (purchases.length === 0) {
		throw new AppError('Order not found', 404)
	}

	const purchasedProductIds = new Set(
		purchases.map((purchase) => purchase.productId),
	)

	const sellerOwnsAll = purchases.every(
		(purchase) => purchase.product.userId === data.sellerId,
	)
	if (!sellerOwnsAll) {
		throw new AppError('Seller does not match this order', 400)
	}

	// One rating per product line even when quantity > 1
	const uniqueProductReviews = new Map<
		string,
		{ productId: string; rating: number; comment: string }
	>()

	for (const productReview of data.productReviews) {
		if (!purchasedProductIds.has(productReview.productId)) {
			throw new AppError(
				`Product ${productReview.productId} was not part of this order`,
				400,
			)
		}
		uniqueProductReviews.set(productReview.productId, {
			productId: productReview.productId,
			rating: productReview.rating,
			comment: productReview.comment?.trim() ?? '',
		})
	}

	const missingProducts = [...purchasedProductIds].filter(
		(productId) => !uniqueProductReviews.has(productId),
	)
	if (missingProducts.length > 0) {
		throw new AppError(
			'Please rate every product in this order',
			400,
		)
	}

	const existingSellerReview = await prisma.reviews.findFirst({
		where: {
			userId: data.sellerId,
			reviewerId: data.reviewerId,
			orderId: data.orderId,
		},
	})
	if (existingSellerReview) {
		throw new AppError('You have already reviewed this order', 409)
	}

	try {
		return await prisma.$transaction(async (tx) => {
			const sellerReview = await tx.reviews.create({
				data: {
					userId: data.sellerId,
					reviewerId: data.reviewerId,
					orderId: data.orderId,
					rating: data.sellerRating,
					comment: data.sellerComment.trim(),
				},
			})

			const productReviews = []
			for (const productReview of uniqueProductReviews.values()) {
				const created = await tx.productReviews.create({
					data: {
						productId: productReview.productId,
						reviewerId: data.reviewerId,
						orderId: data.orderId,
						rating: productReview.rating,
						comment: productReview.comment,
					},
				})
				productReviews.push(created)
				await recalculateProductRating(productReview.productId, tx)
			}

			return {
				sellerReview,
				productReviews,
			}
		})
	} catch (error) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === 'P2002'
		) {
			throw new AppError('You have already reviewed this order', 409)
		}
		throw error
	}
}

export const hasReviewedOrder = async (
	reviewerId: string,
	sellerId: string,
	orderId: string,
) => {
	const existing = await prisma.reviews.findFirst({
		where: {
			userId: sellerId,
			reviewerId,
			orderId,
		},
		select: { reviewId: true },
	})
	return Boolean(existing)
}
