import { Auction } from "@/types/pages/Auctions";
import { Product } from "@/types/pages/Products";

export type BookmarkListingType = "Marketplace" | "Auction";

export interface MarketplaceBookmark {
  bookmarkId: string;
  bookmarkedAt: string;
  listingType: "Marketplace";
  item: Product;
}

export interface AuctionBookmark {
  bookmarkId: string;
  bookmarkedAt: string;
  listingType: "Auction";
  item: Auction;
}

export interface BookmarkCollection {
  marketplace: MarketplaceBookmark[];
  auctions: AuctionBookmark[];
}

export interface AddBookmarkRequest {
  itemId: string;
  listingType: BookmarkListingType;
}
