import { Auction, AuctionFormValues } from '@/types/pages/Auctions'
import { productToFormValues } from '@/utils/productForm'

const pad = (value: number) => String(value).padStart(2, '0')

export function toDatetimeLocalValue(iso: string): string {
	const date = new Date(iso)
	if (Number.isNaN(date.getTime())) return ''
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function defaultBiddingEndsAt(): string {
	const date = new Date()
	date.setDate(date.getDate() + 7)
	return toDatetimeLocalValue(date.toISOString())
}

export function biddingEndsAtToIso(value: string): string {
	const date = new Date(value)
	return Number.isNaN(date.getTime()) ? value : date.toISOString()
}

export function auctionToFormValues(auction: Auction): AuctionFormValues {
	return {
		...productToFormValues(auction),
		biddingEndsAt: toDatetimeLocalValue(auction.biddingEndsAt),
	}
}
