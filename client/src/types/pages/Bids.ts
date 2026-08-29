export type BidOutcome = 'leading' | 'outbid' | 'won' | 'lost'

export interface BidItem {
	id: string
	image: string
	title: string
	startingPrice: number
	offerPrice: number
	currency: string
	isAuctionOpen?: boolean
	currentHighestBid?: number | null
	outcome?: BidOutcome
}

export interface BidGroup {
	shop: {
		name: string
	}
	items: BidItem[]
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
