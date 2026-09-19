import logger from "#config/logger.ts";
import { emitUserNotification } from "#config/socket.ts";
import {
  NOTIFICATION_LISTING_TYPE,
  NOTIFICATION_TYPE,
  type NotificationListingType,
  type NotificationType,
} from "#src/constants/notification.ts";
import {
  BookmarkListingType,
  NotificationType as PrismaNotificationType,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();
const FANOUT_CONCURRENCY = 8;

const listingTypeForNotification = (
  type: PrismaNotificationType,
): NotificationListingType => {
  if (
    type === NOTIFICATION_TYPE.MARKETPLACE_SOLD_OUT ||
    type === NOTIFICATION_TYPE.MARKETPLACE_PRICE_DROP
  ) {
    return NOTIFICATION_LISTING_TYPE.Marketplace;
  }
  return NOTIFICATION_LISTING_TYPE.Auction;
};

export type NotificationResponse = {
  notificationId: string;
  type: NotificationType;
  listingType: NotificationListingType;
  productId: string;
  title: string;
  message: string;
  metadata: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
};

export type NotificationListResponse = {
  notifications: NotificationResponse[];
  unreadCount: number;
};

const formatMetadata = (value: Prisma.JsonValue) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
};

const formatNotification = (notification: {
  notificationId: string;
  type: PrismaNotificationType;
  productId: string;
  title: string;
  message: string;
  metadata: Prisma.JsonValue;
  readAt: Date | null;
  created_at: Date;
}): NotificationResponse => ({
  notificationId: notification.notificationId,
  type: notification.type as NotificationType,
  listingType: listingTypeForNotification(notification.type),
  productId: notification.productId,
  title: notification.title,
  message: notification.message,
  metadata: formatMetadata(notification.metadata),
  readAt: notification.readAt?.toISOString() ?? null,
  createdAt: notification.created_at.toISOString(),
});

const formatOffer = (amount: number | null) =>
  amount == null ? null : `₱${amount.toLocaleString("en-PH")}`;

const mapWithConcurrency = async <T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
) => {
  if (items.length === 0) return;

  let nextIndex = 0;
  const run = async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      await worker(items[currentIndex]);
    }
  };

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(
    Array.from({ length: workerCount }, () => run()),
  );
};

const notificationIdempotencyKey = ({
  userId,
  type,
  productId,
  eventKey,
}: {
  userId: string;
  type: NotificationType;
  productId: string;
  eventKey: string;
}) =>
  createHash("sha256")
    .update(`${type}:${productId}:${userId}:${eventKey}`)
    .digest("hex");

const createAndPublish = async ({
  userId,
  type,
  productId,
  title,
  message,
  metadata,
  eventKey,
}: {
  userId: string;
  type: NotificationType;
  productId: string;
  title: string;
  message: string;
  metadata: Prisma.InputJsonValue;
  eventKey: string;
}) => {
  const idempotencyKey = notificationIdempotencyKey({
    userId,
    type,
    productId,
    eventKey,
  });
  const notification = await prisma.notifications.upsert({
    where: { idempotencyKey },
    create: {
      userId,
      type,
      productId,
      title,
      message,
      metadata,
      idempotencyKey,
    },
    update: {},
  });
  const payload = formatNotification(notification);

  try {
    emitUserNotification(userId, payload);
  } catch (error) {
    logger.error("Failed to publish notification", error);
  }

  return payload;
};

const getMarketplaceWatcherUserIds = async (
  productId: string,
  excludeUserIds: string[] = [],
) => {
  const [cartUsers, bookmarkUsers] = await Promise.all([
    prisma.cartItems.findMany({
      where: { productId },
      select: { userId: true },
    }),
    prisma.bookmarks.findMany({
      where: {
        itemId: productId,
        listingType: BookmarkListingType.Marketplace,
      },
      select: { userId: true },
    }),
  ]);

  const excluded = new Set(excludeUserIds);
  return [
    ...new Set([
      ...cartUsers.map((item) => item.userId),
      ...bookmarkUsers.map((bookmark) => bookmark.userId),
    ]),
  ].filter((userId) => !excluded.has(userId));
};

export const getNotificationsByUserId = async (
  userId: string,
): Promise<NotificationListResponse> => {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notifications.findMany({
      where: { userId },
      orderBy: { created_at: "desc" },
      take: 100,
    }),
    prisma.notifications.count({
      where: { userId, readAt: null },
    }),
  ]);

  return {
    notifications: notifications.map(formatNotification),
    unreadCount,
  };
};

export const markNotificationRead = async (
  notificationId: string,
  userId: string,
) => {
  const existing = await prisma.notifications.findFirst({
    where: { notificationId, userId },
  });

  if (!existing) return null;

  if (existing.readAt) {
    return formatNotification(existing);
  }

  const updated = await prisma.notifications.update({
    where: { notificationId },
    data: { readAt: new Date() },
  });

  return formatNotification(updated);
};

export const markAllNotificationsRead = async (userId: string) => {
  await prisma.notifications.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });

  return getNotificationsByUserId(userId);
};

export const notifyOutbid = async ({
  userId,
  productId,
  auctionName,
  currentHighestBid,
}: {
  userId: string;
  productId: string;
  auctionName: string;
  currentHighestBid: number;
}) => {
  const formattedBid = formatOffer(currentHighestBid);
  return createAndPublish({
    userId,
    type: NOTIFICATION_TYPE.OUTBID,
    productId,
    title: "You were outbid",
    message: `${auctionName} now has a higher bid of ${formattedBid}.`,
    metadata: {
      auctionName,
      currentHighestBid,
    },
    eventKey: `outbid:${currentHighestBid}`,
  });
};

export const notifyAuctionEnded = async ({
  productId,
  auctionName,
  recipientUserIds,
  winnerUserId,
  winningOfferPrice,
}: {
  productId: string;
  auctionName: string;
  recipientUserIds: string[];
  winnerUserId: string | null;
  winningOfferPrice: number | null;
}) => {
  const uniqueUserIds = [...new Set(recipientUserIds)];
  const formattedWinningBid = formatOffer(winningOfferPrice);
  const eventKey = `auction-ended:${winnerUserId ?? ""}:${winningOfferPrice ?? ""}`;

  await mapWithConcurrency(uniqueUserIds, FANOUT_CONCURRENCY, (userId) => {
    const isWinner = winnerUserId === userId;
    return createAndPublish({
      userId,
      type: NOTIFICATION_TYPE.AUCTION_ENDED,
      productId,
      title: isWinner ? "You won an auction" : "Auction ended",
      message: isWinner
        ? `You won ${auctionName}${
            formattedWinningBid ? ` with a bid of ${formattedWinningBid}` : ""
          }.`
        : `${auctionName} has ended.`,
      metadata: {
        auctionName,
        isWinner,
        winningOfferPrice,
      },
      eventKey,
    });
  });
};

export const notifyMarketplaceSoldOut = async ({
  productId,
  productName,
  excludeUserIds = [],
}: {
  productId: string;
  productName: string;
  excludeUserIds?: string[];
}) => {
  const recipientUserIds = await getMarketplaceWatcherUserIds(
    productId,
    excludeUserIds,
  );

  await mapWithConcurrency(
    recipientUserIds,
    FANOUT_CONCURRENCY,
    (userId) =>
      createAndPublish({
        userId,
        type: NOTIFICATION_TYPE.MARKETPLACE_SOLD_OUT,
        productId,
        title: "Item sold out",
        message: `${productName} is now sold out.`,
        metadata: { productName },
        eventKey: `sold-out:${productName}`,
      }),
  );
};

export const notifyMarketplacePriceDrop = async ({
  productId,
  productName,
  previousPrice,
  newPrice,
  excludeUserIds = [],
}: {
  productId: string;
  productName: string;
  previousPrice: number;
  newPrice: number;
  excludeUserIds?: string[];
}) => {
  const recipientUserIds = await getMarketplaceWatcherUserIds(
    productId,
    excludeUserIds,
  );
  const formattedPrevious = formatOffer(previousPrice);
  const formattedNew = formatOffer(newPrice);
  const eventKey = `price-drop:${previousPrice}:${newPrice}`;

  await mapWithConcurrency(
    recipientUserIds,
    FANOUT_CONCURRENCY,
    (userId) =>
      createAndPublish({
        userId,
        type: NOTIFICATION_TYPE.MARKETPLACE_PRICE_DROP,
        productId,
        title: "Price dropped",
        message: `${productName} dropped from ${formattedPrevious} to ${formattedNew}.`,
        metadata: {
          productName,
          previousPrice,
          newPrice,
        },
        eventKey,
      }),
  );
};
