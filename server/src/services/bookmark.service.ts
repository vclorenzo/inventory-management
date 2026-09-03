import { AppError } from "#error/AppError.ts";
import { isAuctionOpen, settleExpiredAuctions } from "#services/auction.service.ts";
import { BookmarkListingType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type BookmarkListingTypeValue = "Marketplace" | "Auction";

export type MarketplaceBookmark = {
  bookmarkId: string;
  bookmarkedAt: Date;
  listingType: BookmarkListingTypeValue;
  item: {
    productId: string;
    userId: string;
    name: string;
    productCategory: string;
    brand: string;
    condition: string;
    price: number;
    rating: number | null;
    stockQuantity: number;
    status: string;
    description: string;
    paymentMethods: string[];
    meetupLocations: unknown;
    shippingDetails: string | null;
  };
};

export type AuctionBookmark = {
  bookmarkId: string;
  bookmarkedAt: Date;
  listingType: BookmarkListingTypeValue;
  item: {
    productId: string;
    userId: string;
    name: string;
    productCategory: string;
    brand: string;
    condition: string;
    price: number;
    status: string;
    description: string;
    paymentMethods: string[];
    meetupLocations: unknown;
    shippingDetails: string | null;
    biddingEndsAt: Date;
    bidCount: number;
    revision: number;
    settledAt: Date | null;
    winningBidId: string | null;
    currentHighestBid: number | null;
    isOpen: boolean;
  };
};

export type BookmarkCollection = {
  marketplace: MarketplaceBookmark[];
  auctions: AuctionBookmark[];
};

const ensureListingExists = async (
  listingType: BookmarkListingType,
  itemId: string,
) => {
  if (listingType === BookmarkListingType.Marketplace) {
    const product = await prisma.products.findFirst({
      where: { productId: itemId },
      select: { productId: true },
    });
    if (!product) {
      throw new AppError("Marketplace item does not exist", 404);
    }
    return;
  }

  const auction = await prisma.auctions.findFirst({
    where: { productId: itemId },
    select: { productId: true },
  });
  if (!auction) {
    throw new AppError("Auction item does not exist", 404);
  }
};

export const addBookmark = async ({
  userId,
  itemId,
  listingType,
}: {
  userId: string;
  itemId: string;
  listingType: BookmarkListingType;
}) => {
  await ensureListingExists(listingType, itemId);

  return prisma.bookmarks.upsert({
    where: {
      userId_listingType_itemId: {
        userId,
        listingType,
        itemId,
      },
    },
    create: {
      userId,
      itemId,
      listingType,
    },
    update: {},
  });
};

export const getBookmarksByUserId = async (
  userId: string,
): Promise<BookmarkCollection> => {
  await settleExpiredAuctions();

  const bookmarks = await prisma.bookmarks.findMany({
    where: { userId },
    orderBy: { created_at: "desc" },
  });

  const marketplaceIds = bookmarks
    .filter((bookmark) => bookmark.listingType === BookmarkListingType.Marketplace)
    .map((bookmark) => bookmark.itemId);
  const auctionIds = bookmarks
    .filter((bookmark) => bookmark.listingType === BookmarkListingType.Auction)
    .map((bookmark) => bookmark.itemId);

  const [products, auctions, highestBids] = await Promise.all([
    marketplaceIds.length
      ? prisma.products.findMany({
          where: { productId: { in: marketplaceIds } },
        })
      : Promise.resolve([]),
    auctionIds.length
      ? prisma.auctions.findMany({
          where: { productId: { in: auctionIds } },
        })
      : Promise.resolve([]),
    auctionIds.length
      ? prisma.bids.groupBy({
          by: ["productId"],
          where: {
            productId: { in: auctionIds },
          },
          _max: {
            offerPrice: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const productById = new Map(products.map((product) => [product.productId, product]));
  const auctionById = new Map(auctions.map((auction) => [auction.productId, auction]));
  const highestBidByAuctionId = new Map(
    highestBids.map((bid) => [bid.productId, bid._max.offerPrice ?? null]),
  );

  const marketplace = bookmarks
    .filter((bookmark) => bookmark.listingType === BookmarkListingType.Marketplace)
    .flatMap((bookmark) => {
      const item = productById.get(bookmark.itemId);
      if (!item) return [];
      return [
        {
          bookmarkId: bookmark.bookmarkId,
          bookmarkedAt: bookmark.created_at,
          listingType: "Marketplace" as const,
          item,
        },
      ];
    });

  const auctionBookmarks = bookmarks
    .filter((bookmark) => bookmark.listingType === BookmarkListingType.Auction)
    .flatMap((bookmark) => {
      const item = auctionById.get(bookmark.itemId);
      if (!item) return [];
      return [
        {
          bookmarkId: bookmark.bookmarkId,
          bookmarkedAt: bookmark.created_at,
          listingType: "Auction" as const,
          item: {
            ...item,
            currentHighestBid:
              highestBidByAuctionId.get(item.productId) ?? null,
            isOpen: isAuctionOpen(item),
          },
        },
      ];
    });

  return {
    marketplace,
    auctions: auctionBookmarks,
  };
};

export const removeBookmark = async (bookmarkId: string, userId: string) => {
  const bookmark = await prisma.bookmarks.findFirst({
    where: { bookmarkId, userId },
  });

  if (!bookmark) {
    throw new AppError("Bookmark does not exist", 404);
  }

  await prisma.bookmarks.delete({
    where: { bookmarkId },
  });

  return getBookmarksByUserId(userId);
};
