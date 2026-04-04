import { PrismaClient, Users } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUsers = async ({
	page = 1,
	limit = 10,
}: {
	page?: number;
	limit?: number;
}) => {
	try {
		const [totalCount, users] = await prisma.$transaction([
			prisma.products.count(),
			prisma.products.findMany({
				skip: (page - 1) * limit,
				take: limit,
			}),
		]);
		return { users, totalCount };
	} catch (error) {
		throw error;
	}
};

export const getUserById = async (id: string) => {
	try {
		return await prisma.users.findUnique({
			where: {
				userId: id,
			},
		});
	} catch (error) {
		throw error;
	}
};

export const updateUser = async (id: string, data: Partial<Users>) => {
	try {
		const existingUser = await getUserById(id);
		if (!existingUser) {
			throw new Error('User not found');
		}
		return await prisma.users.update({
			where: { userId: id },
			data: { name: data.name },
		});
	} catch (error) {
		throw error;
	}
};

export const deleteUser = async (id: string) => {
	try {
		const existingUser = await getUserById(id);
		if (!existingUser) {
			throw new Error('User not found');
		}
		return await prisma.users.delete({
			where: { userId: id },
		});
	} catch (error) {
		throw error;
	}
};
