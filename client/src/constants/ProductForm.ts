import type { ReusableFieldConfig } from '@/types/components/ReactHookForm'
import { AuctionFormValues } from '@/types/pages/Auctions'
import { ProductFormValues } from '@/types/pages/Products'
import type { UseFormGetValues } from 'react-hook-form'
type Args = { getValues: UseFormGetValues<ProductFormValues> }

export function buildProductFormFields({
	getValues,
}: Args): ReusableFieldConfig<ProductFormValues>[] {
	return [
		{
			name: 'name',
			label: 'Name',
			type: 'text',
			rules: {
				required: 'Name is required',
			},
		},
		{
			name: 'productCategory',
			label: 'Category',
			type: 'text',
			rules: {
				required: 'Category is required',
			},
		},
		{
			name: 'brand',
			label: 'Brand',
			type: 'text',
			rules: {
				required: 'Brand is required',
			},
		},
		{
			name: 'condition',
			label: 'Condition',
			type: 'text',
			rules: {
				required: 'Condition is required',
			},
		},
		{
			name: 'price',
			label: 'Price',
			type: 'number',
			rules: {
				required: 'Price is required',
				valueAsNumber: true,
			},
		},
		{
			name: 'stockQuantity',
			label: 'Stock',
			type: 'number',
			autoComplete: 'stock',
			rules: {
				required: 'Stock is required',
				valueAsNumber: true,
			},
		},
		{
			name: 'description',
			label: 'Description',
			type: 'textarea',
			rules: {
				required: 'Description is required',
			},
		},
		{
			name: 'paymentMethods',
			label: 'Payment Methods',
			type: 'text',
			rules: {
				required: 'Payment method is required',
			},
		},
		{
			name: 'meetupLocations',
			label: 'Meetup Locations',
			type: 'text',
			rules: {
				required: 'Meetup locations are required',
			},
		},
	]
}

export function buildAuctionFormFields({
	getValues,
}: {
	getValues: UseFormGetValues<AuctionFormValues>
}): ReusableFieldConfig<AuctionFormValues>[] {
	return [
		...(buildProductFormFields({
			getValues: getValues as unknown as UseFormGetValues<ProductFormValues>,
		}) as unknown as ReusableFieldConfig<AuctionFormValues>[]),
		{
			name: 'biddingEndsAt',
			label: 'Bidding ends',
			type: 'datetime-local',
			rules: {
				required: 'Bidding end date is required',
			},
		},
	]
}
