export const PRODUCT_STATUS = {
	Available: 'Available',
	Reserved: 'Reserved',
	SoldOut: 'SoldOut',
	Unlisted: 'Unlisted',
} as const

export type ProductStatus =
	(typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS]

export function productStatusLabel(status: string) {
	if (status === PRODUCT_STATUS.SoldOut) return 'Sold Out'
	return status
}

export function productStatusTone(status: string) {
	const normalized = status.trim().toLowerCase()
	if (normalized === 'available') {
		return 'bg-emerald-50 text-emerald-800 ring-emerald-200'
	}
	if (normalized === 'reserved') {
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

export function isMarketplaceVisibleStatus(status: string) {
	return status === PRODUCT_STATUS.Available
}
