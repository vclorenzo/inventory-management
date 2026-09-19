export const NOTIFICATION_TYPE = {
  OUTBID: "OUTBID",
  AUCTION_ENDED: "AUCTION_ENDED",
  MARKETPLACE_SOLD_OUT: "MARKETPLACE_SOLD_OUT",
  MARKETPLACE_PRICE_DROP: "MARKETPLACE_PRICE_DROP",
} as const;

export const NOTIFICATION_LISTING_TYPE = {
  Auction: "Auction",
  Marketplace: "Marketplace",
} as const;

export type NotificationListingType =
  (typeof NOTIFICATION_LISTING_TYPE)[keyof typeof NOTIFICATION_LISTING_TYPE];

export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];
