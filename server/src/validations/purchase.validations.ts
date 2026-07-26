import z from 'zod'

export const placeOrderSchema = z.object({
	cartItemIds: z
		.array(z.string().uuid())
		.min(1, 'Select at least one cart item'),
	addressId: z.string().uuid(),
	paymentMethod: z.enum(['cod']),
})

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>
