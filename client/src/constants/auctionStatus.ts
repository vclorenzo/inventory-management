export const AUCTION_STATUS = {
	Available: 'Available',
	Unsold: 'Unsold',
	SoldOut: 'SoldOut',
	Unlisted: 'Unlisted',
} as const

export type AuctionStatus =
	(typeof AUCTION_STATUS)[keyof typeof AUCTION_STATUS]

const AUCTION_STATUS_VALUES: ReadonlySet<string> = new Set(
	Object.values(AUCTION_STATUS),
)

export function isAuctionStatus(value: unknown): value is AuctionStatus {
	return typeof value === 'string' && AUCTION_STATUS_VALUES.has(value)
}

export function auctionStatusLabel(status: AuctionStatus) {
	if (status === AUCTION_STATUS.SoldOut) return 'Sold Out'
	return status
}

export function auctionStatusTone(status: AuctionStatus) {
	switch (status) {
		case AUCTION_STATUS.Available:
			return 'bg-emerald-50 text-emerald-800 ring-emerald-200'
		case AUCTION_STATUS.Unsold:
			return 'bg-amber-50 text-amber-800 ring-amber-200'
		case AUCTION_STATUS.SoldOut:
			return 'bg-rose-50 text-rose-800 ring-rose-200'
		case AUCTION_STATUS.Unlisted:
			return 'bg-slate-50 text-slate-700 ring-slate-200'
		default: {
			const _exhaustive: never = status
			return _exhaustive
		}
	}
}

export function isAuctionScreenVisibleStatus(status: AuctionStatus) {
	return status === AUCTION_STATUS.Available
}
