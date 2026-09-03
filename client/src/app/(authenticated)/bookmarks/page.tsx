"use client";

import Header from "@/components/Header";
import { CircularProgress } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  useGetBookmarksQuery,
  useRemoveBookmarkMutation,
} from "@/state/internal/bookmarksApi";
import { formatPeso } from "@/utils/priceFormatter";

type BookmarkTab = "Marketplace" | "Auction";

const productImageUrl = (productId: string) => {
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = (hash * 31 + productId.charCodeAt(i)) >>> 0;
  }
  const index = (hash % 3) + 1;
  return `https://s3-inventory-management-img-bucket.s3.ap-southeast-2.amazonaws.com/product${index}.png`;
};

const Bookmarks = () => {
  const [activeTab, setActiveTab] = useState<BookmarkTab>("Marketplace");
  const { data, isLoading, isError } = useGetBookmarksQuery();
  const [removeBookmark, { isLoading: isRemoving }] = useRemoveBookmarkMutation();

  const marketplaceBookmarks = data?.marketplace ?? [];
  const auctionBookmarks = data?.auctions ?? [];

  const activeBookmarks =
    activeTab === "Marketplace" ? marketplaceBookmarks : auctionBookmarks;

  if (isLoading) {
    return (
      <div className="py-4">
        <CircularProgress />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 py-4">Failed to fetch bookmarks</div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl pb-10">
      <Header name="Bookmarks" />
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("Marketplace")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            activeTab === "Marketplace"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Marketplace ({marketplaceBookmarks.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("Auction")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            activeTab === "Auction"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Auctions ({auctionBookmarks.length})
        </button>
      </div>

      {activeBookmarks.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-gray-500">
          No {activeTab.toLowerCase()} bookmarks yet.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activeBookmarks.map((bookmark) => {
            const item = bookmark.item;
            const isAuction = bookmark.listingType === "Auction";
            const displayPrice =
              bookmark.listingType === "Auction"
                ? formatPeso(bookmark.item.currentHighestBid ?? bookmark.item.price)
                : formatPeso(bookmark.item.price);
            return (
              <div
                key={bookmark.bookmarkId}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <Link
                  href={`/${isAuction ? "auctions" : "marketplace"}/${item.productId}`}
                  className="block"
                >
                  <div className="mx-auto h-36 w-36">
                    <Image
                      src={productImageUrl(item.productId)}
                      alt={item.name}
                      width={150}
                      height={150}
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-lg font-semibold text-gray-900">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-gray-800">
                    {isAuction ? `Current Price: ${displayPrice}` : displayPrice}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {item.brand} • {item.condition}
                  </p>
                </Link>
                <button
                  type="button"
                  onClick={() => removeBookmark(bookmark.bookmarkId)}
                  disabled={isRemoving}
                  className="mt-4 w-full rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Remove bookmark
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
