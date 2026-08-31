export const weeklyTeamTrackingReportTemplate = ({
  manager,
  reports,
  startDate,
  endDate,
}) => {
  return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Weekly Team Tracking Report</title>
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
          max-width:700px;
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
              padding:42px 30px 36px;
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
                Weekly Team Report
              </span>

            </div>


            <!-- Heading -->

            <h1
              style="
                margin:0;
                text-align:center;
                color:#111827;
                font-size:28px;
                line-height:1.3;
                letter-spacing:-0.6px;
                font-weight:750;
              "
            >
              Team Tracking Summary
            </h1>


            <p
              style="
                margin:16px auto 0;
                max-width:500px;
                text-align:center;
                color:#6b7280;
                font-size:15px;
                line-height:1.7;
              "
            >
              Hello
              <strong style="color:#374151;">
                ${manager.firstName || "there"}
              </strong>,
              here is your team's tracking summary
              for the selected period.
            </p>


            <!-- ========================================= -->
            <!-- DATE RANGE -->
            <!-- ========================================= -->

            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="
                margin-top:30px;
                border-radius:16px;
                background:#f8fafc;
                border:1px solid #e5e7eb;
              "
            >

              <tr>

                <td
                  align="center"
                  style="
                    padding:20px;
                  "
                >

                  <div
                    style="
                      color:#9ca3af;
                      font-size:11px;
                      font-weight:700;
                      text-transform:uppercase;
                      letter-spacing:0.6px;
                    "
                  >
                    Reporting Period
                  </div>

                  <div
                    style="
                      margin-top:7px;
                      color:#111827;
                      font-size:18px;
                      font-weight:700;
                    "
                  >
                    ${startDate}

                    <span
                      style="
                        color:#9ca3af;
                        padding:0 6px;
                      "
                    >
                      →
                    </span>

                    ${endDate}
                  </div>

                </td>

              </tr>

            </table>


            <!-- ========================================= -->
            <!-- TEAM REPORT -->
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
              Team Member Summary
            </div>


            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="
                margin-top:12px;
                border:1px solid #e5e7eb;
                border-radius:16px;
                overflow:hidden;
                border-collapse:separate;
                border-spacing:0;
              "
            >

              <thead>

                <tr
                  style="
                    background:#f8fafc;
                  "
                >

                  <th
                    align="left"
                    style="
                      padding:13px 12px;
                      color:#6b7280;
                      font-size:11px;
                      font-weight:700;
                      text-transform:uppercase;
                      letter-spacing:0.3px;
                      border-bottom:
                        1px solid #e5e7eb;
                    "
                  >
                    Employee
                  </th>

                  <th
                    align="center"
                    style="
                      padding:13px 8px;
                      color:#6b7280;
                      font-size:11px;
                      font-weight:700;
                      text-transform:uppercase;
                      letter-spacing:0.3px;
                      border-bottom:
                        1px solid #e5e7eb;
                    "
                  >
                    Attendance
                  </th>

                  <th
                    align="center"
                    style="
                      padding:13px 8px;
                      color:#6b7280;
                      font-size:11px;
                      font-weight:700;
                      text-transform:uppercase;
                      letter-spacing:0.3px;
                      border-bottom:
                        1px solid #e5e7eb;
                    "
                  >
                    Worked
                  </th>

                  <th
                    align="center"
                    style="
                      padding:13px 8px;
                      color:#6b7280;
                      font-size:11px;
                      font-weight:700;
                      text-transform:uppercase;
                      letter-spacing:0.3px;
                      border-bottom:
                        1px solid #e5e7eb;
                    "
                  >
                    Productivity
                  </th>

                </tr>

              </thead>

              <tbody>

                ${reports}

              </tbody>

            </table>


            <!-- ========================================= -->
            <!-- INFO -->
            <!-- ========================================= -->

            <div
              style="
                margin-top:22px;
                padding:17px 18px;
                border-radius:14px;
                background:#f8fafc;
                border:1px solid #e5e7eb;
              "
            >

              <p
                style="
                  margin:0;
                  color:#6b7280;
                  font-size:12px;
                  line-height:1.6;
                "
              >
                This report summarizes your team's attendance,
                tracked work time, and productivity for the
                selected reporting period.
              </p>

            </div>

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