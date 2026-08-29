export interface BidItem {
	id: string
	image: string
	title: string
	startingPrice: number
	offerPrice: number
	currency: string
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
