// import { NextFunction, Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';
// import * as userService from '../services/user.service';
// import logger from '#config/logger.ts';
// const prisma = new PrismaClient();

// export const getProfileById = async (
// 	req: Request,
// 	res: Response,
// 	next: NextFunction,
// ): Promise<void> => {
// 	try {
// 		const { id } = req.params;
// 		const profile = await userService.getUserById(id);

// 		if (!profile) {
// 			res.status(404).json({ message: 'User not found' });
// 		} else {
// 			logger.info(`Profile ${profile!.email} retrieved successfully`);
// 			res.status(200).json({
// 				message: 'Profile retrieved successfully',
// 				profile,
// 			});
// 		}
// 	} catch (error: any) {
// 		logger.error(error.message);
// 		res.status(500).json(error.message);
// 	}
// };

// export const updateProfile = async (
// 	req: Request,
// 	res: Response,
// ): Promise<void> => {
// 	try {
// 		const { id } = req.params;
// 		const data = req.body;
// 		const updatedProfile = await userService.updateProfile(id, data);
// 		logger.info(`Profile ${updatedProfile.email} updated successfully`);
// 		res.status(200).json({
// 			message: `Profile ${updatedProfile.email} updated successfully`,
// 			updatedProfile,
// 		});
// 	} catch (error: any) {
// 		logger.error(error.message);
// 		res.status(500).json(error.message);
// 	}
// };

// export const deleteProfile = async (
// 	req: Request,
// 	res: Response,
// ): Promise<void> => {
// 	try {
// 		const { id } = req.params;
// 		const deletedProfile = await userService.deleteProfile(id);
// 		logger.info(`Profile ${deletedProfile.email} deleted successfully`);
// 		res.status(200).json({
// 			message: `Profile ${deletedProfile.email} deleted successfully`,
// 			deletedProfile,
// 		});
// 	} catch (error: any) {
// 		logger.error(error.message);
// 		res.status(500).json(error.message);
// 	}
// };
