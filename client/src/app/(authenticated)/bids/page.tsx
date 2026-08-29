'use client'

import Header from '@/components/Header'
import { useBids } from '@/hooks/useBids'
import { BidItem } from '@/types/pages/Bids'
import { CircularProgress } from '@mui/material'
import Image from 'next/image'

const formatPrice = (amount: number, currency: string) =>
	`${currency}${amount.toLocaleString('en-PH')}`

const outcomeLabel: Record<
	NonNullable<BidItem['outcome']>,
	{ text: string; className: string }
> = {
	leading: {
		text: 'Highest bid',
		className: 'text-emerald-700',
	},
	outbid: {
		text: 'Outbid',
		className: 'text-amber-700',
	},
	won: {
		text: 'Won',
		className: 'text-emerald-700',
	},
	lost: {
		text: 'Did not win',
		className: 'text-slate-600',
	},
}

const Bids = () => {
	const {
		bidGroups,
		isLoading,
		isError,
		removeBid,
		removeBidState,
	} = useBids()

	const isRemoving = removeBidState.isLoading

	const handleRemoveBid = async (id: string) => {
		await removeBid(id)
	}

	if (isLoading) {
		return (
			<div className="flex flex-col gap-4">
				<Header name="Bids" />
				<div className="flex min-h-[240px] items-center justify-center rounded-sm border border-[#ebebeb] bg-white">
					<CircularProgress />
				</div>
			</div>
		)
	}

	if (isError) {
		return (
			<div className="flex flex-col gap-4">
				<Header name="Bids" />
				<div className="rounded-sm border border-red-200 bg-red-50 p-6 text-sm text-red-800">
					We couldn&apos;t load your bids. Please try again.
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-4">
			<Header name="Bids" />

			<div className="rounded-sm border border-[#ebebeb] bg-white shadow-sm">
				<div className="grid grid-cols-[minmax(0,1fr)_140px_140px_120px_100px] items-center gap-4 border-b border-[#ebebeb] bg-[#f5f5f5] px-4 py-3 text-sm text-gray-500">
					<span>Product</span>
					<span className="text-center">Starting Price</span>
					<span className="text-center">Your Bid</span>
					<span className="text-center">Status</span>
					<span className="text-center">Actions</span>
				</div>

				{bidGroups.length === 0 ? (
					<div className="px-4 py-12 text-center text-sm text-gray-500">
						You have no bids yet.
					</div>
				) : (
					bidGroups.map((group) => (
						<div
							className="flex flex-col border-b border-[#ebebeb] last:border-b-0"
							key={group.shop.name}
						>
							<div className="flex items-center gap-3 border-b border-[#ebebeb] px-4 py-3">
								<span className="text-sm font-medium text-gray-800">
									{group.shop.name}
								</span>
							</div>

							{group.items.map((item) => (
								<div
									key={item.id}
									className="grid grid-cols-[minmax(0,1fr)_140px_140px_120px_100px] items-start gap-4 border-b border-[#ebebeb] px-4 py-5 last:border-b-0"
								>
									<div className="flex gap-4">
										<div className="relative h-[80px] w-[80px] shrink-0 overflow-hidden border border-[#ebebeb] bg-white">
											<Image
												src={item.image}
												alt={item.title}
												fill
												className="object-cover"
												sizes="80px"
											/>
										</div>

										<div className="flex min-w-0 items-center">
											<p className="line-clamp-2 text-sm text-gray-900">
												{item.title}
											</p>
										</div>
									</div>

									<div className="mt-8 text-center text-sm text-gray-700">
										{formatPrice(item.startingPrice, item.currency)}
									</div>

									<div className="text-primary mt-8 text-center text-base font-medium">
										{formatPrice(item.offerPrice, item.currency)}
									</div>

									<div className="mt-8 text-center text-sm">
										{item.outcome ? (
											<span
												className={`font-medium ${outcomeLabel[item.outcome].className}`}
											>
												{outcomeLabel[item.outcome].text}
											</span>
										) : (
											<span className="text-gray-500">—</span>
										)}
									</div>

									<div className="mt-8 flex flex-col items-center gap-2 text-sm">
										<button
											type="button"
											onClick={() => handleRemoveBid(item.id)}
											disabled={
												isRemoving ||
												item.isAuctionOpen === false
											}
											className="hover:text-primary text-gray-600 transition-colors disabled:opacity-50"
										>
											Delete
										</button>
									</div>
								</div>
							))}
						</div>
					))
				)}
			</div>
		</div>
	)
}

export default Bids
