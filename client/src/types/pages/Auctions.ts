import { AuctionStatus } from '@/constants/auctionStatus'
import { Product, ProductFormValues } from '@/types/pages/Products'

export interface AuctionWinningBid {
	bidId: string
	offerPrice: number
	bidderName: string
}

export interface AuctionViewerBid {
	bidId: string
	offerPrice: number
	isLeading: boolean
	isWinner: boolean
}

export interface Auction extends Omit<Product, 'status' | 'rating' | 'stockQuantity'> {
	status: AuctionStatus
	biddingEndsAt: string
	bidCount: number
	winningBidId?: string | null
	settledAt?: string | null
	currentHighestBid?: number | null
	isOpen?: boolean
	winningBid?: AuctionWinningBid | null
	viewerBid?: AuctionViewerBid | null
}

export type AuctionFormValues = Omit<
	ProductFormValues,
	'stockQuantity' | 'status'
> & {
	status: AuctionStatus
	biddingEndsAt: string
}

export type NewAuction = AuctionFormValues

export type UpdateAuction = AuctionFormValues & {
	productId: string
}
