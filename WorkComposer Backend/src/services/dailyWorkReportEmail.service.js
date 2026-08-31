import sendEmail from "../utils/sendEmail.js";
import { dailyTrackingReportTemplate } from "../templates/dailyTrackingReportTemplate.js";

export const sendDailyWorkReportEmail = async ({ user, report }) => {
  try {
    if (!user?.email) {
      console.warn("Daily Work Report email skipped: user has no email.");
      return false;
    }

    const html = dailyTrackingReportTemplate({
      user,
      report,
      date: report?.date,
    });

    await sendEmail(
      user.email,
      `Daily Work Report - ${report?.date || ""}`,
      html,
    );

    console.log(`Daily Work Report email sent to ${user.email}`);

    return true;
  } catch (err) {
    // Email failure must NOT prevent Finish Day
    console.error("DAILY WORK REPORT EMAIL ERROR:", err);

    return false;
  }
};
