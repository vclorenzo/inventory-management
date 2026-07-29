import {
	createOrderReview,
	createReview,
	deleteReview,
	getAllReviews,
	getProductReviews,
	getReviewById,
	updateReview,
} from '#controllers/review.controller.ts'
import { authenticateToken } from '#middleware/auth.middleware.ts'
import { validate } from '#middleware/validate.middleware.ts'
import {
	createOrderReviewSchema,
	createSellerReviewSchema,
	updateReviewSchema,
} from '#validations/review.validations.ts'
import { Router } from 'express'

const router = Router()

router.get('/products/:productId', getProductReviews)
router.get('/:id', getReviewById)
router.get('/', getAllReviews)
router.post(
	'/order',
	authenticateToken,
	validate(createOrderReviewSchema),
	createOrderReview,
)
router.post(
	'/',
	authenticateToken,
	validate(createSellerReviewSchema),
	createReview,
)
router.put('/:id', authenticateToken, validate(updateReviewSchema), updateReview)
router.delete('/:id', authenticateToken, deleteReview)

export default router
