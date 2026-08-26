'use client'

import { PurchaseOrderGroup } from '@/types/pages/Checkout'
import { CreateOrderReviewRequest } from '@/types/pages/Reviews'
import { Rating } from '@mui/material'
import { X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useState, type FormEvent } from 'react'

type ProductReviewDraft = {
	productId: string
	productName: string
	image: string
	rating: number
	comment: string
}

type LeaveReviewModalProps = {
	isOpen: boolean
	order: PurchaseOrderGroup | null
	isSubmitting?: boolean
	onClose: () => void
	onSubmit: (payload: CreateOrderReviewRequest) => void | Promise<void>
}

function uniqueProducts(order: PurchaseOrderGroup): ProductReviewDraft[] {
	const seen = new Map<string, ProductReviewDraft>()

	for (const item of order.items) {
		if (seen.has(item.productId)) continue
		seen.set(item.productId, {
			productId: item.productId,
			productName: item.productName,
			image: item.image,
			rating: 0,
			comment: '',
		})
	}

	return Array.from(seen.values())
}

export default function LeaveReviewModal({
	isOpen,
	order,
	isSubmitting = false,
	onClose,
	onSubmit,
}: LeaveReviewModalProps) {
	const [sellerRating, setSellerRating] = useState(0)
	const [sellerComment, setSellerComment] = useState('')
	const [productReviews, setProductReviews] = useState<ProductReviewDraft[]>(
		[],
	)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!isOpen || !order) return
		setSellerRating(0)
		setSellerComment('')
		setProductReviews(uniqueProducts(order))
		setError(null)
	}, [isOpen, order])

	const canSubmit = useMemo(() => {
		if (!order?.orderId) return false
		if (sellerRating < 1 || !sellerComment.trim()) return false
		return productReviews.every((review) => review.rating >= 1)
	}, [order?.orderId, sellerRating, sellerComment, productReviews])

	if (!isOpen || !order) return null

	const handleProductRatingChange = (
		productId: string,
		rating: number | null,
	) => {
		setProductReviews((current) =>
			current.map((review) =>
				review.productId === productId
					? { ...review, rating: rating ?? 0 }
					: review,
			),
		)
	}

	const handleProductCommentChange = (
		productId: string,
		comment: string,
	) => {
		setProductReviews((current) =>
			current.map((review) =>
				review.productId === productId
					? { ...review, comment }
					: review,
			),
		)
	}

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault()
		if (!order.orderId || !canSubmit || isSubmitting) return

		setError(null)

		try {
			await onSubmit({
				sellerId: order.seller.userId,
				orderId: order.orderId,
				sellerRating,
				sellerComment: sellerComment.trim(),
				productReviews: productReviews.map((review) => ({
					productId: review.productId,
					rating: review.rating,
					comment: review.comment.trim(),
				})),
			})
		} catch (submitError) {
			const message =
				submitError instanceof Error
					? submitError.message
					: 'Failed to submit review'
			setError(message)
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="leave-review-title"
				className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-sm border border-[#ebebeb] bg-white shadow-lg"
			>
				<header className="flex items-center justify-between border-b border-[#ebebeb] px-4 py-3">
					<h2
						id="leave-review-title"
						className="text-base font-semibold text-gray-900"
					>
						Leave a review
					</h2>
					<button
						type="button"
						onClick={onClose}
						disabled={isSubmitting}
						className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
						aria-label="Close"
					>
						<X className="h-5 w-5" />
					</button>
				</header>

				<form
					onSubmit={handleSubmit}
					className="flex min-h-0 flex-1 flex-col"
				>
					<div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
						<section className="space-y-3">
							<div>
								<h3 className="text-sm font-semibold text-gray-900">
									Seller review
								</h3>
								<p className="mt-0.5 text-xs text-gray-500">
									How was your experience with{' '}
									{order.seller.name}?
								</p>
							</div>
							<Rating
								name="seller-rating"
								value={sellerRating}
								onChange={(_, value) =>
									setSellerRating(value ?? 0)
								}
							/>
							<textarea
								value={sellerComment}
								onChange={(event) =>
									setSellerComment(event.target.value)
								}
								rows={3}
								placeholder="Share details about the seller..."
								className="w-full resize-none rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
							/>
						</section>

						<section className="space-y-4">
							<div>
								<h3 className="text-sm font-semibold text-gray-900">
									Product reviews
								</h3>
								<p className="mt-0.5 text-xs text-gray-500">
									Rate each product once (quantity does not
									matter).
								</p>
							</div>

							{productReviews.map((review) => (
								<div
									key={review.productId}
									className="space-y-2 border-t border-[#ebebeb] pt-4 first:border-t-0 first:pt-0"
								>
									<div className="flex gap-3">
										<div className="relative h-14 w-14 shrink-0 overflow-hidden border border-[#ebebeb] bg-white">
											<Image
												src={review.image}
												alt={review.productName}
												fill
												className="object-cover"
												sizes="56px"
											/>
										</div>
										<div className="min-w-0 flex-1">
											<p className="line-clamp-2 text-sm text-gray-900">
												{review.productName}
											</p>
											<div className="mt-1">
												<Rating
													name={`product-${review.productId}`}
													value={review.rating}
													onChange={(_, value) =>
														handleProductRatingChange(
															review.productId,
															value,
														)
													}
													size="small"
												/>
											</div>
										</div>
									</div>
									<textarea
										value={review.comment}
										onChange={(event) =>
											handleProductCommentChange(
												review.productId,
												event.target.value,
											)
										}
										rows={2}
										placeholder="Optional comment about this product..."
										className="w-full resize-none rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
									/>
								</div>
							))}
						</section>

						{error && (
							<p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
								{error}
							</p>
						)}
					</div>

					<footer className="flex justify-end gap-2 border-t border-[#ebebeb] bg-[#fafafa] px-4 py-3">
						<button
							type="button"
							onClick={onClose}
							disabled={isSubmitting}
							className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={!canSubmit || isSubmitting}
							className="rounded border border-orange-500 bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isSubmitting ? 'Submitting…' : 'Submit review'}
						</button>
					</footer>
				</form>
			</div>
		</div>
	)
}
