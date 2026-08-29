import { AppError } from "#error/AppError.ts";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_PRODUCT_IMAGE =
  "https://s3-inventory-management-img-bucket.s3.ap-southeast-2.amazonaws.com/product1.png";

export type BidItemResponse = {
  id: string;
  image: string;
  title: string;
  startingPrice: number;
  offerPrice: number;
  currency: string;
};

export type BidGroupResponse = {
  shop: {
    name: string;
  };
  items: BidItemResponse[];
};

const bidInclude = {
  auction: {
    include: {
      owner: {
        select: {
          userId: true,
          name: true,
        },
      },
    },
  },
} as const;

const formatBidGroups = (
  bids: Awaited<
    ReturnType<typeof prisma.bids.findMany<{ include: typeof bidInclude }>>
  >,
): BidGroupResponse[] => {
  const groups = new Map<string, BidGroupResponse>();

  for (const bid of bids) {
    const shopKey = bid.auction.userId;
    if (!groups.has(shopKey)) {
      groups.set(shopKey, {
        shop: { name: bid.auction.owner.name },
        items: [],
      });
    }

    groups.get(shopKey)!.items.push({
      id: bid.bidId,
      image: DEFAULT_PRODUCT_IMAGE,
      title: bid.auction.name,
      startingPrice: bid.auction.price,
      offerPrice: bid.offerPrice,
      currency: bid.currency,
    });
  }

  return Array.from(groups.values());
};

const assertValidOffer = (offerPrice: number, startingPrice: number) => {
  if (offerPrice < startingPrice) {
    throw new AppError(
      `Offer must be at least the starting price of ${startingPrice}`,
      400,
    );
  }
};

const assertAuctionOpen = (biddingEndsAt: Date) => {
  if (biddingEndsAt.getTime() <= Date.now()) {
    throw new AppError("Bidding for this auction has ended", 400);
  }
};

export const getBidsByUserId = async (userId: string) => {
  try {
    const bids = await prisma.bids.findMany({
      where: { userId },
      include: bidInclude,
      orderBy: { created_at: "asc" },
    });

    return formatBidGroups(bids);
  } catch (error) {
    throw error;
  }
};

export const getBidById = async (bidId: string, userId: string) => {
  try {
    return await prisma.bids.findFirst({
      where: { bidId, userId },
      include: bidInclude,
    });
  } catch (error) {
    throw error;
  }
};

export const addBid = async ({
  userId,
  productId,
  offerPrice,
  currency = "₱",
}: {
  userId: string;
  productId: string;
  offerPrice: number;
  currency?: string;
}) => {
  try {
    const auction = await prisma.auctions.findFirst({
      where: { productId },
    });

    if (!auction) {
      throw new AppError("Auction does not exist", 404);
    }

    if (auction.userId === userId) {
      throw new AppError("You cannot bid on your own listing", 400);
    }

    if (auction.stockQuantity <= 0) {
      throw new AppError("Product is out of stock", 400);
    }

    assertAuctionOpen(auction.biddingEndsAt);
    assertValidOffer(offerPrice, auction.price);

    const existingBid = await prisma.bids.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (existingBid) {
      await prisma.bids.update({
        where: { bidId: existingBid.bidId },
        data: { offerPrice, currency },
      });
    } else {
      await prisma.$transaction([
        prisma.bids.create({
          data: {
            userId,
            productId,
            offerPrice,
            currency,
          },
        }),
        prisma.auctions.update({
          where: { productId },
          data: { bidCount: { increment: 1 } },
        }),
      ]);
    }

    return getBidsByUserId(userId);
  } catch (error) {
    throw error;
  }
};

export const updateBidOffer = async ({
  bidId,
  userId,
  offerPrice,
}: {
  bidId: string;
  userId: string;
  offerPrice: number;
}) => {
  try {
    const existingBid = await getBidById(bidId, userId);
    if (!existingBid) {
      throw new AppError("Bid does not exist", 404);
    }

    assertAuctionOpen(existingBid.auction.biddingEndsAt);
    assertValidOffer(offerPrice, existingBid.auction.price);

    await prisma.bids.update({
      where: { bidId },
      data: { offerPrice },
    });

    return getBidsByUserId(userId);
  } catch (error) {
    throw error;
  }
};

export const removeBid = async (bidId: string, userId: string) => {
  try {
    const existingBid = await getBidById(bidId, userId);
    if (!existingBid) {
      throw new AppError("Bid does not exist", 404);
    }

    await prisma.$transaction([
      prisma.bids.delete({
        where: { bidId },
      }),
      prisma.auctions.update({
        where: { productId: existingBid.productId },
        data: { bidCount: { decrement: 1 } },
      }),
    ]);

    return getBidsByUserId(userId);
  } catch (error) {
    throw error;
  }
};
