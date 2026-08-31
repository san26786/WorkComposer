import cron from "node-cron";

import User from "../models/user.model.js";
import Organization from "../models/organization.model.js";
import TimeTrackingSettings from "../models/timeTrackingSettings.model.js";
import Session from "../models/session.model.js";
import Notification from "../models/notification.model.js";
import resolveTrackingSettings from "../utils/resolveTrackingSettings.js";

import { createNotification } from "./notification.service.js";
import { getUserTimezone, getTodayInTimezone } from "../utils/timezone.js";

const SHIFT_ENDING_WARNING_MINUTES = 15;

const getEffectiveShiftSettings = (user, organizationSettings) => {
  const organizationShift = organizationSettings?.shift || {};

  const userShift = user.shiftSettings || {};

  return {
    enabled: organizationShift.enabled === true,

    autoStartTracking:
      userShift.autoStartTracking ??
      organizationShift.autoStartTracking ??
      false,

    autoStopTracking:
      userShift.autoStopTracking ?? organizationShift.autoStopTracking ?? false,

    stopTrackingDuringBreaks:
      organizationShift.stopTrackingDuringBreaks ?? false,

    schedule: userShift.schedule ?? organizationShift.schedule ?? [],
  };
};

const getTimeParts = (time) => {
  if (!time || typeof time !== "string") {
    return null;
  }

  const [hours, minutes] = time.split(":").map(Number);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return {
    hours,
    minutes,
  };
};

const getMinutesFromTime = (time) => {
  const parts = getTimeParts(time);

  if (!parts) {
    return null;
  }

  return parts.hours * 60 + parts.minutes;
};

const getLocalDateTime = (timezone) => {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const get = (type) => parts.find((part) => part.type === type)?.value;

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: get("weekday"),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
};

const getLocalMinutes = (timezone) => {
  const local = getLocalDateTime(timezone);

  return local.hour * 60 + local.minute;
};

const isSameEventAlreadyCreated = async ({
  userId,
  organizationId,
  type,
  eventKey,
}) => {
  const existing = await Notification.exists({
    recipient: userId,
    organization: organizationId,
    type,
    "metadata.eventKey": eventKey,
  });

  return Boolean(existing);
};

const sendTrackingNotification = async ({
  user,
  organizationId,
  type,
  title,
  message,
  eventKey,
  metadata = {},
  notifications = {},
}) => {
  const preferenceMap = {
    SHIFT_STARTED: "shiftStarted",
    SHIFT_ENDING_SOON: "shiftEndingSoon",
    BREAK_STARTED: "breakStarted",
    BREAK_ENDED: "breakEnded",
    DAILY_TARGET_REACHED: "dailyTargetReached",
    OVERTIME_STARTED: "overtimeStarted",
  };

  const preferenceKey = preferenceMap[type];

  if (preferenceKey && notifications[preferenceKey] === false) {
    return;
  }

  const alreadyCreated = await isSameEventAlreadyCreated({
    userId: user._id,
    organizationId,
    type,
    eventKey,
  });

  if (alreadyCreated) {
    return;
  }

  await createNotification({
    recipientId: user._id,
    organizationId,
    type,
    title,
    message,
    entityType: "tracking",
    metadata: {
      ...metadata,
      eventKey,
    },
  });
};

const getTodayShift = (schedule, timezone) => {
  const today = getTodayInTimezone(timezone);

  const local = getLocalDateTime(timezone);

  const shift = schedule.find(
    (item) => item.day === local.weekday && item.enabled !== false,
  );

  return {
    today,
    shift,
  };
};

const calculateDurationMinutes = (startMinutes, endMinutes) => {
  let duration = endMinutes - startMinutes;

  if (duration < 0) {
    duration += 24 * 60;
  }

  return duration;
};

const calculateExpectedWorkSeconds = (shift) => {
  const startMinutes = getMinutesFromTime(shift.startTime);

  const endMinutes = getMinutesFromTime(shift.endTime);

  if (startMinutes === null || endMinutes === null) {
    return 0;
  }

  const shiftMinutes = calculateDurationMinutes(startMinutes, endMinutes);

  const breakMinutes = (shift.breaks || []).reduce((total, breakItem) => {
    const breakStart = getMinutesFromTime(breakItem.startTime);

    const breakEnd = getMinutesFromTime(breakItem.endTime);

    if (breakStart === null || breakEnd === null) {
      return total;
    }

    return total + calculateDurationMinutes(breakStart, breakEnd);
  }, 0);

  return Math.max(0, shiftMinutes - breakMinutes) * 60;
};

const getWorkedSecondsToday = async (userId, timezone) => {
  const today = getTodayInTimezone(timezone);

  const sessions = await Session.find({
    userId,
    type: "work",
    date: today,
  }).lean();

  return sessions.reduce(
    (total, session) => total + Number(session.duration || 0),
    0,
  );
};

const processUserTrackingNotifications = async (user, organizationSettings) => {
  if (!user.organization) {
    return;
  }

  const organization = {
    ...organizationSettings,
  };

  const settings = resolveTrackingSettings(organization, user);

  const notifications = settings.notifications || {};

  if (!settings.shift?.enabled || !Array.isArray(settings.shift?.schedule)) {
    return;
  }

  const timezone = getUserTimezone(user);

  const { today, shift } = getTodayShift(settings.shift.schedule, timezone);

  if (!shift) {
    return;
  }

  const localMinutes = getLocalMinutes(timezone);

  const shiftStartMinutes = getMinutesFromTime(shift.startTime);

  const shiftEndMinutes = getMinutesFromTime(shift.endTime);

  if (shiftStartMinutes === null || shiftEndMinutes === null) {
    return;
  }

  const shiftDurationMinutes = calculateDurationMinutes(
    shiftStartMinutes,
    shiftEndMinutes,
  );

  /*
   * SHIFT STARTED
   */
  if (localMinutes === shiftStartMinutes) {
    await sendTrackingNotification({
      user,
      organizationId: user.organization,
      notifications,
      type: "SHIFT_STARTED",
      title: "Shift started",
      message: "Your scheduled shift has started.",
      eventKey: `shift-started:${today}`,
      metadata: {
        date: today,
        startTime: shift.startTime,
        endTime: shift.endTime,
      },
    });
  }

  /*
   * SHIFT ENDING SOON
   *
   * Only send when the shift has a
   * meaningful duration.
   */
  if (shiftDurationMinutes >= SHIFT_ENDING_WARNING_MINUTES) {
    const minutesUntilEnd = calculateDurationMinutes(
      localMinutes,
      shiftEndMinutes,
    );

    /*
     * For normal shifts, the duration
     * calculation above is straightforward.
     *
     * For overnight shifts, only warn when
     * we're actually inside the shift window.
     */
    const isInsideShift =
      shiftStartMinutes < shiftEndMinutes
        ? localMinutes >= shiftStartMinutes && localMinutes < shiftEndMinutes
        : localMinutes >= shiftStartMinutes || localMinutes < shiftEndMinutes;

    if (isInsideShift && minutesUntilEnd === SHIFT_ENDING_WARNING_MINUTES) {
      await sendTrackingNotification({
        user,
        organizationId: user.organization,
        type: "SHIFT_ENDING_SOON",
        title: "Shift ending soon",
        message: `Your scheduled shift ends in ${SHIFT_ENDING_WARNING_MINUTES} minutes.`,
        eventKey: `shift-ending-soon:${today}`,
        metadata: {
          date: today,
          endTime: shift.endTime,
          minutesRemaining: SHIFT_ENDING_WARNING_MINUTES,
        },
      });
    }
  }

  /*
   * BREAK START / END
   */
  for (const breakItem of shift.breaks || []) {
    const breakStart = getMinutesFromTime(breakItem.startTime);

    const breakEnd = getMinutesFromTime(breakItem.endTime);

    if (breakStart === null || breakEnd === null) {
      continue;
    }

    const breakName = breakItem.name?.trim() || "Scheduled break";

    if (localMinutes === breakStart) {
      await sendTrackingNotification({
        user,
        organizationId: user.organization,
        type: "BREAK_STARTED",
        title: "Scheduled break started",
        message: `${breakName} has started.`,
        eventKey: `break-started:${today}:${breakItem.startTime}`,
        metadata: {
          date: today,
          name: breakName,
          startTime: breakItem.startTime,
          endTime: breakItem.endTime,
        },
      });
    }

    if (localMinutes === breakEnd) {
      await sendTrackingNotification({
        user,
        organizationId: user.organization,
        type: "BREAK_ENDED",
        title: "Scheduled break ended",
        message: `${breakName} has ended. Tracking can resume.`,
        eventKey: `break-ended:${today}:${breakItem.endTime}`,
        metadata: {
          date: today,
          name: breakName,
          startTime: breakItem.startTime,
          endTime: breakItem.endTime,
        },
      });
    }
  }

  /*
   * DAILY TARGET
   */
  const expectedWorkSeconds = calculateExpectedWorkSeconds(shift);

  if (expectedWorkSeconds <= 0) {
    return;
  }

  const workedSeconds = await getWorkedSecondsToday(user._id, timezone);

  if (workedSeconds >= expectedWorkSeconds) {
    await sendTrackingNotification({
      user,
      organizationId: user.organization,
      type: "DAILY_TARGET_REACHED",
      title: "Daily target reached",
      message: "You've reached your scheduled work target for today.",
      eventKey: `daily-target-reached:${today}`,
      metadata: {
        date: today,
        workedSeconds,
        expectedWorkSeconds,
      },
    });
  }

  /*
   * OVERTIME
   */
  const isInsideShift =
    shiftStartMinutes < shiftEndMinutes
      ? localMinutes >= shiftStartMinutes && localMinutes < shiftEndMinutes
      : localMinutes >= shiftStartMinutes || localMinutes < shiftEndMinutes;

  const shiftHasEnded =
    shiftStartMinutes < shiftEndMinutes
      ? localMinutes > shiftEndMinutes
      : localMinutes > shiftEndMinutes && localMinutes < shiftStartMinutes;

  if (!isInsideShift && shiftHasEnded) {
    await sendTrackingNotification({
      user,
      organizationId: user.organization,
      type: "OVERTIME_STARTED",
      title: "Overtime started",
      message: "You've exceeded your scheduled working hours.",
      eventKey: `overtime-started:${today}`,
      metadata: {
        date: today,
        scheduledEndTime: shift.endTime,
        workedSeconds,
        expectedWorkSeconds,
      },
    });
  }
};

export const startTrackingNotificationScheduler = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const users = await User.find({
        organization: {
          $ne: null,
        },
      }).lean();

      if (!users.length) {
        return;
      }

      const organizationIds = [
        ...new Set(users.map((user) => user.organization?.toString())),
      ];

      const [organizations, timeTrackingSettings] = await Promise.all([
        Organization.find({
          _id: {
            $in: organizationIds,
          },
        }).lean(),

        TimeTrackingSettings.find({
          organization: {
            $in: organizationIds,
          },
        }).lean(),
      ]);

      const organizationMap = new Map(
        organizations.map((organization) => [
          organization._id.toString(),
          organization,
        ]),
      );

      const timeTrackingSettingsMap = new Map(
        timeTrackingSettings.map((settings) => [
          settings.organization.toString(),
          settings,
        ]),
      );

      for (const user of users) {
        try {
          const organizationId = user.organization?.toString();

          const organization = organizationMap.get(organizationId);

          const timeTrackingSettings =
            timeTrackingSettingsMap.get(organizationId);

          if (!organization || !timeTrackingSettings) {
            continue;
          }

          await processUserTrackingNotifications(user, {
            ...organization,
            ...timeTrackingSettings,
          });
        } catch (error) {
          console.error(
            "TRACKING NOTIFICATION USER ERROR:",
            user._id,
            error.message,
          );
        }
      }
    } catch (error) {
      console.error("TRACKING NOTIFICATION SCHEDULER ERROR:", error);
    }
  });

  console.info("Tracking notification scheduler started.");
};
