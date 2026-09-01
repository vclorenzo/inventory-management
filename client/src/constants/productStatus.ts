export const PRODUCT_STATUS = {
	Available: 'Available',
	Reserved: 'Reserved',
	SoldOut: 'SoldOut',
	Unlisted: 'Unlisted',
} as const

export type ProductStatus =
	(typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS]

const PRODUCT_STATUS_VALUES: ReadonlySet<string> = new Set(
	Object.values(PRODUCT_STATUS),
)

export function isProductStatus(value: unknown): value is ProductStatus {
	return typeof value === 'string' && PRODUCT_STATUS_VALUES.has(value)
}

export function productStatusLabel(status: ProductStatus) {
	if (status === PRODUCT_STATUS.SoldOut) return 'Sold Out'
	return status
}

export function productStatusTone(status: ProductStatus) {
	switch (status) {
		case PRODUCT_STATUS.Available:
			return 'bg-emerald-50 text-emerald-800 ring-emerald-200'
		case PRODUCT_STATUS.Reserved:
			return 'bg-amber-50 text-amber-800 ring-amber-200'
		case PRODUCT_STATUS.SoldOut:
			return 'bg-rose-50 text-rose-800 ring-rose-200'
		case PRODUCT_STATUS.Unlisted:
			return 'bg-slate-50 text-slate-700 ring-slate-200'
		default: {
			const _exhaustive: never = status
			return _exhaustive
		}
	}
}

export function isMarketplaceVisibleStatus(status: ProductStatus) {
	return status === PRODUCT_STATUS.Available
}
