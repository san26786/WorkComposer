import Notification from "../models/notification.model.js";
import Organization from "../models/organization.model.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(
            Math.max(Number(req.query.limit) || 20, 1),
            50
        );

        const skip = (page - 1) * limit;

        const [notifications, total, unreadCount] =
            await Promise.all([
                Notification.find({
                    recipient: userId,
                })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),

                Notification.countDocuments({
                    recipient: userId,
                }),

                Notification.countDocuments({
                    recipient: userId,
                    read: false,
                }),
            ]);

        res.json({
            notifications,
            unreadCount,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET NOTIFICATIONS ERROR:", error);

        res.status(500).json({
            message: "Failed to load notifications.",
        });
    }
};

export const getUnreadNotificationCount = async (req, res) => {
    try {
        const unreadCount = await Notification.countDocuments({
            recipient: req.user._id,
            read: false,
        });

        res.json({
            unreadCount,
        });
    } catch (error) {
        console.error(
            "GET UNREAD NOTIFICATION COUNT ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to load unread notification count.",
        });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const notification =
            await Notification.findOneAndUpdate(
                {
                    _id: req.params.id,
                    recipient: req.user._id,
                },
                {
                    $set: {
                        read: true,
                        readAt: new Date(),
                    },
                },
                {
                    new: true,
                }
            );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found.",
            });
        }

        res.json(notification);
    } catch (error) {
        console.error(
            "MARK NOTIFICATION READ ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to mark notification as read.",
        });
    }
};

export const markAllNotificationsAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            {
                recipient: req.user._id,
                read: false,
            },
            {
                $set: {
                    read: true,
                    readAt: new Date(),
                },
            }
        );

        res.json({
            message: "All notifications marked as read.",
        });
    } catch (error) {
        console.error(
            "MARK ALL NOTIFICATIONS READ ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to mark notifications as read.",
        });
    }
};

export const updateOrganizationNotifications = async (req, res) => {
  try {
    const { notifications } = req.body;

    if (!notifications || typeof notifications !== "object") {
      return res.status(400).json({
        message: "Invalid notification settings.",
      });
    }

    const allowedKeys = [
      "shiftStarted",
      "shiftEndingSoon",
      "breakStarted",
      "breakEnded",
      "dailyTargetReached",
      "overtimeStarted",
    ];

    const update = {};

    for (const key of allowedKeys) {
      if (typeof notifications[key] === "boolean") {
        update[`notifications.${key}`] = notifications[key];
      }
    }

    const organization = await Organization.findByIdAndUpdate(
      req.user.organization,
      {
        $set: update,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("notifications");

    return res.status(200).json({
      notifications: organization.notifications,
    });
  } catch (error) {
    console.error(
      "UPDATE ORGANIZATION NOTIFICATIONS ERROR:",
      error,
    );

    return res.status(500).json({
      message: "Failed to update notification settings.",
    });
  }
};