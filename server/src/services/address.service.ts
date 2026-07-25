import logger from "#config/logger.ts";
import { AppError } from "#error/AppError.ts";
import type {
  CreateAddressInput,
  UpdateAddressInput,
} from "#validations/profile.validations.ts";
import { PrismaClient } from "@prisma/client";
import * as userService from "./user.service";

const prisma = new PrismaClient();

const getProfileIdForUser = async (userId: string) => {
  const existingUser = await userService.getUserById(userId);
  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { profileId: true },
  });

  if (!profile) {
    throw new AppError("Profile not found", 404);
  }

  return profile.profileId;
};

const clearOtherDefaults = async (
  profileId: string,
  exceptAddressId?: string,
) => {
  await prisma.address.updateMany({
    where: {
      profileId,
      isDefault: true,
      ...(exceptAddressId ? { addressId: { not: exceptAddressId } } : {}),
    },
    data: { isDefault: false },
  });
};

const addressDataFromInput = (data: CreateAddressInput | UpdateAddressInput) => ({
  ...(data.label !== undefined ? { label: data.label } : {}),
  ...(data.streetName !== undefined ? { streetName: data.streetName } : {}),
  ...(data.postalCode !== undefined ? { postalCode: data.postalCode } : {}),
  ...(data.region !== undefined ? { region: data.region } : {}),
  ...(data.province !== undefined ? { province: data.province } : {}),
  ...(data.city !== undefined ? { city: data.city } : {}),
  ...(data.barangay !== undefined ? { barangay: data.barangay } : {}),
  ...(data.regionCode !== undefined ? { regionCode: data.regionCode } : {}),
  ...(data.provinceCode !== undefined
    ? { provinceCode: data.provinceCode }
    : {}),
  ...(data.cityCode !== undefined ? { cityCode: data.cityCode } : {}),
  ...(data.barangayCode !== undefined
    ? { barangayCode: data.barangayCode }
    : {}),
  ...(data.isDefault !== undefined ? { isDefault: data.isDefault } : {}),
});

export const listAddresses = async (userId: string) => {
  const profileId = await getProfileIdForUser(userId);
  return prisma.address.findMany({
    where: { profileId },
    orderBy: [{ isDefault: "desc" }, { created_at: "asc" }],
  });
};

export const createAddress = async (
  userId: string,
  data: CreateAddressInput,
) => {
  const profileId = await getProfileIdForUser(userId);
  const existingCount = await prisma.address.count({ where: { profileId } });
  const isDefault = data.isDefault ?? existingCount === 0;

  if (isDefault) {
    await clearOtherDefaults(profileId);
  }

  const address = await prisma.address.create({
    data: {
      profileId,
      label: data.label,
      streetName: data.streetName ?? null,
      postalCode: data.postalCode ?? null,
      region: data.region ?? null,
      province: data.province ?? null,
      city: data.city ?? null,
      barangay: data.barangay ?? null,
      regionCode: data.regionCode ?? null,
      provinceCode: data.provinceCode ?? null,
      cityCode: data.cityCode ?? null,
      barangayCode: data.barangayCode ?? null,
      isDefault,
    },
  });

  logger.info(`Address ${address.addressId} created for user ${userId}`);
  return address;
};

export const updateAddress = async (
  userId: string,
  addressId: string,
  data: UpdateAddressInput,
) => {
  const profileId = await getProfileIdForUser(userId);
  const existing = await prisma.address.findFirst({
    where: { addressId, profileId },
  });

  if (!existing) {
    throw new AppError("Address not found", 404);
  }

  if (data.isDefault === true) {
    await clearOtherDefaults(profileId, addressId);
  }

  if (data.isDefault === false && existing.isDefault) {
    throw new AppError(
      "Set another address as default before unsetting this one",
      400,
    );
  }

  const address = await prisma.address.update({
    where: { addressId },
    data: addressDataFromInput(data),
  });

  logger.info(`Address ${addressId} updated for user ${userId}`);
  return address;
};

export const deleteAddress = async (userId: string, addressId: string) => {
  const profileId = await getProfileIdForUser(userId);
  const existing = await prisma.address.findFirst({
    where: { addressId, profileId },
  });

  if (!existing) {
    throw new AppError("Address not found", 404);
  }

  await prisma.address.delete({ where: { addressId } });

  if (existing.isDefault) {
    const nextDefault = await prisma.address.findFirst({
      where: { profileId },
      orderBy: { created_at: "asc" },
    });
    if (nextDefault) {
      await prisma.address.update({
        where: { addressId: nextDefault.addressId },
        data: { isDefault: true },
      });
    }
  }

  logger.info(`Address ${addressId} deleted for user ${userId}`);
  return { addressId };
};
