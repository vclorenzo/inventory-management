import logger from "#config/logger.ts";
import { sendWelcomeEmail } from "#services/email.service.ts";
import * as userService from "#services/user.service.ts";
import * as authService from "#src/services/auth.service.ts";
import { CreateSigninInput, CreateSignupInput } from "#types/user.types.ts";
import { cookies } from "#utils/cookies.ts";
import { sanitizeSigninInput, sanitizeSignupInput } from "#utils/sanitize.ts";
import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import validator from "validator";

const prisma = new PrismaClient();

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sanitized = sanitizeSignupInput(req.body);

    const dto: CreateSignupInput = {
      name: sanitized.name,
      email: sanitized.email,
      password: sanitized.password,
      role: sanitized.role,
    };
    const { newUser, token } = await authService.createUser(dto);

    cookies.set(res, "token", token);
    logger.info(`User registered successfully: ${newUser.email}`);

    // Fire-and-forget: a mail failure must not fail or delay registration.
    // sendEmail already logs the underlying error.
    // The name is stored HTML-escaped by the sanitizer; unescape it so the
    // template (which escapes on render) doesn't double-escape.
    sendWelcomeEmail(newUser.email, validator.unescape(newUser.name)).catch(
      () => {},
    );

    return res.status(201).json({
      message: "User registered",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sanitized = sanitizeSigninInput(req.body);
    const dto: CreateSigninInput = {
      email: sanitized.email,
      password: sanitized.password,
    };

    const { user, token } = await authService.authenticateUser(dto);

    cookies.set(res, "token", token);
    logger.info(`User signed in successfully: ${user.email}`);
    return res.status(200).json({
      message: "Signed in successfully",
      data: user,
    });
  } catch (error: any) {
    next(error);
  }
};

export const signout = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    cookies.clear(res, "token");
    logger.info("User signed out successfully");
    return res.status(200).json({ message: "Signed out successfully" });
  } catch (error) {
    logger.error("Signout error", error);
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = (req.user as any)?.id as string;

    if (!id) {
      return res.status(401).json({
        error: "Authentication required",
        message: "Invalid session",
      });
    }

    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req.user as { id?: string })?.id;
    if (!userId) {
      return res.status(401).json({
        error: "Authentication required",
        message: "Invalid session",
      });
    }
    const { oldPassword, newPassword } = req.body as {
      oldPassword: string;
      newPassword: string;
    };
    await authService.changePassword({ userId, oldPassword, newPassword });
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};
