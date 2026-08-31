import User from "../models/user.model.js";
import Session from "../models/session.model.js";
import Activity from "../models/activity.model.js";
import Screenshot from "../models/screenshot.model.js";
import ProjectTracking from "../models/projectTracking.model.js";

import { getUserTimezone, getDateRangeUTC } from "../utils/timezone.js";

const formatTime = (seconds = 0) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${hours}h ${minutes}m`;
};

const formatClockTime = (date, timezone) => {
  if (!date) return null;

  return new Date(date).toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const generateDailyWorkReport = async (userId, reportDate = null) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const timezone = getUserTimezone(user);

  const today = reportDate
    ? reportDate
    : new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());

  const { start, end } = getDateRangeUTC(today, today, timezone);

  /*
   * -----------------------------------------
   * SESSIONS
   * -----------------------------------------
   */

  const sessions = await Session.find({
    userId,
    date: today,
  }).sort({
    startTime: 1,
  });

  const workSessions = sessions.filter((session) => session.type === "work");

  const breakSessions = sessions.filter((session) => session.type === "break");

  const workSeconds = workSessions.reduce(
    (sum, session) => sum + (session.duration || 0),
    0,
  );

  const breakSeconds = breakSessions.reduce(
    (sum, session) => sum + (session.duration || 0),
    0,
  );

  const firstSession = sessions[0];

  const lastSession =
    sessions.length > 0 ? sessions[sessions.length - 1] : null;

  /*
   * -----------------------------------------
   * ACTIVITY
   * -----------------------------------------
   */

  const activities = await Activity.find({
    user: userId,
    date: today,
  });

  const keyPresses = activities.reduce(
    (sum, activity) => sum + (activity.keyPresses || 0),
    0,
  );

  const mouseClicks = activities.reduce(
    (sum, activity) => sum + (activity.mouseClicks || 0),
    0,
  );

  const mouseMoves = activities.reduce(
    (sum, activity) => sum + (activity.mouseMoves || 0),
    0,
  );

  /*
   * -----------------------------------------
   * SCREENSHOTS
   * -----------------------------------------
   */

  const screenshots = await Screenshot.find({
    user: userId,
    capturedAt: {
      $gte: start,
      $lte: end,
    },
  });

  const screenshotCount = screenshots.length;

  const activityScore =
    screenshotCount > 0
      ? Math.round(
          screenshots.reduce(
            (sum, screenshot) => sum + (screenshot.activityScore || 0),
            0,
          ) / screenshotCount,
        )
      : 0;

  /*
   * -----------------------------------------
   * PROJECT / TASK TRACKING
   * -----------------------------------------
   */

  const trackingRecords = await ProjectTracking.find({
    user: userId,
    date: today,
  })
    .populate("project", "name")
    .populate("task", "title");

  const projectMap = new Map();

  for (const record of trackingRecords) {
    const projectId = record.project?._id?.toString() || "unknown";

    const taskId = record.task?._id?.toString() || "no-task";

    const key = `${projectId}-${taskId}`;

    if (!projectMap.has(key)) {
      projectMap.set(key, {
        project: record.project
          ? {
              _id: record.project._id,
              name: record.project.name,
            }
          : null,

        task: record.task
          ? {
              _id: record.task._id,
              title: record.task.title,
            }
          : null,

        duration: 0,
      });
    }

    projectMap.get(key).duration += record.duration || 0;
  }

  const taskSummary = Array.from(projectMap.values()).map((item) => ({
    ...item,
    time: formatTime(item.duration),
  }));

  /*
   * -----------------------------------------
   * FINAL REPORT
   * -----------------------------------------
   */

  return {
    date: today,

    timezone,

    user: {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
    },

    summary: {
      startTime: formatClockTime(firstSession?.startTime, timezone),

      finishTime: formatClockTime(lastSession?.endTime, timezone),

      workSeconds,
      breakSeconds,

      workTime: formatTime(workSeconds),
      breakTime: formatTime(breakSeconds),

      sessionsCount: sessions.length,
    },

    activity: {
      keyPresses,
      mouseClicks,
      mouseMoves,
      screenshotCount,
      activityScore,
    },

    tasks: taskSummary,

    sessions: sessions.map((session) => ({
      id: session._id,

      type: session.type,

      startTime: formatClockTime(session.startTime, timezone),

      endTime: formatClockTime(session.endTime, timezone),

      duration: session.duration || 0,

      time: formatTime(session.duration || 0),
    })),
  };
};
