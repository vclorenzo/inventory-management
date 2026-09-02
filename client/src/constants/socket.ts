export const SOCKET_EVENTS = {
	JOIN_AUCTION: 'joinAuction',
	LEAVE_AUCTION: 'leaveAuction',
	AUCTION_BID_UPDATE: 'auction:bidUpdate',
} as const

export interface AuctionBidUpdatePayload {
	productId: string
	bidCount: number
	currentHighestBid: number | null
	revision: number
}
