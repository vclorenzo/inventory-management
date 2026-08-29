import { AppError } from "#error/AppError.ts";
import {
  isAuctionOpen,
  settleAuctionIfClosed,
} from "#services/auction.service.ts";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_PRODUCT_IMAGE =
  "https://s3-inventory-management-img-bucket.s3.ap-southeast-2.amazonaws.com/product1.png";

const CLOSED_AUCTION_STATUSES = new Set([
  "Sold",
  "Unsold",
  "Unlisted",
  "Unavailable",
]);

const highestValidBidOrder = [
  { offerPrice: "desc" as const },
  { updated_at: "asc" as const },
];

export type BidOutcome = "leading" | "outbid" | "won" | "lost";

export type BidItemResponse = {
  id: string;
  image: string;
  title: string;
  startingPrice: number;
  offerPrice: number;
  currency: string;
  isAuctionOpen: boolean;
  currentHighestBid: number | null;
  outcome: BidOutcome;
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

type BidWithAuction = Awaited<
  ReturnType<typeof prisma.bids.findMany<{ include: typeof bidInclude }>>
>[number];

const formatBidGroups = (
  bids: BidWithAuction[],
  leadingByProductId: Map<string, { bidId: string; offerPrice: number }>,
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

    const leading = leadingByProductId.get(bid.productId);
    const auctionOpen = isAuctionOpen(bid.auction);
    let outcome: BidOutcome = "outbid";

    if (!auctionOpen && bid.auction.winningBidId === bid.bidId) {
      outcome = "won";
    } else if (!auctionOpen) {
      outcome = "lost";
    } else if (leading?.bidId === bid.bidId) {
      outcome = "leading";
    }

    groups.get(shopKey)!.items.push({
      id: bid.bidId,
      image: DEFAULT_PRODUCT_IMAGE,
      title: bid.auction.name,
      startingPrice: bid.auction.price,
      offerPrice: bid.offerPrice,
      currency: bid.currency,
      isAuctionOpen: auctionOpen,
      currentHighestBid: leading?.offerPrice ?? null,
      outcome,
    });
  }

  return Array.from(groups.values());
};

const assertValidOffer = (offerPrice: number, startingPrice: number) => {
  if (offerPrice < startingPrice) {
    throw new AppError(
      `Bid must be at least the starting price of ${startingPrice}`,
      400,
    );
  }
};

const assertBeatsLeadingBid = (
  offerPrice: number,
  leadingOfferPrice: number | undefined,
) => {
  if (
    leadingOfferPrice !== undefined &&
    offerPrice <= leadingOfferPrice
  ) {
    throw new AppError(
      `Bid must exceed the current highest bid of ${leadingOfferPrice}`,
      400,
    );
  }
};

const assertAuctionAcceptingBids = (auction: {
  biddingEndsAt: Date;
  status: string;
  settledAt: Date | null;
}) => {
  if (CLOSED_AUCTION_STATUSES.has(auction.status) || auction.settledAt) {
    throw new AppError("Bidding for this auction has ended", 400);
  }
  if (auction.biddingEndsAt.getTime() <= Date.now()) {
    throw new AppError("Bidding for this auction has ended", 400);
  }
};

const lockAuction = (
  tx: Prisma.TransactionClient,
  productId: string,
) =>
  tx.$queryRaw`
    SELECT "productId" FROM "Auctions"
    WHERE "productId" = ${productId}
    FOR UPDATE
  `;

const findLeadingBid = (
  client: Prisma.TransactionClient | PrismaClient,
  productId: string,
  startingPrice: number,
  excludeBidId?: string,
) =>
  client.bids.findFirst({
    where: {
      productId,
      offerPrice: { gte: startingPrice },
      ...(excludeBidId ? { bidId: { not: excludeBidId } } : {}),
    },
    orderBy: highestValidBidOrder,
  });

const leadingBidsForProducts = async (productIds: string[]) => {
  const leadingByProductId = new Map<
    string,
    { bidId: string; offerPrice: number }
  >();

  if (productIds.length === 0) return leadingByProductId;

  const uniqueIds = [...new Set(productIds)];
  const leadingBids = await prisma.$queryRaw<
    { productId: string; bidId: string; offerPrice: number }[]
  >`
    SELECT DISTINCT ON (b."productId")
      b."productId",
      b."bidId",
      b."offerPrice"
    FROM "Bids" b
    INNER JOIN "Auctions" a ON a."productId" = b."productId"
    WHERE b."productId" IN (${Prisma.join(uniqueIds)})
      AND b."offerPrice" >= a."price"
    ORDER BY b."productId", b."offerPrice" DESC, b."updated_at" ASC
  `;

  for (const bid of leadingBids) {
    leadingByProductId.set(bid.productId, {
      bidId: bid.bidId,
      offerPrice: Number(bid.offerPrice),
    });
  }

  return leadingByProductId;
};

export const getBidsByUserId = async (userId: string) => {
  try {
    const bids = await prisma.bids.findMany({
      where: { userId },
      include: bidInclude,
      orderBy: { created_at: "asc" },
    });

    await Promise.all(
      [...new Set(bids.map((bid) => bid.productId))].map((productId) =>
        settleAuctionIfClosed(productId),
      ),
    );

    const settledBids = await prisma.bids.findMany({
      where: { userId },
      include: bidInclude,
      orderBy: { created_at: "asc" },
    });

    const leadingByProductId = await leadingBidsForProducts(
      settledBids.map((bid) => bid.productId),
    );

    return formatBidGroups(settledBids, leadingByProductId);
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
    await settleAuctionIfClosed(productId);

    await prisma.$transaction(async (tx) => {
      await lockAuction(tx, productId);

      const auction = await tx.auctions.findFirst({
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

      assertAuctionAcceptingBids(auction);
      assertValidOffer(offerPrice, auction.price);

      const existingBid = await tx.bids.findFirst({
        where: {
          userId,
          productId,
        },
      });

      if (existingBid && offerPrice < existingBid.offerPrice) {
        throw new AppError("You can only increase your current bid", 400);
      }

      const leadingBid = await findLeadingBid(
        tx,
        productId,
        auction.price,
        existingBid?.bidId,
      );

      assertBeatsLeadingBid(offerPrice, leadingBid?.offerPrice);

      if (existingBid) {
        await tx.bids.update({
          where: { bidId: existingBid.bidId },
          data: { offerPrice, currency },
        });
        return;
      }

      await tx.bids.create({
        data: {
          userId,
          productId,
          offerPrice,
          currency,
        },
      });
      await tx.auctions.update({
        where: { productId },
        data: { bidCount: { increment: 1 } },
      });
    });

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

    await settleAuctionIfClosed(existingBid.productId);

    await prisma.$transaction(async (tx) => {
      await lockAuction(tx, existingBid.productId);

      const auction = await tx.auctions.findFirst({
        where: { productId: existingBid.productId },
      });

      if (!auction) {
        throw new AppError("Auction does not exist", 404);
      }

      assertAuctionAcceptingBids(auction);
      assertValidOffer(offerPrice, auction.price);

      const currentBid = await tx.bids.findFirst({
        where: { bidId, userId },
      });

      if (!currentBid) {
        throw new AppError("Bid does not exist", 404);
      }

      if (offerPrice < currentBid.offerPrice) {
        throw new AppError("You can only increase your current bid", 400);
      }

      const leadingBid = await findLeadingBid(
        tx,
        existingBid.productId,
        auction.price,
        bidId,
      );

      assertBeatsLeadingBid(offerPrice, leadingBid?.offerPrice);

      await tx.bids.update({
        where: { bidId },
        data: { offerPrice },
      });
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

    await settleAuctionIfClosed(existingBid.productId);

    const auction = await prisma.auctions.findFirst({
      where: { productId: existingBid.productId },
    });

    if (!auction || !isAuctionOpen(auction)) {
      throw new AppError(
        "You cannot withdraw a bid after the auction has closed",
        400,
      );
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
