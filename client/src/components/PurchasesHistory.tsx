'use client'

import LeaveReviewModal from '@/components/LeaveReviewModal'
import { useCreateOrderReviewMutation } from '@/state/internal/reviewsApi'
import { PurchaseOrderGroup } from '@/types/pages/Checkout'
import { CreateOrderReviewRequest } from '@/types/pages/Reviews'
import { formatPurchasePrice, groupPurchasesByOrder } from '@/utils/purchases'
import { CircularProgress } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useGetPurchasesQuery } from '@/state/internal/purchasesApi'

function PurchaseOrderCard({
	order,
	onLeaveReview,
}: {
	order: PurchaseOrderGroup
	onLeaveReview: (order: PurchaseOrderGroup) => void
}) {
	const canReview = Boolean(order.orderId) && !order.isReviewed

	return (
		<article className="overflow-hidden rounded-sm border border-[#ebebeb] bg-white shadow-sm">
			<header className="flex flex-col gap-3 border-b border-[#ebebeb] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-wrap items-center gap-2">
					<Link
						href={`/account/${order.seller.userId}`}
						className="text-sm font-medium text-gray-900"
					>
						{order.seller.name}
					</Link>
				</div>
			</header>

			<div className="flex flex-col">
				{order.items.map((item) => (
					<div
						key={item.purchaseId}
						className="flex gap-4 border-b border-dashed border-[#ebebeb] px-4 py-4 last:border-b-0"
					>
						<Link
							href={`/marketplace/${item.productId}`}
							className="relative h-20 w-20 shrink-0 overflow-hidden border border-[#ebebeb] bg-white"
						>
							<Image
								src={item.image}
								alt={item.productName}
								fill
								className="object-cover"
								sizes="80px"
							/>
						</Link>

						<div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:justify-between">
							<div className="min-w-0">
								<Link
									href={`/marketplace/${item.productId}`}
									className="line-clamp-2 text-sm text-gray-900 hover:text-orange-600"
								>
									{item.productName}
								</Link>
								<p className="mt-1 text-xs text-gray-500">
									Variation: {item.condition}
									{item.brand ? ` · ${item.brand}` : ''}
								</p>
								<p className="mt-1 text-xs text-gray-500">
									x{item.quantity}
								</p>
							</div>

							<div className="shrink-0 text-sm text-gray-800 sm:text-right">
								{formatPurchasePrice(item.unitCost)}
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="flex justify-end border-t border-dashed border-[#ebebeb] px-4 py-3">
				<p className="text-sm text-gray-700">
					Order Total:{' '}
					<span className="ml-1 text-lg font-semibold text-orange-600">
						{formatPurchasePrice(order.orderTotal)}
					</span>
				</p>
			</div>

			<footer className="flex flex-col gap-3 border-t border-[#ebebeb] bg-[#fafafa] px-4 py-3 sm:flex-row sm:items-center sm:justify-end">
				<div className="flex flex-wrap justify-end gap-2">
					{order.isReviewed ? (
						<span className="rounded border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500">
							Reviewed
						</span>
					) : (
						<button
							type="button"
							disabled={!canReview}
							onClick={() => onLeaveReview(order)}
							className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Leave a review
						</button>
					)}
				</div>
			</footer>
		</article>
	)
}

export default function PurchasesHistory() {
	const { data: purchases = [], isLoading, isError } = useGetPurchasesQuery()
	const [createOrderReview, { isLoading: isSubmitting }] =
		useCreateOrderReviewMutation()
	const [selectedOrder, setSelectedOrder] =
		useState<PurchaseOrderGroup | null>(null)

	const orders = useMemo(() => groupPurchasesByOrder(purchases), [purchases])

	const handleSubmitReview = async (payload: CreateOrderReviewRequest) => {
		try {
			await createOrderReview(payload).unwrap()
			setSelectedOrder(null)
		} catch (error) {
			const apiError = error as {
				data?: { message?: string }
				message?: string
			}
			throw new Error(
				apiError?.data?.message ??
					apiError?.message ??
					'Failed to submit review',
			)
		}
	}

	if (isLoading) {
		return (
			<div className="flex min-h-[240px] items-center justify-center rounded-sm border border-[#ebebeb] bg-white">
				<CircularProgress />
			</div>
		)
	}

	if (isError) {
		return (
			<div className="rounded-sm border border-red-200 bg-red-50 p-6 text-sm text-red-800">
				We couldn&apos;t load your purchases. Please try again.
			</div>
		)
	}

	if (orders.length === 0) {
		return (
			<div className="rounded-sm border border-[#ebebeb] bg-white px-4 py-12 text-center text-sm text-gray-500">
				You haven&apos;t made any purchases yet.
			</div>
		)
	}

	return (
		<>
			<div className="flex flex-col gap-4">
				{orders.map((order) => (
					<PurchaseOrderCard
						key={order.key}
						order={order}
						onLeaveReview={setSelectedOrder}
					/>
				))}
			</div>

			<LeaveReviewModal
				isOpen={Boolean(selectedOrder)}
				order={selectedOrder}
				isSubmitting={isSubmitting}
				onClose={() => setSelectedOrder(null)}
				onSubmit={handleSubmitReview}
			/>
		</>
	)
}
