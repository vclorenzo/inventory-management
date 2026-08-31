'use client'

import BiddingCountdown from '@/components/BiddingCountdown'
import Header from '@/components/Header'
import { useBids } from '@/hooks/useBids'
import { CircularProgress } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'

const formatPrice = (amount: number, currency: string) =>
	`${currency}${amount.toLocaleString('en-PH')}`

function Bids() {
	const { activeBidGroups, isLoading, isError } = useBids()

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
				<div className="grid grid-cols-[minmax(0,1fr)_140px_140px_160px] items-center gap-4 border-b border-[#ebebeb] bg-[#f5f5f5] px-4 py-3 text-sm text-gray-500">
					<span>Product</span>
					<span className="text-center">Starting Price</span>
					<span className="text-center">Your Bid</span>
					<span className="text-center">Ends</span>
				</div>

				{activeBidGroups.length === 0 ? (
					<div className="px-4 py-12 text-center text-sm text-gray-500">
						You have no in-progress bids.
					</div>
				) : (
					activeBidGroups.map((group) => (
						<div
							className="flex flex-col border-b border-[#ebebeb] last:border-b-0"
							key={group.shop.userId ?? group.shop.name}
						>
							<div className="flex items-center gap-3 border-b border-[#ebebeb] px-4 py-3">
								<span className="text-sm font-medium text-gray-800">
									{group.shop.name}
								</span>
							</div>

							{group.items.map((item) => (
								<div
									key={item.id}
									className="grid grid-cols-[minmax(0,1fr)_140px_140px_160px] items-start gap-4 border-b border-[#ebebeb] px-4 py-5 last:border-b-0"
								>
									<div className="flex gap-4">
										<Link
											href={`/auctions/${item.productId}`}
											className="relative h-[80px] w-[80px] shrink-0 overflow-hidden border border-[#ebebeb] bg-white"
										>
											<Image
												src={item.image}
												alt={item.title}
												fill
												className="object-cover"
												sizes="80px"
											/>
										</Link>

										<div className="flex min-w-0 items-center">
											<Link
												href={`/auctions/${item.productId}`}
												className="line-clamp-2 text-sm text-gray-900 hover:text-orange-600"
											>
												{item.title}
											</Link>
										</div>
									</div>

									<div className="mt-8 text-center text-sm text-gray-700">
										{formatPrice(
											item.startingPrice,
											item.currency,
										)}
									</div>

									<div className="text-primary mt-8 text-center text-base font-medium">
										{formatPrice(item.offerPrice, item.currency)}
									</div>

									<div className="mt-8 text-center text-sm font-medium text-gray-900">
										{item.endedAt ? (
											<BiddingCountdown endsAt={item.endedAt} />
										) : (
											<span className="text-gray-500">—</span>
										)}
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
