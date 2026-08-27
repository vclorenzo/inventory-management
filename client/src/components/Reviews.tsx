'use client'

import { useProductReviews, useReviews } from '@/hooks/useReviews'
import { CircularProgress, Rating } from '@mui/material'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

const SELLER_PAGE_SIZE = 3
const PRODUCT_PAGE_SIZE = 5

type ReviewsProps = {
	userId?: string
	productId?: string
	title?: string
}

function Reviews({ userId, productId, title }: ReviewsProps) {
	const [isShowingAll, setIsShowingAll] = useState(false)
	const [page, setPage] = useState(1)
	const isProduct = Boolean(productId)
	const heading =
		title ?? (isProduct ? 'Product Reviews' : 'Seller Reviews')
	const entityId = isProduct ? productId ?? '' : userId ?? ''
	const pageSize = isProduct ? PRODUCT_PAGE_SIZE : SELLER_PAGE_SIZE

	const sellerQuery = useReviews(
		userId && !isProduct
			? {
					userId,
					page: isShowingAll ? page : 1,
					limit: pageSize,
				}
			: undefined,
	)
	const productQuery = useProductReviews(
		productId
			? {
					productId,
					page: isShowingAll ? page : 1,
					limit: pageSize,
				}
			: undefined,
	)
	const {
		reviews,
		totalCount,
		totalPages,
		isLoading,
		isFetching,
		isError,
	} = isProduct ? productQuery : sellerQuery

	useEffect(() => {
		setPage(1)
		setIsShowingAll(false)
	}, [entityId])

	useEffect(() => {
		if (page > totalPages) setPage(totalPages)
	}, [page, totalPages])

	const hasMore = totalCount > pageSize
	const rangeStart =
		totalCount === 0 ? 0 : (page - 1) * pageSize + 1
	const rangeEnd = Math.min(page * pageSize, totalCount)

	function handleReadAll() {
		setIsShowingAll(true)
		setPage(1)
	}

	function handleShowLess() {
		setIsShowingAll(false)
		setPage(1)
	}

	if (!entityId) {
		return (
			<div className="flex h-full min-h-0 flex-1 flex-col">
				<h2 className="text-2xl font-semibold tracking-tight text-gray-900">
					{heading}
				</h2>
				<p className="mt-5 text-gray-500">Unable to load reviews.</p>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div className="flex h-full min-h-0 flex-1 flex-col">
				<h2 className="text-2xl font-semibold tracking-tight text-gray-900">
					{heading}
				</h2>
				<div className="mt-5 flex flex-1 items-center justify-center py-6">
					<CircularProgress size={28} />
				</div>
			</div>
		)
	}

	const footer = !isError && hasMore && (
		<div className="mt-auto pt-6">
			{isShowingAll ? (
				<div className="flex flex-wrap items-center justify-between gap-3">
					<button
						type="button"
						className="inline-flex items-center text-sm font-medium text-teal-700 hover:text-teal-800"
						onClick={handleShowLess}
					>
						Show less
					</button>
					<div
						className="flex items-center gap-3"
						role="navigation"
						aria-label={`${heading} pagination`}
					>
						<p className="text-sm tabular-nums text-gray-700">
							{rangeStart}–{rangeEnd} of {totalCount}
						</p>
						<button
							type="button"
							className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:pointer-events-none disabled:opacity-30"
							disabled={page <= 1 || isFetching}
							aria-label="Previous page"
							onClick={() =>
								setPage((current) => Math.max(1, current - 1))
							}
						>
							<ChevronLeft className="h-5 w-5" aria-hidden />
						</button>
						<button
							type="button"
							className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:pointer-events-none disabled:opacity-30"
							disabled={page >= totalPages || isFetching}
							aria-label="Next page"
							onClick={() =>
								setPage((current) =>
									Math.min(totalPages, current + 1),
								)
							}
						>
							<ChevronRight className="h-5 w-5" aria-hidden />
						</button>
					</div>
				</div>
			) : (
				<button
					type="button"
					className="inline-flex items-center text-sm font-medium text-teal-700 hover:text-teal-800"
					onClick={handleReadAll}
				>
					Read all reviews
					<span className="ml-1 text-base">›</span>
				</button>
			)}
		</div>
	)

	return (
		<div className="flex h-full min-h-0 flex-1 flex-col">
			<h2 className="text-2xl font-semibold tracking-tight text-gray-900">
				{heading}
			</h2>

			{isError ? (
				<p className="mt-5 text-center text-red-500">
					Failed to fetch reviews
				</p>
			) : reviews.length === 0 ? (
				<p className="mt-5 text-gray-500">No reviews yet.</p>
			) : (
				<div
					className={`mt-5 flex-1 space-y-7 ${
						isFetching ? 'opacity-60' : ''
					}`}
				>
					{reviews.map((review) => (
						<article
							key={
								review.reviewId ??
								`${review.reviewerId}-${review.comment}`
							}
							className="space-y-2"
						>
							<div className="flex items-center gap-3">
								<div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold uppercase text-gray-700">
									{(review.reviewerName ?? '?').charAt(0)}
								</div>
								<div className="flex items-center gap-2">
									<p className="font-semibold text-gray-900">
										{review.reviewerName || 'Anonymous'}
									</p>
								</div>
							</div>

							<div className="pl-14">
								<Rating
									value={review.rating}
									readOnly
									size="small"
								/>
								<p className="mt-1 text-gray-700">
									{review.comment}
								</p>
							</div>
						</article>
					))}
				</div>
			)}

			{footer}
		</div>
	)
}

export default Reviews
