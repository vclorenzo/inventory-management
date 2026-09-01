import { Auction } from '@/types/pages/Auctions'
import { Product } from '@/types/pages/Products'
import { formatClosingDay } from '@/utils/dateFormatter'
import { formatPeso } from '@/utils/priceFormatter'
import { Rating } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'

type CatalogItem = Product | Auction

function isAuction(item: CatalogItem): item is Auction {
	return 'biddingEndsAt' in item && 'bidCount' in item
}

function Cards({
	products,
	hrefBase = 'products',
}: {
	products: CatalogItem[]
	hrefBase?: 'marketplace' | 'auctions' | 'products'
}) {
	return products?.map((product) => {
		const auctionItem = isAuction(product)
		const isOpen = auctionItem
			? (product.isOpen ??
				new Date(product.biddingEndsAt).getTime() > Date.now())
			: false
		const currentHighestBid = auctionItem
			? (product.currentHighestBid ?? null)
			: null

		return (
			<div
				key={product.productId}
				className="mx-auto w-full max-w-full rounded-md border p-4 shadow"
			>
				<Link
					href={`/${hrefBase}/${product.productId}`}
					className="flex flex-col items-center"
				>
					<Image
						src={`https://s3-inventory-management-img-bucket.s3.ap-southeast-2.amazonaws.com/product${
							Math.floor(Math.random() * 3) + 1
						}.png`}
						alt={product.name}
						width={150}
						height={150}
						className="mb-3 h-36 w-36 rounded-2xl"
					/>

					<h3 className="text-lg font-semibold text-gray-900">
						{product.name}
					</h3>
					<p className="text-gray-800">
						{auctionItem ? (
							<>
								Current Price:{' '}
								{formatPeso(
									isOpen
										? (currentHighestBid ?? product.price)
										: (product.winningBid?.offerPrice ??
												currentHighestBid ??
												product.price),
								)}
							</>
						) : (
							formatPeso(product.price)
						)}
					</p>
					{auctionItem ? (
						<div className="mt-1 space-y-0.5 text-center text-sm text-gray-600">
							<div>
								{product.bidCount}{' '}
								{product.bidCount === 1 ? 'bid' : 'bids'}
								{' · '}
								{isOpen
									? `Ends ${formatClosingDay(product.biddingEndsAt)}`
									: 'Auction ended'}
							</div>
						</div>
					) : (
						<>
							<div className="mt-1 text-sm text-gray-600">
								Stock: {product.stockQuantity}
							</div>
							{product.rating ? (
								<div className="mt-2 flex items-center">
									<Rating
										value={product.rating || 0}
										precision={0.5}
										readOnly
									/>
								</div>
							) : null}
						</>
					)}
				</Link>
			</div>
		)
	})
}

export default Cards
