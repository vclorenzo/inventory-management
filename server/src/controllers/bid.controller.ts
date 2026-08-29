import * as bidService from "../services/bid";
import { AppError } from "#error/AppError.ts";
import { Request, Response } from "express";

const getUserId = (req: Request): string | undefined =>
  (req.user as { id?: string })?.id;

export const getBids = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const bids = await bidService.getBidsByUserId(userId);
    res.status(200).json({
      message: "Bids retrieved successfully",
      data: bids,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving bids" });
  }
};

export const addBid = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const { productId, offerPrice, currency } = req.body;

    const bids = await bidService.addBid({
      userId,
      productId,
      offerPrice,
      currency,
    });

    res.status(201).json({
      message: "Bid placed successfully",
      data: bids,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Error placing bid" });
  }
};

export const updateBid = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const { id } = req.params;
    const { offerPrice } = req.body;

    const bids = await bidService.updateBidOffer({
      bidId: id,
      userId,
      offerPrice,
    });

    res.status(200).json({
      message: "Bid updated successfully",
      data: bids,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Error updating bid" });
  }
};

export const removeBid = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const { id } = req.params;
    const bids = await bidService.removeBid(id, userId);

    res.status(200).json({
      message: "Bid removed successfully",
      data: bids,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Error removing bid" });
  }
};
