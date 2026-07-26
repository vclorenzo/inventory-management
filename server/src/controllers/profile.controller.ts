import { NextFunction, Request, Response } from "express";
import logger from "#config/logger.ts";
import * as profileService from "#services/profile.service.ts";
import * as addressService from "#services/address.service.ts";
import { AppError } from "#error/AppError.ts";

export const getProfileById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const profile = await profileService.getProfileById(id);

    logger.info(`Profile ${profile.email} retrieved successfully`);
    res.status(200).json({
      message: "Profile retrieved successfully",
      data: profile,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    logger.error(error.message);
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedProfile = await profileService.updateProfile(id, data);
    logger.info(`Profile ${updatedProfile.email} updated successfully`);
    res.status(200).json({
      message: `Profile ${updatedProfile.email} updated successfully`,
      updatedProfile,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    logger.error(error.message);
    next(error);
  }
};

export const createAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const address = await addressService.createAddress(id, req.body);
    res.status(201).json({
      message: "Address created successfully",
      data: address,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    logger.error(error.message);
    next(error);
  }
};

export const updateAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id, addressId } = req.params;
    const address = await addressService.updateAddress(
      id,
      addressId,
      req.body,
    );
    res.status(200).json({
      message: "Address updated successfully",
      data: address,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    logger.error(error.message);
    next(error);
  }
};

export const deleteAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id, addressId } = req.params;
    const result = await addressService.deleteAddress(id, addressId);
    res.status(200).json({
      message: "Address deleted successfully",
      data: result,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    logger.error(error.message);
    next(error);
  }
};
