import { AppError } from '#error/AppError.ts'
import * as reviewService from '#services/review.service.ts'
import { Request, Response } from 'express'

const getUserId = (req: Request): string | undefined =>
	(req.user as { id?: string })?.id

export const getReviewById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const review = await reviewService.getReviewById(id)
		if (!review) {
			return res.status(404).json({ message: 'Review not found' })
		}
		res
			.status(200)
			.json({ message: 'Review retrieved successfully', data: review })
	} catch (error) {
		if (error instanceof AppError) {
			return res.status(error.statusCode).json({ message: error.message })
		}
		res.status(500).json({ message: 'Error retrieving review' })
	}
}

export const getAllReviews = async (req: Request, res: Response) => {
	const sortOrder = req.query.sortOrder?.toString() as
		| 'asc'
		| 'desc'
		| undefined
	const page = req.pagination?.page ?? 1
	const limit = req.pagination?.limit
	const userId = req.query.userId?.toString()

	try {
		const { reviews, totalCount } = await reviewService.getAllReviews({
			sortOrder,
			page,
			limit,
			userId,
		})
		const totalPages =
			limit !== undefined ? Math.max(Math.ceil(totalCount / limit), 1) : 1
		res.status(200).json({
			message: 'Successfully retrieved reviews',
			data: reviews,
			page,
			limit,
			totalPages,
			totalCount,
		})
	} catch (error) {
		if (error instanceof AppError) {
			return res.status(error.statusCode).json({ message: error.message })
		}
		res.status(500).json({ message: 'Error retrieving reviews' })
	}
}

export const getProductReviews = async (req: Request, res: Response) => {
	try {
		const { productId } = req.params
		const sortOrder = req.query.sortOrder?.toString() as
			| 'asc'
			| 'desc'
			| undefined
		const page = req.pagination?.page ?? 1
		const limit = req.pagination?.limit
		const { reviews, totalCount } = await reviewService.getProductReviews({
			productId,
			sortOrder,
			page,
			limit,
		})
		const totalPages =
			limit !== undefined ? Math.max(Math.ceil(totalCount / limit), 1) : 1
		res.status(200).json({
			message: 'Product reviews retrieved successfully',
			data: reviews,
			page,
			limit,
			totalPages,
			totalCount,
		})
	} catch (error) {
		if (error instanceof AppError) {
			return res.status(error.statusCode).json({ message: error.message })
		}
		res.status(500).json({ message: 'Error retrieving product reviews' })
	}
}

export const createReview = async (req: Request, res: Response) => {
	try {
		const reviewerId = getUserId(req) ?? req.body.reviewerId
		if (!reviewerId) {
			return res.status(401).json({ message: 'Authentication required' })
		}

		const { userId, rating, comment, orderId } = req.body
		const review = await reviewService.createReview({
			userId,
			reviewerId,
			rating,
			comment,
			orderId,
		})
		res.status(201).json({ message: 'Review created successfully', data: review })
	} catch (error) {
		if (error instanceof AppError) {
			return res.status(error.statusCode).json({ message: error.message })
		}
		res.status(500).json({ message: 'Error creating review' })
	}
}

export const createOrderReview = async (req: Request, res: Response) => {
	try {
		const reviewerId = getUserId(req)
		if (!reviewerId) {
			return res.status(401).json({ message: 'Authentication required' })
		}

		const {
			sellerId,
			orderId,
			sellerRating,
			sellerComment,
			productReviews,
		} = req.body

		const result = await reviewService.createOrderReview({
			reviewerId,
			sellerId,
			orderId,
			sellerRating,
			sellerComment,
			productReviews,
		})

		res.status(201).json({
			message: 'Order review submitted successfully',
			data: result,
		})
	} catch (error) {
		if (error instanceof AppError) {
			return res.status(error.statusCode).json({ message: error.message })
		}
		res.status(500).json({ message: 'Error creating order review' })
	}
}

export const updateReview = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const data = req.body
		const updatedReview = await reviewService.updateReview(id, data)
		res
			.status(200)
			.json({ message: 'Review updated successfully', data: updatedReview })
	} catch (error) {
		if (error instanceof AppError) {
			return res.status(error.statusCode).json({ message: error.message })
		}
		res.status(500).json({ message: 'Error updating review' })
	}
}

export const deleteReview = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const deletedReview = await reviewService.deleteReview(id)
		res
			.status(200)
			.json({ message: 'Review deleted successfully', data: deletedReview })
	} catch (error) {
		if (error instanceof AppError) {
			return res.status(error.statusCode).json({ message: error.message })
		}
		res.status(500).json({ message: 'Error deleting review' })
	}
}
