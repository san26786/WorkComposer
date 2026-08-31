const weeklyWarningEmailTemplate = ({
  firstName,
  workedTime,
  expectedTime,
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

  <title>Weekly Work Time Warning</title>
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

            <!-- Warning Badge -->

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
                  background:#fffbeb;
                  color:#b45309;
                  font-size:12px;
                  font-weight:700;
                  letter-spacing:0.4px;
                  text-transform:uppercase;
                  border:1px solid #fde68a;
                "
              >
                Weekly Work Time Warning
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
              Weekly Work Time Warning
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
              Hi
              <strong style="color:#374151;">
                ${firstName || "there"}
              </strong>,
              you have not completed your expected working
              hours for this week.
            </p>


            <!-- ========================================= -->
            <!-- WARNING CARD -->
            <!-- ========================================= -->

            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="
                margin-top:30px;
                border-radius:16px;
                background:#fffbeb;
                border:1px solid #fde68a;
                overflow:hidden;
              "
            >

              <tr>

                <td
                  style="
                    padding:18px 20px;
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
                        width="42"
                        valign="top"
                      >

                        <div
                          style="
                            width:34px;
                            height:34px;
                            border-radius:10px;
                            background:#fef3c7;
                            color:#b45309;
                            text-align:center;
                            line-height:34px;
                            font-size:17px;
                            font-weight:700;
                          "
                        >
                          !
                        </div>

                      </td>

                      <td
                        style="
                          padding-left:12px;
                        "
                      >

                        <div
                          style="
                            color:#92400e;
                            font-size:13px;
                            font-weight:700;
                          "
                        >
                          Weekly target not completed
                        </div>

                        <div
                          style="
                            margin-top:4px;
                            color:#a16207;
                            font-size:12px;
                            line-height:1.5;
                          "
                        >
                          Your tracked work time is currently
                          below your expected weekly hours.
                        </div>

                      </td>

                    </tr>

                  </table>

                </td>

              </tr>

            </table>


            <!-- ========================================= -->
            <!-- TIME SUMMARY -->
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
              Weekly Work Time Summary
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

                <!-- Expected -->

                <td
                  width="50%"
                  style="
                    padding:20px 18px;
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
                    Expected Time
                  </div>

                  <div
                    style="
                      margin-top:7px;
                      color:#111827;
                      font-size:20px;
                      font-weight:700;
                    "
                  >
                    ${expectedTime || "--"}
                  </div>

                </td>


                <!-- Worked -->

                <td
                  width="50%"
                  style="
                    padding:20px 18px;
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
                    Worked Time
                  </div>

                  <div
                    style="
                      margin-top:7px;
                      color:#b45309;
                      font-size:20px;
                      font-weight:700;
                    "
                  >
                    ${workedTime || "--"}
                  </div>

                </td>

              </tr>

            </table>


            <!-- ========================================= -->
            <!-- INFORMATION -->
            <!-- ========================================= -->

            <div
              style="
                margin-top:28px;
                padding:18px 20px;
                border-radius:14px;
                background:#f8fafc;
                border:1px solid #e5e7eb;
              "
            >

              <p
                style="
                  margin:0;
                  color:#6b7280;
                  font-size:13px;
                  line-height:1.7;
                "
              >
                If this is unexpected, please continue tracking
                your work time or contact your manager if you
                need assistance with your weekly schedule.
              </p>

            </div>


            <!-- ========================================= -->
            <!-- FOOTER NOTE -->
            <!-- ========================================= -->

            <div
              style="
                margin-top:22px;
                text-align:center;
              "
            >

              <p
                style="
                  margin:0;
                  color:#9ca3af;
                  font-size:12px;
                  line-height:1.6;
                "
              >
                This is an automated weekly work-time notification
                from WorkComposer.
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

export default weeklyWarningEmailTemplate;