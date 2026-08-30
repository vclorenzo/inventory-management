export const AUCTION_STATUS = {
	Available: 'Available',
	Unsold: 'Unsold',
	SoldOut: 'SoldOut',
	Unlisted: 'Unlisted',
} as const

export type AuctionStatus =
	(typeof AUCTION_STATUS)[keyof typeof AUCTION_STATUS]

export function auctionStatusLabel(status: string) {
	if (status === AUCTION_STATUS.SoldOut) return 'Sold Out'
	return status
}

export function auctionStatusTone(status: string) {
	const normalized = status.trim().toLowerCase()
	if (normalized === 'available') {
		return 'bg-emerald-50 text-emerald-800 ring-emerald-200'
	}
	if (normalized === 'unsold') {
		return 'bg-amber-50 text-amber-800 ring-amber-200'
	}
	if (normalized === 'soldout' || normalized === 'sold out') {
		return 'bg-rose-50 text-rose-800 ring-rose-200'
	}
	if (normalized === 'unlisted') {
		return 'bg-slate-50 text-slate-700 ring-slate-200'
	}
	return 'bg-gray-50 text-gray-800 ring-gray-200'
}

export function isAuctionScreenVisibleStatus(status: string) {
	return status === AUCTION_STATUS.Available
}
