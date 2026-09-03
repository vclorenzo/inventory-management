"use client";

import { useAddBookmarkMutation } from "@/state/internal/bookmarksApi";
import { BookmarkListingType } from "@/types/pages/Bookmarks";
import { Bookmark } from "lucide-react";

type Props = {
  itemId: string;
  listingType: BookmarkListingType;
};

const AddBookmarkButton = ({ itemId, listingType }: Props) => {
  const [addBookmark, { isLoading }] = useAddBookmarkMutation();

  return (
    <button
      type="button"
      aria-label="Add to bookmarks"
      title="Add to bookmarks"
      onClick={async () => {
        try {
          await addBookmark({ itemId, listingType }).unwrap();
        } catch {
          // noop: existing page-level error handling remains unchanged
        }
      }}
      disabled={isLoading}
      className="inline-flex justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Bookmark />
    </button>
  );
};

export default AddBookmarkButton;
