'use client'

import { useGetPurchasesQuery } from '@/state/internal/purchasesApi'
import { PurchaseOrderGroup } from '@/types/pages/Checkout'
import {
	formatPurchasePrice,
	groupPurchasesByOrder,
} from '@/utils/purchases'
import { CircularProgress } from '@mui/material'
import { MessageCircle, Store, Truck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo } from 'react'

function PurchaseOrderCard({ order }: { order: PurchaseOrderGroup }) {
	const orderedAt = new Date(order.timestamp).toLocaleDateString(
		'en-PH',
		{
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		},
	)

	return (
		<article className="overflow-hidden rounded-sm border border-[#ebebeb] bg-white shadow-sm">
			<header className="flex flex-col gap-3 border-b border-[#ebebeb] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-wrap items-center gap-2">
					<span className="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-700">
						Shop
					</span>
					<span className="text-sm font-medium text-gray-900">
						{order.seller.name}
					</span>
					<button
						type="button"
						className="inline-flex items-center gap-1 rounded border border-orange-500 bg-orange-500 px-2 py-0.5 text-xs font-medium text-white transition-colors hover:bg-orange-600"
					>
						<MessageCircle className="h-3 w-3" />
						Chat
					</button>
					<button
						type="button"
						className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
					>
						<Store className="h-3 w-3" />
						View Shop
					</button>
				</div>

				<div className="flex flex-wrap items-center gap-2 text-sm">
					<span className="inline-flex items-center gap-1.5 text-emerald-600">
						<Truck className="h-4 w-4" />
						<span>Order placed on {orderedAt}</span>
					</span>
					<span className="hidden text-gray-300 sm:inline">|</span>
					<span className="font-semibold uppercase tracking-wide text-orange-600">
						Completed
					</span>
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

			<footer className="flex flex-col gap-3 border-t border-[#ebebeb] bg-[#fafafa] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-xs text-gray-500">
					Your order has been completed. You can buy again anytime.
				</p>
				<div className="flex flex-wrap justify-end gap-2">
					{order.items[0] && (
						<Link
							href={`/marketplace/${order.items[0].productId}`}
							className="rounded border border-orange-500 bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
						>
							Buy Again
						</Link>
					)}
					<button
						type="button"
						className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					>
						Contact Seller
					</button>
				</div>
			</footer>
		</article>
	)
}

export default function PurchasesHistory() {
	const {
		data: purchases = [],
		isLoading,
		isError,
	} = useGetPurchasesQuery()

	const orders = useMemo(
		() => groupPurchasesByOrder(purchases),
		[purchases],
	)

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
		<div className="flex flex-col gap-4">
			{orders.map((order) => (
				<PurchaseOrderCard key={order.key} order={order} />
			))}
		</div>
	)
}
