type meetupLocations = { name: string; address: string; mapLink: string }

export type ListingType = 'marketplace' | 'auction'

export interface Product {
	productId: string
	name: string
	productCategory: string
	brand: string
	condition: string
	price: number
	rating: number | null
	reviewCount?: number
	stockQuantity: number
	status: string
	listingType: ListingType
	description: string
	paymentMethods: string[]
	meetupLocations: meetupLocations[]
	shippingDetails: string | null
	userId: string
}

export interface NewProduct {
	name: string
	productCategory: string
	brand: string
	condition: string
	price: number
	stockQuantity: number
	status?: string
	listingType: ListingType
	description: string
	paymentMethods?: string[]
	meetupLocations?: meetupLocations[]
	shippingDetails?: string | null
}

export type ProductFormValues = {
	name: string
	productCategory: string
	brand: string
	condition: string
	price: number
	stockQuantity: number
	status: string
	listingType: ListingType
	description: string
	paymentMethods: string[]
	meetupLocations: meetupLocations[]
	shippingDetails: string | null
}

export type UpdateProduct = ProductFormValues & {
	productId: string
}
