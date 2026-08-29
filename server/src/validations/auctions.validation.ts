import z from "zod";

const futureDate = z.coerce.date().refine((date) => date.getTime() > Date.now(), {
  message: "Bidding end date must be in the future",
});

export const createAuctionSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  price: z.number().positive(),
  rating: z.number().min(0).max(5).optional(),
  stockQuantity: z.number().int().min(0),
  biddingEndsAt: futureDate,
});

export const updateAuctionSchema = z
  .object({
    name: z.string().min(1).max(255).trim().optional(),
    price: z.number().positive().optional(),
    rating: z.number().min(0).max(5).optional(),
    stockQuantity: z.number().int().min(0).optional(),
    biddingEndsAt: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      return Object.keys(data).length > 0;
    },
    {
      message: "At least one field must be provided for update",
    },
  );
