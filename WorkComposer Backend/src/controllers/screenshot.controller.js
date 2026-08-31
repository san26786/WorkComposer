import cloudinary from "../config/cloudinary.js";
import Screenshot from "../models/screenshot.model.js";
import fs from "fs";
import archiver from "archiver";
import axios from "axios";
import { getAvatarUrl } from "../utils/avatar.js";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import { getUserTimezone, getDateRangeUTC } from "../utils/timezone.js";

// UPLOAD SCREENSHOTS
export const uploadScreenshot = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "workcomposer/screenshots",
    });

    const screenshot = await Screenshot.create({
      user: req.user._id,

      project: req.body.project || null,
      task: req.body.task || null,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      appName: req.body.appName || "",
      windowTitle: req.body.windowTitle || "",
      keyPresses: Number(req.body.keyPresses || 0),
      mouseClicks: Number(req.body.mouseClicks || 0),
      mouseMoves: Number(req.body.mouseMoves || 0),
      activityScore: Number(req.body.activityScore || 0),
      capturedAt: new Date(),
    });

    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      screenshot,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

// GET SCREENSHOTS
export const getScreenshots = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const currentUser = await User.findById(req.user._id).select(
      "roleRef reportTimezone organization",
    );

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const role = await Role.findById(currentUser.roleRef).select(
      "screenshotAccess",
    );

    const screenshotAccess = role?.screenshotAccess || "none";

    if (screenshotAccess === "none") {
      return res.status(403).json({
        message: "Permission denied",
      });
    }

    const timezone = getUserTimezone(currentUser);

    let query = {};

    let allowedUserIds = null;

    if (screenshotAccess === "own") {
      allowedUserIds = [req.user._id];
    }

    if (screenshotAccess === "managed") {
      const managedUsers = await User.find({
        organization: currentUser.organization,
        $or: [{ _id: currentUser._id }, { manager: currentUser._id }],
      }).select("_id");

      allowedUserIds = managedUsers.map((user) => user._id);
    }

    if (allowedUserIds) {
      query.user = {
        $in: allowedUserIds,
      };
    }

    if (startDate && endDate) {
      const { start, end } = getDateRangeUTC(startDate, endDate, timezone);

      query.capturedAt = {
        $gte: start,
        $lte: end,
      };
    }

    const screenshots = await Screenshot.find(query)
      .populate("user", "firstName lastName email team avatar")
      .sort({ capturedAt: -1 });

    const formattedScreenshots = screenshots.map((shot) => ({
      ...shot.toObject(),
      user: shot.user
        ? {
            ...shot.user.toObject(),
            avatar: getAvatarUrl(shot.user.avatar),
          }
        : null,
    }));

    res.status(200).json({
      success: true,
      screenshots: formattedScreenshots,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// GET USER SCREENSHOT
export const getUserScreenshots = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    const currentUser = await User.findById(req.user._id).select(
      "roleRef reportTimezone",
    );

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const role = await Role.findById(currentUser.roleRef).select(
      "screenshotAccess",
    );

    const screenshotAccess = role?.screenshotAccess || "none";

    if (screenshotAccess === "none") {
      return res.status(403).json({
        message: "Permission denied",
      });
    }

    if (screenshotAccess === "managed") {
      const targetUser = await User.findById(userId).select("manager");

      if (!targetUser) {
        return res.status(403).json({
          message: "Permission denied",
        });
      }

      const isSelf = targetUser._id.toString() === req.user._id.toString();

      const isManagedUser =
        targetUser.manager?.toString() === req.user._id.toString();

      if (!isSelf && !isManagedUser) {
        return res.status(403).json({
          message: "Permission denied",
        });
      }
    }

    if (screenshotAccess === "own" && userId !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Permission denied",
      });
    }

    let query = {
      user: userId,
    };

    if (date) {
      const timezone = getUserTimezone(currentUser);

      const { start, end } = getDateRangeUTC(date, date, timezone);

      query.capturedAt = {
        $gte: start,
        $lt: end,
      };
    }

    const screenshots = await Screenshot.find(query)
      .sort({ capturedAt: -1 })
      .limit(3);

    res.status(200).json({
      success: true,
      screenshots,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// EXPORT ZIP
export const exportScreenshotsZip = async (req, res) => {
  try {
    const { startDate, endDate, userIds } = req.query;

    const currentUser = await User.findById(req.user._id).select(
      "roleRef reportTimezone",
    );

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const role = await Role.findById(currentUser.roleRef).select(
      "screenshotAccess",
    );

    const screenshotAccess = role?.screenshotAccess || "none";

    if (screenshotAccess === "none") {
      return res.status(403).json({
        message: "Permission denied",
      });
    }

    const timezone = getUserTimezone(currentUser);

    const query = {};

    /*
     * Determine which users the requester is allowed
     * to export screenshots for.
     */
    let allowedUserIds = null;

    if (screenshotAccess === "own") {
      allowedUserIds = [req.user._id];
    }

    if (screenshotAccess === "managed") {
      const managedUsers = await User.find({
        manager: req.user._id,
      }).select("_id");

      allowedUserIds = managedUsers.map((user) => user._id);
    }

    /*
     * Apply explicitly selected users.
     */
    if (userIds) {
      const requestedUserIds = userIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      if (requestedUserIds.length > 0) {
        if (allowedUserIds) {
          const allowedSet = new Set(allowedUserIds.map((id) => id.toString()));

          const permittedSelectedIds = requestedUserIds.filter((id) =>
            allowedSet.has(id),
          );

          if (permittedSelectedIds.length === 0) {
            return res.status(403).json({
              message:
                "You do not have permission to export screenshots for the selected users.",
            });
          }

          query.user = {
            $in: permittedSelectedIds,
          };
        } else {
          /*
           * User has broader screenshot access.
           * Still restrict the export to the selected users.
           */
          query.user = {
            $in: requestedUserIds,
          };
        }
      }
    } else if (allowedUserIds) {
      /*
       * No explicit users selected:
       * restrict own/managed access to permitted users.
       */
      query.user = {
        $in: allowedUserIds,
      };
    }

    if (startDate && endDate) {
      const { start, end } = getDateRangeUTC(startDate, endDate, timezone);

      query.capturedAt = {
        $gte: start,
        $lte: end,
      };
    }

    const screenshots = await Screenshot.find(query)
      .populate("user")
      .sort({ capturedAt: 1 });

    res.setHeader("Content-Type", "application/zip");

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=screenshots.zip",
    );

    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    archive.on("error", (err) => {
      console.error("ARCHIVE ERROR:", err);

      if (!res.headersSent) {
        res.status(500).end();
      } else {
        res.end();
      }
    });

    archive.pipe(res);

    for (const shot of screenshots) {
      try {
        if (!shot.imageUrl) {
          continue;
        }

        const response = await axios.get(shot.imageUrl, {
          responseType: "stream",
        });

        const firstName = shot.user?.firstName || "Unknown";
        const lastName = shot.user?.lastName || "User";

        const fileName = `${firstName}_${lastName}/${shot._id}.png`;

        archive.append(response.data, {
          name: fileName,
        });
      } catch (err) {
        if (err.response?.status === 404) {
          console.warn("SCREENSHOT NO LONGER EXISTS:", shot._id);
        } else {
          console.error(
            "FAILED SCREENSHOT:",
            shot._id,
            err.response?.status,
            err.message,
          );
        }
      }
    }

    await archive.finalize();
  } catch (err) {
    console.error("SCREENSHOT ZIP EXPORT ERROR:", err);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Export failed",
      });
    }

    res.end();
  }
};
