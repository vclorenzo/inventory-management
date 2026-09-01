import { AuctionStatus } from "@prisma/client";
import { AppError } from "#error/AppError.ts";

export const AUCTION_STATUS = AuctionStatus;

export const PUBLIC_AUCTION_STATUS = AuctionStatus.Available;

const AUCTION_STATUS_VALUES = new Set<string>(Object.values(AuctionStatus));

export function isAuctionStatus(value: string): value is AuctionStatus {
  return AUCTION_STATUS_VALUES.has(value);
}

export function resolveCreateAuctionStatus(
  status?: string | null,
): AuctionStatus {
  const normalized = status?.trim() || AuctionStatus.Available;

  if (!isAuctionStatus(normalized)) {
    throw new AppError("Invalid auction status", 400);
  }

  if (
    normalized === AuctionStatus.SoldOut ||
    normalized === AuctionStatus.Unsold
  ) {
    return AuctionStatus.Available;
  }

  return normalized;
}

export function resolveUpdatedAuctionStatus({
  requestedStatus,
  existingStatus,
  biddingEndsAt,
  isRelisting,
}: {
  requestedStatus?: string | null;
  existingStatus: AuctionStatus;
  biddingEndsAt: Date;
  isRelisting: boolean;
}): AuctionStatus {
  if (existingStatus === AuctionStatus.SoldOut) {
    if (
      requestedStatus &&
      requestedStatus.trim() !== AuctionStatus.SoldOut
    ) {
      throw new AppError("Sold auctions cannot be listed again", 400);
    }
    return AuctionStatus.SoldOut;
  }

  const nextStatus = requestedStatus?.trim() || existingStatus;

  if (!isAuctionStatus(nextStatus)) {
    throw new AppError("Invalid auction status", 400);
  }

  if (nextStatus === AuctionStatus.SoldOut) {
    throw new AppError(
      "Sold Out is set automatically when an auction is won",
      400,
    );
  }

  if (
    nextStatus === AuctionStatus.Unsold &&
    existingStatus !== AuctionStatus.Unsold
  ) {
    throw new AppError(
      "Unsold is set automatically when bidding ends with no bids",
      400,
    );
  }

  if (nextStatus === AuctionStatus.Available) {
    if (existingStatus === AuctionStatus.Unsold && !isRelisting) {
      throw new AppError(
        "Set a new bidding end date to re-auction this item",
        400,
      );
    }

    if (biddingEndsAt.getTime() <= Date.now()) {
      throw new AppError(
        "Bidding end date must be in the future to list this auction",
        400,
      );
    }
  }

  return nextStatus;
}
