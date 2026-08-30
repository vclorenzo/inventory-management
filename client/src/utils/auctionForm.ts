import { Auction, AuctionFormValues } from '@/types/pages/Auctions'

const pad = (value: number) => String(value).padStart(2, '0')

const emptyMeetupLocation = () => ({
	name: '',
	address: '',
	mapLink: '',
})

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
	const locations = Array.isArray(auction.meetupLocations)
		? auction.meetupLocations.map((location) => ({
				name: typeof location?.name === 'string' ? location.name : '',
				address:
					typeof location?.address === 'string' ? location.address : '',
				mapLink:
					typeof location?.mapLink === 'string' ? location.mapLink : '',
			}))
		: []

	return {
		name: auction.name,
		productCategory: auction.productCategory,
		brand: auction.brand,
		condition: auction.condition,
		price: auction.price,
		status: auction.status,
		description: auction.description,
		paymentMethods: Array.isArray(auction.paymentMethods)
			? [...auction.paymentMethods]
			: [],
		meetupLocations:
			locations.length > 0 ? locations : [emptyMeetupLocation()],
		shippingDetails:
			auction.shippingDetails === null ||
			auction.shippingDetails === undefined
				? ''
				: auction.shippingDetails,
		biddingEndsAt: toDatetimeLocalValue(auction.biddingEndsAt),
	}
}
