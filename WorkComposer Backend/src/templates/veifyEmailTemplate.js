const verifyEmailTemplate = ({
  verifyUrl,
  firstName,
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

  <title>Verify Your Email</title>
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

            <!-- Verification Badge -->

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
                Account Verification
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
              Verify Your Email
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
              thanks for creating your WorkComposer account.
              Please verify your email address to continue.
            </p>


            <!-- ========================================= -->
            <!-- VERIFICATION CARD -->
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
                overflow:hidden;
              "
            >

              <tr>

                <td
                  align="center"
                  style="
                    padding:28px 20px;
                  "
                >

                  <!-- Icon -->

                  <div
                    style="
                      width:48px;
                      height:48px;
                      margin:0 auto;
                      border-radius:14px;
                      background:#eef2ff;
                      border:1px solid #c7d2fe;
                      color:#4f46e5;
                      line-height:48px;
                      text-align:center;
                      font-size:22px;
                      font-weight:700;
                    "
                  >
                    ✓
                  </div>


                  <div
                    style="
                      margin-top:16px;
                      color:#374151;
                      font-size:14px;
                      font-weight:700;
                    "
                  >
                    Confirm your email address
                  </div>


                  <div
                    style="
                      margin-top:6px;
                      color:#9ca3af;
                      font-size:12px;
                    "
                  >
                    Click the button below to activate
                    your WorkComposer account.
                  </div>


                  <!-- Button -->

                  <div
                    style="
                      margin-top:22px;
                    "
                  >

                    <a
                      href="${verifyUrl}"
                      target="_blank"
                      style="
                        display:inline-block;
                        padding:14px 30px;
                        border-radius:10px;
                        background:#4f46e5;
                        color:#ffffff;
                        text-decoration:none;
                        font-size:14px;
                        font-weight:700;
                        box-shadow:
                          0 8px 20px
                          rgba(79,70,229,0.25);
                      "
                    >
                      Verify Email
                      <span
                        style="
                          margin-left:7px;
                          font-size:16px;
                        "
                      >
                        →
                      </span>
                    </a>

                  </div>

                </td>

              </tr>

            </table>


            <!-- ========================================= -->
            <!-- EXPIRATION NOTICE -->
            <!-- ========================================= -->

            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="
                margin-top:18px;
                border-radius:14px;
                background:#fffbeb;
                border:1px solid #fde68a;
              "
            >

              <tr>

                <td
                  width="42"
                  valign="top"
                  style="
                    padding:18px 0 18px 18px;
                  "
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
                      font-size:16px;
                      font-weight:700;
                    "
                  >
                    !
                  </div>

                </td>

                <td
                  style="
                    padding:18px 18px 18px 12px;
                  "
                >

                  <div
                    style="
                      color:#92400e;
                      font-size:13px;
                      font-weight:700;
                    "
                  >
                    Verification link expires soon
                  </div>

                  <div
                    style="
                      margin-top:5px;
                      color:#a16207;
                      font-size:12px;
                      line-height:1.6;
                    "
                  >
                    This verification link will expire
                    in 24 hours. Please verify your email
                    before the link expires.
                  </div>

                </td>

              </tr>

            </table>


            <!-- ========================================= -->
            <!-- SECURITY NOTICE -->
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
                If you didn't create a WorkComposer account,
                you can safely ignore this email.
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

export default verifyEmailTemplate;