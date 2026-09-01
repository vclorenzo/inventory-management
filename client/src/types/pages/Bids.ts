export type BidOutcome = 'leading' | 'outbid' | 'won' | 'lost'

export interface BidItem {
	id: string
	productId: string
	image: string
	title: string
	startingPrice: number
	offerPrice: number
	currency: string
	isAuctionOpen: boolean
	currentHighestBid?: number | null
	endedAt?: string
	outcome?: BidOutcome
}

export interface BidGroup {
	shop: {
		userId?: string
		name: string
	}
	items: BidItem[]
}

export interface CompletedBidEntry {
	shop: BidGroup['shop']
	item: BidItem
}

export interface AddBidRequest {
	productId: string
	offerPrice: number
	currency?: string
}

export interface UpdateBidRequest {
	id: string
	offerPrice: number
}
