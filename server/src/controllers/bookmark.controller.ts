import { AppError } from "#error/AppError.ts";
import * as bookmarkService from "#services/bookmark.service.ts";
import { BookmarkListingType } from "@prisma/client";
import { Request, Response } from "express";

const getUserId = (req: Request): string | undefined =>
  (req.user as { id?: string })?.id;

export const getBookmarks = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const bookmarks = await bookmarkService.getBookmarksByUserId(userId);
    res.status(200).json({
      message: "Bookmarks retrieved successfully",
      data: bookmarks,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Error retrieving bookmarks" });
  }
};

export const createBookmark = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const { itemId, listingType } = req.body as {
      itemId: string;
      listingType: BookmarkListingType;
    };
    const bookmark = await bookmarkService.addBookmark({
      userId,
      itemId,
      listingType,
    });

    res.status(201).json({
      message: "Bookmark saved successfully",
      data: bookmark,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Error saving bookmark" });
  }
};

export const deleteBookmark = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const { id } = req.params;
    const bookmarks = await bookmarkService.removeBookmark(id, userId);
    res.status(200).json({
      message: "Bookmark removed successfully",
      data: bookmarks,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Error removing bookmark" });
  }
};
