// import logger from '#config/logger.ts';
// import { PrismaClient, Users } from '@prisma/client';

// const prisma = new PrismaClient();

// export const getProfileById = async (id: string) => {
// 	try {
// 		return await prisma.profile.findUnique({
// 			where: {
// 				userId: id,
// 			},
// 		});
// 	} catch (error) {
// 		logger.error('Error getting user by id ${id}:', error);
// 		throw error;
// 	}
// };

// export const updateProfile = async (id: string, data: Partial<Profiles>) => {
// 	try {
// 		const existingProfile = await getProfileById(id);
// 		if (!existingProfile) {
// 			throw new Error('Profile not found');
// 		}
// 		const updatedProfile = await prisma.users.update({
// 			where: { userId: id },
// 			data: { name: data.name },
// 		});
// 		logger.info(`Profile ${updatedProfile.email} updated successfully`);
// 		return updatedProfile;
// 	} catch (error) {
// 		logger.error(`Error updating user ${id}:`, error);
// 		throw error;
// 	}
// };

// export const deleteProfile = async (id: string) => {
// 	try {
// 		const existingProfile = await getProfileById(id);
// 		if (!existingProfile) {
// 			throw new Error('Profile not found');
// 		}
// 		const deletedProfile = await prisma.users.delete({
// 			where: { userId: id },
// 		});
// 		logger.info(`Profile ${deletedProfile.email} deleted successfully`);
// 		return deletedProfile;
// 	} catch (error) {
// 		logger.error(`Error deleting user ${id}:`, error);
// 		throw error;
// 	}
// };
