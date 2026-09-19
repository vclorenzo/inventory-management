import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "#controllers/notification.controller.ts";
import { authenticateToken } from "#middleware/auth.middleware.ts";
import { Router } from "express";

const router = Router();

router.use(authenticateToken);

router.get("/", getNotifications);
router.patch("/read-all", markAllNotificationsRead);
router.patch("/:id/read", markNotificationRead);

export default router;
