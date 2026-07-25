import logger from "#config/logger.ts";
import { PrismaClient } from "@prisma/client";
import * as userService from "./user.service";
import { AppError } from "#error/AppError.ts";
import type { UpdateProfileInput } from "#validations/profile.validations.ts";

const prisma = new PrismaClient();

export const getProfileById = async (id: string) => {
  const existingUser = await userService.getUserById(id);
  if (!existingUser) {
    throw new AppError("User not found");
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
          gender: true,
          contactNumber: true,
          birthday: true,
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

export const updateProfile = async (id: string, data: UpdateProfileInput) => {
  const existingUser = await userService.getUserById(id);
  if (!existingUser) {
    throw new AppError("User not found");
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
      ...(data.region !== undefined ? { region: data.region } : {}),
      ...(data.province !== undefined ? { province: data.province } : {}),
      ...(data.city !== undefined ? { city: data.city } : {}),
      ...(data.barangay !== undefined ? { barangay: data.barangay } : {}),
    },
  });
  logger.info(`Profile ${updatedUser.name} updated successfully`);
  return { email: existingUser.email, updatedProfile };
};
