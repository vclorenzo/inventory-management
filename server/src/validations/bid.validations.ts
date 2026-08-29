import z from "zod";

export const addBidSchema = z.object({
  productId: z.string().uuid(),
  offerPrice: z.number().positive(),
  currency: z.string().max(10).optional(),
});

export const updateBidSchema = z.object({
  offerPrice: z.number().positive(),
});

export const bidIdSchema = z.object({
  id: z.string().uuid(),
});
