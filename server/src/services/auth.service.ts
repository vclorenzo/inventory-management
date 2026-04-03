import logger from '#config/logger.ts';
import { PrismaClient, Products } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const hashPassword = async (password: string) => {
	try {
		return await bcrypt.hash(password, 10);
	} catch (error) {
		logger.error(`Error hashing the password ${error}`);
		throw new Error('Error hashing');
	}
};

export const comparePassword = async (password: string, hash: string) => {
	try {
		return await bcrypt.compare(password, hash);
	} catch (error) {
		logger.error(`Error comparing passwords: ${error}`);
		throw new Error('Error comparing passwords');
	}
};

export const createUser = async ({
	name,
	email,
	password,
	role = 'user',
}: {
	name: string;
	email: string;
	password: string;
	role: string;
}) => {
	try {
		const existingUser = await prisma.users.findUnique({
			where: { email },
		});

		if (existingUser) {
			throw new Error('User with this email already exists');
		}
		const password_hash = await hashPassword(password);
		const newUser = await prisma.users.create({
			data: {
				email,
				name,
				password: password_hash,
				role,
			},
			select: {
				name: true,
				email: true,
				role: true,
				created_at: true,
			},
		});
		logger.info(`User ${newUser.email} created successfully`);
		return newUser;
	} catch (error) {
		logger.error(`Error creating the user: ${error}`);
		throw error;
	}
};
