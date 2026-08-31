import express from "express";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  updateOrganizationNotifications,
} from "../controllers/notification.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getNotifications);

router.get("/unread-count", protect, getUnreadNotificationCount);

router.patch("/:id/read", protect, markNotificationAsRead);

router.patch("/read-all", protect, markAllNotificationsAsRead);

router.patch("/notifications", protect, updateOrganizationNotifications);

export default router;
