import logger from "#config/logger.ts";
import { PrismaClient } from "@prisma/client";
import * as userService from "./user.service";
import { AppError } from "#error/AppError.ts";
import type { UpdateProfileInput } from "#validations/profile.validations.ts";

const prisma = new PrismaClient();

export const getProfileById = async (id: string) => {
  const existingUser = await userService.getUserById(id);
  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  const user = await prisma.users.findUnique({
    where: { userId: id },
    select: {
      name: true,
      email: true,
      profile: {
        select: {
          gender: true,
          contactNumber: true,
          birthday: true,
          addresses: {
            orderBy: [{ isDefault: "desc" }, { created_at: "asc" }],
          },
        },
      },
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    name: user.name,
    email: user.email,
    gender: user.profile?.gender ?? null,
    contactNumber: user.profile?.contactNumber ?? null,
    birthday: user.profile?.birthday ?? null,
    addresses: user.profile?.addresses ?? [],
  };
};

export const updateProfile = async (id: string, data: UpdateProfileInput) => {
  const existingUser = await userService.getUserById(id);
  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  let updatedUser = existingUser;
  if (data.name !== undefined) {
    updatedUser = await userService.updateUser(id, { name: data.name });
  }

  const updatedProfile = await prisma.profile.update({
    where: { userId: id },
    data: {
      ...(data.gender !== undefined ? { gender: data.gender } : {}),
      ...(data.contactNumber !== undefined
        ? { contactNumber: data.contactNumber }
        : {}),
      ...(data.birthday !== undefined ? { birthday: data.birthday } : {}),
    },
    include: {
      addresses: {
        orderBy: [{ isDefault: "desc" }, { created_at: "asc" }],
      },
    },
  });

  logger.info(`Profile ${updatedUser.name} updated successfully`);
  return {
    email: existingUser.email,
    name: updatedUser.name,
    updatedProfile,
  };
};
