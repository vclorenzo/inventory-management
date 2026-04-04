import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as userService from '../services/user.service';

const prisma = new PrismaClient();

export const getUserById = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const user = await userService.getUserById(id);
		if (!user) {
			res.status(404).json({ message: 'User not found' });
		} else {
			res.status(200).json({
				message: 'User retrieved successfully',
				user,
			});
		}
	} catch (error: any) {
		res.status(500).json(error.message);
	}
};

export const getAllUsers = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const page = Math.max(Number(req.query.page) || 1, 1);
		const limit = Math.max(Number(req.query.limit) || 10, 1);
		const { users, totalCount } = await userService.getAllUsers({
			page,
			limit,
		});
		const totalPages = Math.max(Math.ceil(totalCount / limit), 1);
		res.status(200).json({
			message: 'Successfully retrieved users',
			users,
			page,
			limit,
			totalPages,
			totalCount,
		});
	} catch (error: any) {
		res.status(500).json(error.message);
	}
};

export const updateUser = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const data = req.body;
		const updateUser = await userService.updateUser(id, data);
		res.status(200).json(updateUser);
	} catch (error: any) {
		res.status(500).json(error.message);
	}
};

export const deleteUser = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const deletedUser = await userService.deleteUser(id);
		res.status(200).json({
			message: `User ${deletedUser.email} deleted successfully`,
		});
	} catch (error: any) {
		res.status(500).json(error.message);
	}
};
