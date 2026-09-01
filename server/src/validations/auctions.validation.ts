import { AuctionStatus } from "@prisma/client";
import z from "zod";

const auctionStatusSchema = z.nativeEnum(AuctionStatus);

const futureDate = z.coerce.date().refine((date) => date.getTime() > Date.now(), {
  message: "Bidding end date must be in the future",
});

const isHttpOrHttpsUrl = (value: string) => {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
};

const meetupLocationSchema = z.object({
  name: z.string().trim(),
  address: z.string().trim(),
  mapLink: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || isHttpOrHttpsUrl(value), {
      message: "Map link must be an http or https URL",
    }),
});

const requiredName = z.string().trim().min(1).max(255);

const auctionFields = {
  name: requiredName,
  productCategory: z.string().trim().min(1).max(255),
  brand: z.string().trim().min(1).max(255),
  condition: z.string().trim().min(1).max(255),
  price: z.number().positive(),
  status: auctionStatusSchema,
  description: z.string().trim().min(1),
  paymentMethods: z.array(z.string().trim().min(1).max(100)),
  meetupLocations: z.array(meetupLocationSchema),
  shippingDetails: z.string().trim().nullable(),
  biddingEndsAt: futureDate,
};

export const createAuctionSchema = z.object({
  name: auctionFields.name,
  productCategory: auctionFields.productCategory,
  brand: auctionFields.brand,
  condition: auctionFields.condition,
  price: auctionFields.price,
  status: auctionFields.status.optional(),
  description: auctionFields.description,
  paymentMethods: auctionFields.paymentMethods.optional(),
  meetupLocations: auctionFields.meetupLocations.optional(),
  shippingDetails: auctionFields.shippingDetails.optional(),
  biddingEndsAt: auctionFields.biddingEndsAt,
});

export const updateAuctionSchema = z
  .object({
    name: auctionFields.name.optional(),
    productCategory: auctionFields.productCategory.optional(),
    brand: auctionFields.brand.optional(),
    condition: auctionFields.condition.optional(),
    price: auctionFields.price.optional(),
    status: auctionFields.status.optional(),
    description: auctionFields.description.optional(),
    paymentMethods: auctionFields.paymentMethods.optional(),
    meetupLocations: auctionFields.meetupLocations.optional(),
    shippingDetails: auctionFields.shippingDetails.optional(),
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
