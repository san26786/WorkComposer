const formatDuration = (seconds = 0) => {
  const safeSeconds = Number(seconds) || 0;

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);

  return `${hours}h ${minutes}m`;
};

const escapeHtml = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const dailyTrackingReportTemplate = ({
  user = {},
  report = {},
  date = "",
}) => {
  const safeUserName =
    escapeHtml(
      `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    ) || "there";

  const safeEmail = escapeHtml(user.email || "");

  const safeDate = escapeHtml(
    report.date || date || "",
  );

  const timezone = escapeHtml(
    report.timezone || "",
  );

  const summary = report.summary || {};
  const activity = report.activity || {};

  const tasks = Array.isArray(report.tasks)
    ? report.tasks
    : [];

  const sessions = Array.isArray(report.sessions)
    ? report.sessions
    : [];

  const activityScore = Math.min(
    100,
    Math.max(
      0,
      Number(activity.activityScore) || 0,
    ),
  );

  const taskRows = tasks.length
    ? tasks
        .map((item) => {
          const taskName = escapeHtml(
            item?.task?.title || "Untitled Task",
          );

          const projectName = escapeHtml(
            item?.project?.name || "No Project",
          );

          const taskTime = escapeHtml(
            item?.time ||
              formatDuration(item?.duration || 0),
          );

          return `
<tr>
  <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;">
    <div style="
      color:#111827;
      font-size:14px;
      font-weight:600;
    ">
      ${taskName}
    </div>

    <div style="
      margin-top:4px;
      color:#9ca3af;
      font-size:12px;
    ">
      ${projectName}
    </div>
  </td>

  <td
    align="right"
    valign="middle"
    style="
      padding:14px 16px;
      border-bottom:1px solid #e5e7eb;
      color:#4f46e5;
      font-size:13px;
      font-weight:700;
      white-space:nowrap;
    "
  >
    ${taskTime}
  </td>
</tr>
`;
        })
        .join("")
    : `
<tr>
  <td
    colspan="2"
    align="center"
    style="
      padding:24px 16px;
      color:#9ca3af;
      font-size:13px;
    "
  >
    No task activity recorded today.
  </td>
</tr>
`;

  const sessionRows = sessions.length
    ? sessions
        .map((session) => {
          const isWork =
            session?.type === "work";

          const type = escapeHtml(
            session?.type || "unknown",
          );

          const startTime = escapeHtml(
            session?.startTime || "--",
          );

          const endTime = escapeHtml(
            session?.endTime || "--",
          );

          const sessionTime = escapeHtml(
            session?.time ||
              formatDuration(session?.duration || 0),
          );

          const dotColor = isWork
            ? "#22c55e"
            : "#f59e0b";

          const typeColor = isWork
            ? "#15803d"
            : "#b45309";

          const typeBackground = isWork
            ? "#f0fdf4"
            : "#fffbeb";

          return `
<tr>
  <td style="
    padding:14px 16px;
    border-bottom:1px solid #e5e7eb;
  ">

    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
    >
      <tr>

        <td width="18" valign="top">
          <div style="
            width:9px;
            height:9px;
            margin-top:5px;
            border-radius:50%;
            background:${dotColor};
          "></div>
        </td>

        <td style="padding-left:8px;">

          <div style="
            color:#111827;
            font-size:13px;
            font-weight:700;
            text-transform:capitalize;
          ">
            ${type}
          </div>

          <div style="
            margin-top:4px;
            color:#6b7280;
            font-size:12px;
          ">
            ${startTime} → ${endTime}
          </div>

        </td>

        <td
          align="right"
          valign="middle"
          style="
            white-space:nowrap;
          "
        >
          <span style="
            display:inline-block;
            padding:5px 8px;
            border-radius:7px;
            background:${typeBackground};
            color:${typeColor};
            font-size:11px;
            font-weight:700;
          ">
            ${sessionTime}
          </span>
        </td>

      </tr>
    </table>

  </td>
</tr>
`;
        })
        .join("")
    : `
<tr>
  <td
    align="center"
    style="
      padding:24px 16px;
      color:#9ca3af;
      font-size:13px;
    "
  >
    No sessions recorded today.
  </td>
</tr>
`;

  return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Daily Work Report</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f3f4f8;
    font-family:
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      Helvetica,
      Arial,
      sans-serif;
    color:#111827;
  "
>

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="
    background:#f3f4f8;
    padding:40px 16px;
  "
>
  <tr>

    <td align="center">

      <!-- Main Container -->
      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="
          max-width:620px;
          background:#ffffff;
          border-radius:20px;
          overflow:hidden;
          border:1px solid #e5e7eb;
          box-shadow:
            0 12px 40px
            rgba(15,23,42,0.08);
        "
      >

        <!-- ========================================= -->
        <!-- HEADER -->
        <!-- ========================================= -->

        <tr>

          <td
            style="
              padding:34px 30px 42px;
              text-align:center;
              background:
                linear-gradient(
                  135deg,
                  #312e81 0%,
                  #4f46e5 50%,
                  #6366f1 100%
                );
            "
          >

            <!-- Logo -->
            <div
              style="
                width:64px;
                height:64px;
                margin:0 auto 18px;
                border-radius:18px;
                background:
                  rgba(255,255,255,0.14);
                border:
                  1px solid
                  rgba(255,255,255,0.25);
                line-height:64px;
                text-align:center;
                font-size:28px;
                color:#ffffff;
                font-weight:700;
              "
            >
              W
            </div>

            <div
              style="
                color:#ffffff;
                font-size:25px;
                font-weight:700;
                letter-spacing:-0.5px;
              "
            >
              WorkComposer
            </div>

            <div
              style="
                margin-top:8px;
                color:
                  rgba(255,255,255,0.78);
                font-size:13px;
              "
            >
              Work smarter. Stay connected.
            </div>

          </td>

        </tr>


        <!-- ========================================= -->
        <!-- CONTENT -->
        <!-- ========================================= -->

        <tr>

          <td
            style="
              padding:42px 38px 36px;
            "
          >

            <!-- Report Badge -->

            <div
              style="
                text-align:center;
                margin-bottom:22px;
              "
            >

              <span
                style="
                  display:inline-block;
                  padding:7px 14px;
                  border-radius:999px;
                  background:#eef2ff;
                  color:#4f46e5;
                  font-size:12px;
                  font-weight:700;
                  letter-spacing:0.4px;
                  text-transform:uppercase;
                "
              >
                Daily Work Report
              </span>

            </div>


            <!-- Heading -->

            <h1
              style="
                margin:0;
                text-align:center;
                color:#111827;
                font-size:30px;
                line-height:1.25;
                letter-spacing:-0.8px;
                font-weight:750;
              "
            >
              Your Work Summary
            </h1>

            <p
              style="
                margin:16px auto 0;
                max-width:480px;
                text-align:center;
                color:#6b7280;
                font-size:15px;
                line-height:1.7;
              "
            >
              Hello
              <strong style="color:#374151;">
                ${safeUserName}
              </strong>,
              here is your work summary for the day.
            </p>


            <!-- Date -->

            <div
              style="
                margin-top:18px;
                text-align:center;
                color:#9ca3af;
                font-size:12px;
              "
            >
              ${safeDate}
              ${
                timezone
                  ? ` · ${timezone}`
                  : ""
              }
            </div>


            <!-- ========================================= -->
            <!-- WORK SUMMARY -->
            <!-- ========================================= -->

            <div
              style="
                margin-top:32px;
                color:#374151;
                font-size:13px;
                font-weight:700;
                text-transform:uppercase;
                letter-spacing:0.5px;
              "
            >
              Work Summary
            </div>


            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="
                margin-top:12px;
                border-radius:16px;
                background:#f8fafc;
                border:1px solid #e5e7eb;
                overflow:hidden;
              "
            >

              <!-- Start -->

              <tr>

                <td
                  width="50%"
                  style="
                    padding:18px 18px 16px;
                    border-bottom:
                      1px solid #e5e7eb;
                    border-right:
                      1px solid #e5e7eb;
                  "
                >

                  <div
                    style="
                      color:#9ca3af;
                      font-size:11px;
                      text-transform:uppercase;
                      letter-spacing:0.4px;
                    "
                  >
                    Start Time
                  </div>

                  <div
                    style="
                      margin-top:5px;
                      color:#111827;
                      font-size:16px;
                      font-weight:700;
                    "
                  >
                    ${escapeHtml(
                      summary.startTime || "--",
                    )}
                  </div>

                </td>


                <!-- Finish -->

                <td
                  width="50%"
                  style="
                    padding:18px 18px 16px;
                    border-bottom:
                      1px solid #e5e7eb;
                  "
                >

                  <div
                    style="
                      color:#9ca3af;
                      font-size:11px;
                      text-transform:uppercase;
                      letter-spacing:0.4px;
                    "
                  >
                    Finish Time
                  </div>

                  <div
                    style="
                      margin-top:5px;
                      color:#111827;
                      font-size:16px;
                      font-weight:700;
                    "
                  >
                    ${escapeHtml(
                      summary.finishTime || "--",
                    )}
                  </div>

                </td>

              </tr>


              <!-- Work -->

              <tr>

                <td
                  width="50%"
                  style="
                    padding:18px;
                    border-right:
                      1px solid #e5e7eb;
                  "
                >

                  <div
                    style="
                      color:#9ca3af;
                      font-size:11px;
                      text-transform:uppercase;
                      letter-spacing:0.4px;
                    "
                  >
                    Work Time
                  </div>

                  <div
                    style="
                      margin-top:5px;
                      color:#4f46e5;
                      font-size:16px;
                      font-weight:700;
                    "
                  >
                    ${escapeHtml(
                      summary.workTime ||
                        formatDuration(
                          summary.workSeconds,
                        ),
                    )}
                  </div>

                </td>


                <!-- Break -->

                <td
                  width="50%"
                  style="
                    padding:18px;
                  "
                >

                  <div
                    style="
                      color:#9ca3af;
                      font-size:11px;
                      text-transform:uppercase;
                      letter-spacing:0.4px;
                    "
                  >
                    Break Time
                  </div>

                  <div
                    style="
                      margin-top:5px;
                      color:#111827;
                      font-size:16px;
                      font-weight:700;
                    "
                  >
                    ${escapeHtml(
                      summary.breakTime ||
                        formatDuration(
                          summary.breakSeconds,
                        ),
                    )}
                  </div>

                </td>

              </tr>

            </table>


            <!-- ========================================= -->
            <!-- ACTIVITY -->
            <!-- ========================================= -->

            <div
              style="
                margin-top:32px;
                color:#374151;
                font-size:13px;
                font-weight:700;
                text-transform:uppercase;
                letter-spacing:0.5px;
              "
            >
              Activity
            </div>


            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="
                margin-top:12px;
                border-radius:16px;
                background:#f8fafc;
                border:1px solid #e5e7eb;
                overflow:hidden;
              "
            >

              <tr>

                <!-- Keys -->

                <td
                  width="25%"
                  align="center"
                  style="
                    padding:18px 6px;
                    border-right:
                      1px solid #e5e7eb;
                  "
                >

                  <div
                    style="
                      color:#111827;
                      font-size:18px;
                      font-weight:700;
                    "
                  >
                    ${Number(
                      activity.keyPresses || 0,
                    ).toLocaleString()}
                  </div>

                  <div
                    style="
                      margin-top:5px;
                      color:#9ca3af;
                      font-size:10px;
                      text-transform:uppercase;
                      letter-spacing:0.3px;
                    "
                  >
                    Key Presses
                  </div>

                </td>


                <!-- Clicks -->

                <td
                  width="25%"
                  align="center"
                  style="
                    padding:18px 6px;
                    border-right:
                      1px solid #e5e7eb;
                  "
                >

                  <div
                    style="
                      color:#111827;
                      font-size:18px;
                      font-weight:700;
                    "
                  >
                    ${Number(
                      activity.mouseClicks || 0,
                    ).toLocaleString()}
                  </div>

                  <div
                    style="
                      margin-top:5px;
                      color:#9ca3af;
                      font-size:10px;
                      text-transform:uppercase;
                      letter-spacing:0.3px;
                    "
                  >
                    Clicks
                  </div>

                </td>


                <!-- Moves -->

                <td
                  width="25%"
                  align="center"
                  style="
                    padding:18px 6px;
                    border-right:
                      1px solid #e5e7eb;
                  "
                >

                  <div
                    style="
                      color:#111827;
                      font-size:18px;
                      font-weight:700;
                    "
                  >
                    ${Number(
                      activity.mouseMoves || 0,
                    ).toLocaleString()}
                  </div>

                  <div
                    style="
                      margin-top:5px;
                      color:#9ca3af;
                      font-size:10px;
                      text-transform:uppercase;
                      letter-spacing:0.3px;
                    "
                  >
                    Mouse Moves
                  </div>

                </td>


                <!-- Screenshots -->

                <td
                  width="25%"
                  align="center"
                  style="
                    padding:18px 6px;
                  "
                >

                  <div
                    style="
                      color:#111827;
                      font-size:18px;
                      font-weight:700;
                    "
                  >
                    ${Number(
                      activity.screenshotCount || 0,
                    ).toLocaleString()}
                  </div>

                  <div
                    style="
                      margin-top:5px;
                      color:#9ca3af;
                      font-size:10px;
                      text-transform:uppercase;
                      letter-spacing:0.3px;
                    "
                  >
                    Screenshots
                  </div>

                </td>

              </tr>

            </table>


            <!-- Activity Score -->

            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="
                margin-top:12px;
                border-radius:14px;
                background:#f8fafc;
                border:1px solid #e5e7eb;
              "
            >

              <tr>

                <td
                  style="
                    padding:16px 18px;
                  "
                >

                  <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                  >

                    <tr>

                      <td
                        style="
                          color:#6b7280;
                          font-size:13px;
                        "
                      >
                        Activity Score
                      </td>

                      <td
                        align="right"
                        style="
                          color:#059669;
                          font-size:16px;
                          font-weight:700;
                        "
                      >
                        ${activityScore}%
                      </td>

                    </tr>

                  </table>


                  <!-- Progress -->

                  <div
                    style="
                      margin-top:10px;
                      height:8px;
                      background:#e5e7eb;
                      border-radius:999px;
                      overflow:hidden;
                    "
                  >

                    <div
                      style="
                        width:${activityScore}%;
                        height:8px;
                        background:#22c55e;
                        border-radius:999px;
                      "
                    ></div>

                  </div>

                </td>

              </tr>

            </table>


            <!-- ========================================= -->
            <!-- TASKS -->
            <!-- ========================================= -->

            <div
              style="
                margin-top:32px;
                color:#374151;
                font-size:13px;
                font-weight:700;
                text-transform:uppercase;
                letter-spacing:0.5px;
              "
            >
              Tasks
            </div>


            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="
                margin-top:12px;
                border-radius:16px;
                background:#ffffff;
                border:1px solid #e5e7eb;
                overflow:hidden;
              "
            >

              <tr>

                <td
                  style="
                    padding:13px 16px;
                    background:#f8fafc;
                    color:#6b7280;
                    font-size:10px;
                    font-weight:700;
                    text-transform:uppercase;
                    letter-spacing:0.4px;
                  "
                >
                  Task
                </td>

                <td
                  align="right"
                  style="
                    padding:13px 16px;
                    background:#f8fafc;
                    color:#6b7280;
                    font-size:10px;
                    font-weight:700;
                    text-transform:uppercase;
                    letter-spacing:0.4px;
                  "
                >
                  Time
                </td>

              </tr>

              ${taskRows}

            </table>


            <!-- ========================================= -->
            <!-- SESSION TIMELINE -->
            <!-- ========================================= -->

            <div
              style="
                margin-top:32px;
                color:#374151;
                font-size:13px;
                font-weight:700;
                text-transform:uppercase;
                letter-spacing:0.5px;
              "
            >
              Session Timeline
            </div>


            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="
                margin-top:12px;
                border-radius:16px;
                background:#ffffff;
                border:1px solid #e5e7eb;
                overflow:hidden;
              "
            >

              ${sessionRows}

            </table>


            <!-- ========================================= -->
            <!-- CTA -->
            <!-- ========================================= -->

            ${
              report.reportUrl
                ? `
<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="margin-top:32px;"
>
  <tr>

    <td align="center">

      <a
        href="${escapeHtml(
          report.reportUrl,
        )}"
        target="_blank"
        style="
          display:inline-block;
          padding:15px 30px;
          border-radius:11px;
          background:#4f46e5;
          color:#ffffff;
          text-decoration:none;
          font-size:15px;
          font-weight:700;
          box-shadow:
            0 8px 20px
            rgba(79,70,229,0.28);
        "
      >
        View Full Report

        <span
          style="
            margin-left:8px;
            font-size:17px;
          "
        >
          →
        </span>

      </a>

    </td>

  </tr>
</table>
`
                : ""
            }


            <!-- Email -->

            ${
              safeEmail
                ? `
<p
  style="
    margin:24px 0 0;
    text-align:center;
    color:#9ca3af;
    font-size:11px;
  "
>
  Report sent to ${safeEmail}
</p>
`
                : ""
            }

          </td>

        </tr>


        <!-- ========================================= -->
        <!-- FOOTER -->
        <!-- ========================================= -->

        <tr>

          <td
            style="
              padding:24px 30px;
              text-align:center;
              background:#f8fafc;
              border-top:1px solid #e5e7eb;
            "
          >

            <div
              style="
                color:#374151;
                font-size:13px;
                font-weight:600;
              "
            >
              WorkComposer
            </div>

            <div
              style="
                margin-top:6px;
                color:#9ca3af;
                font-size:11px;
                line-height:1.5;
              "
            >
              Productivity and workforce management,
              simplified.
            </div>

            <div
              style="
                margin-top:12px;
                color:#9ca3af;
                font-size:11px;
              "
            >
              © 2026 WorkComposer.
              All rights reserved.
            </div>

          </td>

        </tr>

      </table>

    </td>

  </tr>

</table>

</body>
</html>
`;
};

export default dailyTrackingReportTemplate;