'use client'

import { useBids } from '@/hooks/useBids'
import { BidItem, CompletedBidEntry } from '@/types/pages/Bids'
import { formatEndedAt } from '@/utils/dateFormatter'
import { CircularProgress } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'

const formatPrice = (amount: number, currency: string) =>
	`${currency}${amount.toLocaleString('en-PH')}`

const completedOutcomeLabel: Record<
	Extract<NonNullable<BidItem['outcome']>, 'won' | 'lost'>,
	{ text: string; className: string }
> = {
	won: {
		text: 'Won',
		className: 'text-lg font-medium text-emerald-800',
	},
	lost: {
		text: 'Did not win',
		className: 'text-lg font-medium text-gray-600',
	},
}

function BidHistoryCard({ shop, item }: CompletedBidEntry) {
	const outcome =
		item.outcome === 'won' || item.outcome === 'lost'
			? completedOutcomeLabel[item.outcome]
			: null
	const sellerHref = shop.userId ? `/account/${shop.userId}` : null
	const auctionHref = `/auctions/${item.productId}`

	return (
		<article className="overflow-hidden rounded-sm border border-[#ebebeb] bg-white shadow-sm">
			<header className="flex flex-col gap-3 border-b border-[#ebebeb] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-wrap items-center gap-2">
					{sellerHref ? (
						<Link
							href={sellerHref}
							className="text-sm font-medium text-gray-900"
						>
							{shop.name}
						</Link>
					) : (
						<span className="text-sm font-medium text-gray-900">
							{shop.name}
						</span>
					)}
				</div>
			</header>

			<div className="flex gap-4 px-4 py-4">
				<Link
					href={auctionHref}
					className="relative h-20 w-20 shrink-0 overflow-hidden border border-[#ebebeb] bg-white"
				>
					<Image
						src={item.image}
						alt={item.title}
						fill
						className="object-cover"
						sizes="80px"
					/>
				</Link>

				<div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:justify-between">
					<div className="min-w-0">
						<Link
							href={auctionHref}
							className="line-clamp-2 text-sm text-gray-900 hover:text-orange-600"
						>
							{item.title}
						</Link>
						<p className="mt-1 text-xs text-gray-500">
							{item.endedAt ? `Ended ${formatEndedAt(item.endedAt)}` : 'Ended'}
						</p>
					</div>

					<div className="shrink-0 text-sm text-gray-800 sm:text-right">
						Your bid: {formatPrice(item.offerPrice, item.currency)}
						{outcome ? (
							<p className={outcome.className}>{outcome.text}</p>
						) : null}
					</div>
				</div>
			</div>

			{/* <footer className="flex flex-col gap-3 border-t border-[#ebebeb] bg-[#fafafa] px-4 py-3 sm:flex-row sm:items-center sm:justify-end">
				<div className="flex flex-wrap justify-end gap-2">
					{outcome ? (
						<span
							className={`rounded border px-4 py-2 text-sm font-medium ${outcome.className}`}
						>
							{outcome.text}
						</span>
					) : (
						<span className="rounded border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500">
							Completed
						</span>
					)}
				</div>
			</footer> */}
		</article>
	)
}

export default function BidsHistory() {
	const { completedBids, isLoading, isError } = useBids()

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
				We couldn&apos;t load your bid history. Please try again.
			</div>
		)
	}

	if (completedBids.length === 0) {
		return (
			<div className="rounded-sm border border-[#ebebeb] bg-white px-4 py-12 text-center text-sm text-gray-500">
				You have no completed bids yet.
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-4">
			{completedBids.map(({ shop, item }) => (
				<BidHistoryCard key={item.id} shop={shop} item={item} />
			))}
		</div>
	)
}
