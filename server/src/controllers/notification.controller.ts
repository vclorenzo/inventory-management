import { AppError } from "#error/AppError.ts";
import * as notificationService from "#services/notification.service.ts";
import { Request, Response } from "express";

const getUserId = (req: Request): string | undefined =>
  (req.user as { id?: string })?.id;

export const getNotifications = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const notifications =
      await notificationService.getNotificationsByUserId(userId);
    res.status(200).json({
      message: "Notifications retrieved successfully",
      data: notifications,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Error retrieving notifications" });
  }
};

export const markNotificationRead = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const { id } = req.params;
    const notification = await notificationService.markNotificationRead(
      id,
      userId,
    );
    if (!notification) {
      res.status(404).json({ message: "Notification does not exist" });
      return;
    }

    res.status(200).json({
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Error updating notification" });
  }
};

export const markAllNotificationsRead = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const notifications =
      await notificationService.markAllNotificationsRead(userId);
    res.status(200).json({
      message: "Notifications marked as read",
      data: notifications,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Error updating notifications" });
  }
};
