const twoFactorTemplate = ({ firstName, otp }) => {
  return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Two-Factor Authentication</title>
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

            <!-- Security Badge -->

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
                Security Verification
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
              Verify Your Sign-In
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
                ${firstName || "there"}
              </strong>,
              use the verification code below to complete
              your WorkComposer sign-in.
            </p>


            <!-- ========================================= -->
            <!-- OTP CARD -->
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

                  <div
                    style="
                      color:#9ca3af;
                      font-size:11px;
                      font-weight:700;
                      text-transform:uppercase;
                      letter-spacing:1px;
                    "
                  >
                    Verification Code
                  </div>


                  <div
                    style="
                      margin-top:14px;
                      padding:18px 22px;
                      border-radius:12px;
                      background:#eef2ff;
                      border:1px solid #c7d2fe;
                      color:#4f46e5;
                      font-size:32px;
                      line-height:1;
                      font-weight:800;
                      letter-spacing:8px;
                      text-align:center;
                    "
                  >
                    ${otp}
                  </div>


                  <div
                    style="
                      margin-top:16px;
                      color:#6b7280;
                      font-size:12px;
                    "
                  >
                    This code expires in
                    <strong style="color:#374151;">
                      10 minutes
                    </strong>
                  </div>

                </td>

              </tr>

            </table>


            <!-- ========================================= -->
            <!-- SECURITY NOTICE -->
            <!-- ========================================= -->

            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="
                margin-top:18px;
                border-radius:14px;
                background:#f8fafc;
                border:1px solid #e5e7eb;
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
                      background:#eef2ff;
                      color:#4f46e5;
                      text-align:center;
                      line-height:34px;
                      font-size:16px;
                      font-weight:700;
                    "
                  >
                    ✓
                  </div>

                </td>

                <td
                  style="
                    padding:18px 18px 18px 12px;
                  "
                >

                  <div
                    style="
                      color:#374151;
                      font-size:13px;
                      font-weight:700;
                    "
                  >
                    Keep your code private
                  </div>

                  <div
                    style="
                      margin-top:5px;
                      color:#6b7280;
                      font-size:12px;
                      line-height:1.6;
                    "
                  >
                    WorkComposer will never ask you to
                    share this verification code with
                    another person.
                  </div>

                </td>

              </tr>

            </table>


            <!-- ========================================= -->
            <!-- UNRECOGNIZED SIGN-IN -->
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
                  color:#6b7280;
                  font-size:12px;
                  line-height:1.6;
                "
              >
                If you didn't attempt to sign in,
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
              WorkComposer Security
            </div>

            <div
              style="
                margin-top:6px;
                color:#9ca3af;
                font-size:11px;
                line-height:1.5;
              "
            >
              Keeping your WorkComposer account secure.
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

export default twoFactorTemplate;