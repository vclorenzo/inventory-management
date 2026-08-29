import { Request, Response } from "express";
import * as auctionService from "../services/auction.service";
import { AppError } from "#error/AppError.ts";

const parseCsv = (value?: string): string[] | undefined => {
  if (!value) return undefined;
  const parsed = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return parsed.length ? parsed : undefined;
};

const parseNumber = (value: unknown): number | undefined => {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const getAuctionById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const auction = await auctionService.getAuctionById(id);
    if (!auction) {
      res.status(404).json({ message: "Auction not found" });
    } else {
      res.status(200).json({
        message: "Auction retrieved successfully",
        data: auction,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving auction" });
  }
};

export const getAllAuctions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const search = req.query.search?.toString();
    const userId = req.query.userId?.toString();
    const excludeUserId = req.query.excludeUserId?.toString();
    const category = parseCsv(req.query.category?.toString());
    const brand = parseCsv(req.query.brand?.toString());
    const condition = parseCsv(req.query.condition?.toString());
    const status = parseCsv(req.query.status?.toString());
    const minPrice = parseNumber(req.query.minPrice);
    const maxPrice = parseNumber(req.query.maxPrice);
    const minRating = parseNumber(req.query.minRating);
    const maxRating = parseNumber(req.query.maxRating);
    const minStock = parseNumber(req.query.minStock);
    const maxStock = parseNumber(req.query.maxStock);
    const sortBy = req.query.sortBy?.toString() as
      | "relevance"
      | "name"
      | "price"
      | "rating"
      | "stockQuantity"
      | undefined;
    const sortOrder = req.query.sortOrder?.toString() as
      | "asc"
      | "desc"
      | undefined;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const parsedLimit = Number(req.query.limit);
    const limit =
      req.query.limit !== undefined && !Number.isNaN(parsedLimit)
        ? Math.max(parsedLimit, 1)
        : undefined;

    const { auctions, totalCount } = await auctionService.getAllAuctions({
      search,
      userId,
      excludeUserId,
      category,
      brand,
      condition,
      status,
      minPrice,
      maxPrice,
      minRating,
      maxRating,
      minStock,
      maxStock,
      sortBy,
      sortOrder,
      page,
      limit,
    });
    const totalPages =
      limit !== undefined ? Math.max(Math.ceil(totalCount / limit), 1) : 1;

    res.status(200).json({
      message: "Successfully retrieved auctions",
      data: auctions,
      page,
      limit,
      totalPages,
      totalCount,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Error retrieving auctions" });
  }
};

export const createAuction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req.user as { id?: string })?.id;
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const {
      name,
      productCategory,
      brand,
      condition,
      price,
      rating,
      stockQuantity,
      status,
      description,
      paymentMethods,
      meetupLocations,
      shippingDetails,
      biddingEndsAt,
    } = req.body;
    const auction = await auctionService.createAuction({
      name,
      userId,
      productCategory,
      brand,
      condition,
      price,
      rating,
      stockQuantity,
      status,
      description,
      paymentMethods,
      meetupLocations,
      shippingDetails,
      biddingEndsAt,
    });
    res.status(201).json({ data: auction });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateAuction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedAuction = await auctionService.updateAuction(id, data);
    res
      .status(200)
      .json({ message: "Auction updated successfully", data: updatedAuction });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteAuction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedAuction = await auctionService.deleteAuction(id);
    res.status(200).json({
      message: `Auction ${deletedAuction.name} deleted successfully`,
      data: deletedAuction,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};
