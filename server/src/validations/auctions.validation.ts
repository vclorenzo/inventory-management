import { AuctionStatus } from "@prisma/client";
import z from "zod";

const auctionStatusSchema = z.nativeEnum(AuctionStatus);

const futureDate = z.coerce.date().refine((date) => date.getTime() > Date.now(), {
  message: "Bidding end date must be in the future",
});

export const createAuctionSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  price: z.number().positive(),
  status: auctionStatusSchema.optional(),
  biddingEndsAt: futureDate,
});

export const updateAuctionSchema = z
  .object({
    name: z.string().min(1).max(255).trim().optional(),
    price: z.number().positive().optional(),
    status: auctionStatusSchema.optional(),
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
