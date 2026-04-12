import logger from '#config/logger.ts';
import { AppError } from '#error/AppError.ts';
import { jwtToken } from '#src/utils/jwt.ts';
import { PrismaClient, Products } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const hashPassword = async (password: string) => {
	try {
		return await bcrypt.hash(password, 10);
	} catch (error) {
		logger.error(`Error hashing the password ${error}`);
		throw new AppError('Error hashing');
	}
};

export const comparePassword = async (password: string, hash: string) => {
	try {
		return await bcrypt.compare(password, hash);
	} catch (error) {
		logger.error(`Error comparing passwords: ${error}`);
		throw new AppError('Error comparing passwords');
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
	const existingUser = await prisma.users.findUnique({
		where: { email },
	});

	if (existingUser) {
		logger.error(`Email already exists`);
		throw new AppError('Email already exists', 409);
	}
	const password_hash = await hashPassword(password);
	const created = await prisma.users.create({
		data: {
			email,
			name,
			password: password_hash,
			role,
			profile: {
				create: {},
			},
		},
		select: {
			userId: true,
			name: true,
			email: true,
			role: true,
			created_at: true,
			profile: {
				select: { profileId: true },
			},
		},
	});
	const newUser = {
		userId: created.userId,
		name: created.name,
		email: created.email,
		role: created.role,
		created_at: created.created_at,
		profileId: created.profile!.profileId,
	};
	logger.info(`User ${newUser.email} created successfully`);
	const token = jwtToken.sign({
		id: newUser.userId,
		email: newUser.email,
		role: newUser.role,
	});
	return { newUser, token };
};

export const authenticateUser = async ({
	email,
	password,
}: {
	email: string;
	password: string;
}) => {
	const user = await prisma.users.findFirst({
		where: {
			email,
		},
		select: {
			userId: true,
			name: true,
			email: true,
			password: true,
			role: true,
		},
	});
	if (!user) {
		logger.error(`Invalid credentials`);
		throw new AppError('Invalid credentials', 401);
	}

	const isMatch = await comparePassword(password, user.password);
	const token = jwtToken.sign({
		id: user.userId,
		email: user.email,
		role: user.role,
	});

	if (!isMatch) {
		logger.error(`Invalid credentials`);
		throw new AppError('Invalid credentials', 401);
	}
	return {
		user: {
			name: user.name,
			email: user.email,
			role: user.role,
		},
		token,
	};
};
