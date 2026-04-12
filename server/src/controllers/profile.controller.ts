import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import logger from '#config/logger.ts';
import * as profileService from '#services/profile.service.ts';
const prisma = new PrismaClient();

//TODO: Remove profileId, UserID on return
export const getProfileById = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { id } = req.params;
		const { profile, email, name } = await profileService.getProfileById(id);

		logger.info(`Profile ${email} retrieved successfully`);
		res.status(200).json({
			message: 'Profile retrieved successfully',
			data: { ...profile, email, name },
		});
	} catch (error: any) {
		logger.error(error.message);
		res.status(500).json(error.message);
	}
};

export const updateProfile = async (
	req: Request,
	res: Response,
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
		logger.error(error.message);
		res.status(500).json(error.message);
	}
};
