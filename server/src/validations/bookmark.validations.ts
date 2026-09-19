import z from "zod";

export const addBookmarkSchema = z.object({
  itemId: z.string().uuid(),
  listingType: z.enum(["Marketplace", "Auction"]),
});
