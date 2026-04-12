import logger from "#config/logger.ts";
import { AppError } from "#error/AppError.ts";
import { PrismaClient, Users } from "@prisma/client";

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
      prisma.users.count(),
      prisma.users.findMany({
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { users, totalCount };
  } catch (error) {
    logger.error("Failed to load users", { error });
    throw error;
  }
};

export const getUserById = async (id: string) => {
  try {
    return await prisma.users.findUnique({
      where: {
        userId: id,
      },
      select: {
        userId: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });
  } catch (error) {
    logger.error(`Error getting user by id ${id}:`, error);
    throw error;
  }
};

export const updateUser = async (id: string, data: Partial<Users>) => {
  const existingUser = await getUserById(id);
  if (!existingUser) {
    throw new AppError("User not found");
  }
  const updatedUser = await prisma.users.update({
    where: { userId: id },
    data: { name: data.name },
  });
  logger.info(`User ${updatedUser.email} updated successfully`);
  return updatedUser;
};

export const deleteUser = async (id: string) => {
  const existingUser = await getUserById(id);
  if (!existingUser) {
    throw new AppError("User not found");
  }
  const deletedUser = await prisma.users.delete({
    where: { userId: id },
  });
  logger.info(`User ${deletedUser.email} deleted successfully`);
  return deletedUser;
};
