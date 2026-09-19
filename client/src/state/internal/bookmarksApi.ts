import {
  AddBookmarkRequest,
  BookmarkCollection,
} from "@/types/pages/Bookmarks";
import { api } from "../api";

const emptyBookmarks: BookmarkCollection = {
  marketplace: [],
  auctions: [],
};

export const bookmarksApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBookmarks: builder.query<BookmarkCollection, void>({
      query: () => "/bookmarks",
      transformResponse: (response: { data?: BookmarkCollection }) =>
        response?.data ?? emptyBookmarks,
      providesTags: ["Bookmarks"],
    }),
    addBookmark: builder.mutation<{ bookmarkId: string }, AddBookmarkRequest>({
      query: (body) => ({
        url: "/bookmarks",
        method: "POST",
        body,
      }),
      transformResponse: (response: { data?: { bookmarkId: string } }) =>
        response.data ?? { bookmarkId: "" },
      invalidatesTags: ["Bookmarks"],
    }),
    removeBookmark: builder.mutation<BookmarkCollection, string>({
      query: (bookmarkId) => ({
        url: `/bookmarks/${bookmarkId}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data?: BookmarkCollection }) =>
        response?.data ?? emptyBookmarks,
      invalidatesTags: ["Bookmarks"],
    }),
  }),
});

export const {
  useGetBookmarksQuery,
  useAddBookmarkMutation,
  useRemoveBookmarkMutation,
} = bookmarksApi;
