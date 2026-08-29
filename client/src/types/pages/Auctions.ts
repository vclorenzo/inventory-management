import { Product, ProductFormValues } from '@/types/pages/Products'

export interface Auction extends Product {
	biddingEndsAt: string
	bidCount: number
}

export type AuctionFormValues = ProductFormValues & {
	biddingEndsAt: string
}

export type NewAuction = AuctionFormValues

export type UpdateAuction = AuctionFormValues & {
	productId: string
}
