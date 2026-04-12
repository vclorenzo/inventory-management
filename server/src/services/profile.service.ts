import logger from '#config/logger.ts';
import { PrismaClient, Profile } from '@prisma/client';
import * as userService from './user.service';
import { AppError } from '#error/AppError.ts';

const prisma = new PrismaClient();

export const getProfileById = async (id: string) => {
	const existingUser = await userService.getUserById(id);
	if (!existingUser) {
		throw new AppError('User not found');
	}
	const profile = await prisma.users.findUnique({
		where: {
			userId: id,
		},
		select: {
			name: true,
			email: true,
			profile: {
				select: {
					region: true,
					province: true,
					city: true,
					barangay: true,
				},
			},
		},
	});
	return { email: existingUser.email, ...profile };
};

export const updateProfile = async (
	id: string,
	data: Partial<Profile> & { name?: string },
) => {
	const existingUser = await userService.getUserById(id);
	if (!existingUser) {
		throw new AppError('User not found');
	}

	let updatedUser = existingUser;
	if (data.name !== undefined) {
		updatedUser = await userService.updateUser(id, { name: data.name });
	}

	const updatedProfile = await prisma.profile.update({
		where: { userId: id },
		data: {
			region: data.region,
			province: data.province,
			city: data.city,
			barangay: data.barangay,
		},
	});
	logger.info(`Profile ${updatedUser.name} updated successfully`);
	return { email: existingUser.email, updatedProfile };
};
