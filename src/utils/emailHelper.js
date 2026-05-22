const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

// ─── Logo path (served as inline CID attachment) ──────────────────────────────
const LOGO_PATH = path.join(__dirname, "../../logo/logo.png");
const LOGO_CID = "vinfarm-logo@booking";

// ─── Shared helper: format date nicely ───────────────────────────────────────
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

// ─── Customer Email Template ──────────────────────────────────────────────────
const getCustomerTemplate = (booking, room, customer) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your Booking Request — Vinfarm Resort</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    * { box-sizing: border-box; }
    body, table, td { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse !important; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    body { margin: 0 !important; padding: 0 !important; background-color: #f5f3ee; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .mobile-pad { padding: 24px 16px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
      .logo-img { max-width: 140px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f5f3ee;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f3ee;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Main Card -->
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;width:100%;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.08);">

          <!-- HEADER -->
          <tr>
            <td align="center" style="background-color:#1a4531;padding:36px 30px 28px 30px;border-bottom:4px solid #c5a155;">
              <img src="cid:${LOGO_CID}" class="logo-img" alt="Vinfarm Resort" width="180" style="display:block;max-width:180px;height:auto;margin:0 auto;">
              <p style="margin:14px 0 0 0;color:#c5a155;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;">Luxury Resort &amp; Farm Stay</p>
            </td>
          </tr>

          <!-- GREETING BAND -->
          <tr>
            <td style="background-color:#f9f7f3;padding:28px 40px 20px 40px;border-bottom:1px solid #ede9e0;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1a4531;font-weight:normal;">
                Warm Greetings, <strong>${customer.name}</strong>
              </p>
              <p style="margin:12px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#666666;line-height:1.7;">
                Thank you for choosing Vinfarm. We have received your booking inquiry and our team will connect with you shortly to confirm your stay.
              </p>
            </td>
          </tr>

          <!-- BOOKING DETAILS CARD -->
          <tr>
            <td class="mobile-pad" style="padding:32px 40px;">

              <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#1a4531;">
                Stay Details
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#f9f7f3;border-radius:12px;border:1px solid #ede9e0;overflow:hidden;">
                <!-- Row -->
                <tr>
                  <td style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#888888;font-weight:600;border-bottom:1px solid #ede9e0;width:38%;">Accommodation</td>
                  <td style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1a1a1a;font-weight:700;border-bottom:1px solid #ede9e0;">${room.roomType}</td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#888888;font-weight:600;border-bottom:1px solid #ede9e0;">Check-In</td>
                  <td style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1a1a1a;font-weight:700;border-bottom:1px solid #ede9e0;">${fmtDate(booking.checkInDate)}</td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#888888;font-weight:600;border-bottom:1px solid #ede9e0;">Check-Out</td>
                  <td style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1a1a1a;font-weight:700;border-bottom:1px solid #ede9e0;">${fmtDate(booking.checkOutDate)}</td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#888888;font-weight:600;border-bottom:1px solid #ede9e0;">Guests</td>
                  <td style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1a1a1a;font-weight:700;border-bottom:1px solid #ede9e0;">${booking.numberOfGuests}</td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#888888;font-weight:600;">Contact</td>
                  <td style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1a1a1a;font-weight:700;">${customer.phone}</td>
                </tr>
              </table>

              <!-- Status Badge -->
              <p style="margin:24px 0 0 0;text-align:center;">
                <span style="display:inline-block;background-color:#fff8ec;color:#b8862a;border:1px solid #f0d89a;padding:6px 18px;border-radius:30px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">
                  ⏳ Pending Confirmation
                </span>
              </p>

            </td>
          </tr>

          <!-- CTA BOX -->
          <tr>
            <td style="padding:0 40px 32px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#1a4531;border-radius:14px;overflow:hidden;">
                <tr>
                  <td style="padding:28px 28px;text-align:center;">
                    <p style="margin:0 0 8px 0;font-family:Georgia,'Times New Roman',serif;font-size:17px;color:#c5a155;font-weight:normal;">We'll Be In Touch Shortly</p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(255,255,255,0.82);line-height:1.7;">
                      Our team will call you on <strong style="color:#ffffff;">${customer.phone}</strong><br>
                      to finalise your booking details.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="background-color:#111111;padding:24px 30px;border-top:1px solid #222222;">
              <p style="margin:0 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#888888;">
                © 2026 Vinfarm Resort &amp; Farm Stay &nbsp;·&nbsp; Nashik, Maharashtra
              </p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#555555;">
                concierge@vin-farm.com
              </p>
            </td>
          </tr>

        </table><!-- /Main Card -->

      </td>
    </tr>
  </table>
</body>
</html>`;

// ─── Admin Email Template ─────────────────────────────────────────────────────
const getAdminTemplate = (booking, room, customer) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>New Booking Alert — Vinfarm Resort</title>
  <style>
    * { box-sizing: border-box; }
    body, table, td { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse !important; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    body { margin: 0 !important; padding: 0 !important; background-color: #0f1f18; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .mobile-pad { padding: 24px 16px !important; }
      .logo-img { max-width: 140px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#0f1f18;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0f1f18;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Main Card -->
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;width:100%;background-color:#162b1f;border-radius:20px;overflow:hidden;border:1px solid #2a4535;">

          <!-- HEADER -->
          <tr>
            <td align="center" style="background-color:#1a4531;padding:32px 30px 24px 30px;border-bottom:3px solid #c5a155;">
              <img src="cid:${LOGO_CID}" class="logo-img" alt="Vinfarm Resort" width="160" style="display:block;max-width:160px;height:auto;margin:0 auto;">
              <p style="margin:12px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.2em;color:#c5a155;text-transform:uppercase;">Resort Management Alert</p>
            </td>
          </tr>

          <!-- ALERT BANNER -->
          <tr>
            <td align="center" style="padding:20px 30px;background-color:#1e3828;border-bottom:1px solid #2a4535;">
              <span style="display:inline-block;background-color:#c5a155;color:#0f1f18;padding:8px 24px;border-radius:30px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;">
                🚨 New Booking Request Received
              </span>
            </td>
          </tr>

          <!-- GUEST INFO -->
          <tr>
            <td class="mobile-pad" style="padding:28px 36px 8px 36px;">
              <p style="margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#c5a155;">
                Guest Information
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#1e3828;border-radius:12px;border:1px solid #2a4535;overflow:hidden;">
                <tr>
                  <td style="padding:13px 18px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7aab8a;font-weight:600;border-bottom:1px solid #2a4535;width:36%;">Full Name</td>
                  <td style="padding:13px 18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#e8f0eb;font-weight:700;border-bottom:1px solid #2a4535;">${customer.name}</td>
                </tr>
                <tr>
                  <td style="padding:13px 18px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7aab8a;font-weight:600;border-bottom:1px solid #2a4535;">Email</td>
                  <td style="padding:13px 18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#e8f0eb;font-weight:700;border-bottom:1px solid #2a4535;">${customer.email}</td>
                </tr>
                <tr>
                  <td style="padding:13px 18px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7aab8a;font-weight:600;">Phone</td>
                  <td style="padding:13px 18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#e8f0eb;font-weight:700;">${customer.phone}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- STAY INFO -->
          <tr>
            <td class="mobile-pad" style="padding:20px 36px 32px 36px;">
              <p style="margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#c5a155;">
                Booking Details
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#1e3828;border-radius:12px;border:1px solid #2a4535;overflow:hidden;">
                <tr>
                  <td style="padding:13px 18px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7aab8a;font-weight:600;border-bottom:1px solid #2a4535;width:36%;">Room / Villa</td>
                  <td style="padding:13px 18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#e8f0eb;font-weight:700;border-bottom:1px solid #2a4535;">${room.roomType}</td>
                </tr>
                <tr>
                  <td style="padding:13px 18px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7aab8a;font-weight:600;border-bottom:1px solid #2a4535;">Check-In</td>
                  <td style="padding:13px 18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#e8f0eb;font-weight:700;border-bottom:1px solid #2a4535;">${fmtDate(booking.checkInDate)}</td>
                </tr>
                <tr>
                  <td style="padding:13px 18px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7aab8a;font-weight:600;border-bottom:1px solid #2a4535;">Check-Out</td>
                  <td style="padding:13px 18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#e8f0eb;font-weight:700;border-bottom:1px solid #2a4535;">${fmtDate(booking.checkOutDate)}</td>
                </tr>
                <tr>
                  <td style="padding:13px 18px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7aab8a;font-weight:600;">Guests</td>
                  <td style="padding:13px 18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#e8f0eb;font-weight:700;">${booking.numberOfGuests}</td>
                </tr>
              </table>

              <!-- Action note -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="margin-top:20px;background-color:#243d2c;border-radius:10px;border-left:4px solid #c5a155;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#d4c9a8;line-height:1.6;">
                      <strong style="color:#c5a155;">Action Required:</strong> Please contact the guest at <strong style="color:#ffffff;">${customer.phone}</strong> or <strong style="color:#ffffff;">${customer.email}</strong> to confirm this booking and collect required details.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="background-color:#0d1a12;padding:20px 30px;border-top:1px solid #1e3828;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#3d5c47;">
                © 2026 Vinfarm Resort &amp; Farm Stay &nbsp;·&nbsp; Admin Notification System
              </p>
            </td>
          </tr>

        </table><!-- /Main Card -->

      </td>
    </tr>
  </table>
</body>
</html>`;

// ─── Booking Confirmation Template ──────────────────────────────────────────
const getConfirmationTemplate = (booking, room, customer) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Booking Confirmed — Vinfarm Resort</title>
  <style>
    * { box-sizing: border-box; }
    body, table, td { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse !important; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    body { margin: 0 !important; padding: 0 !important; background-color: #f5f3ee; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .mobile-pad { padding: 24px 16px !important; }
      .logo-img { max-width: 140px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f5f3ee;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f3ee;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Main Card -->
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;width:100%;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.08);">

          <!-- HEADER -->
          <tr>
            <td align="center" style="background-color:#1a4531;padding:36px 30px 28px 30px;border-bottom:4px solid #c5a155;">
              <img src="cid:${LOGO_CID}" class="logo-img" alt="Vinfarm Resort" width="180" style="display:block;max-width:180px;height:auto;margin:0 auto;">
              <p style="margin:14px 0 0 0;color:#c5a155;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;">Luxury Resort &amp; Farm Stay</p>
            </td>
          </tr>

          <!-- GREETING BAND -->
          <tr>
            <td style="background-color:#f3f9f6;padding:28px 40px 20px 40px;border-bottom:1px solid #e0ede6;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#1a4531;font-weight:normal;">
                Booking Confirmed! 🌟
              </p>
              <p style="margin:12px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#444444;line-height:1.7;">
                Dear <strong>${customer.name}</strong>, we are delighted to confirm your stay at Vinfarm Resort. We look forward to welcoming you to our sanctuary of peace and luxury.
              </p>
            </td>
          </tr>

          <!-- BOOKING DETAILS -->
          <tr>
            <td class="mobile-pad" style="padding:32px 40px;">

              <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#1a4531;">
                Reservation Summary
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#f9f7f3;border-radius:12px;border:1px solid #ede9e0;overflow:hidden;">
                <tr>
                  <td style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#888888;font-weight:600;border-bottom:1px solid #ede9e0;width:38%;">Accommodation</td>
                  <td style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1a1a1a;font-weight:700;border-bottom:1px solid #ede9e0;">${room.roomType}</td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#888888;font-weight:600;border-bottom:1px solid #ede9e0;">Check-In</td>
                  <td style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1a1a1a;font-weight:700;border-bottom:1px solid #ede9e0;">${fmtDate(booking.checkInDate)}</td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#888888;font-weight:600;border-bottom:1px solid #ede9e0;">Check-Out</td>
                  <td style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1a1a1a;font-weight:700;border-bottom:1px solid #ede9e0;">${fmtDate(booking.checkOutDate)}</td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#888888;font-weight:600;border-bottom:1px solid #ede9e0;">Guests</td>
                  <td style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1a1a1a;font-weight:700;border-bottom:1px solid #ede9e0;">${booking.numberOfGuests}</td>
                </tr>
              </table>

              <!-- ID PROOF NOTICE -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="margin-top:24px;background-color:#fff9f0;border-radius:10px;border-left:4px solid #c5a155;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7a5c1a;line-height:1.6;">
                      <strong style="color:#1a4531;">Important Note:</strong> Please ensure all guests carry a valid government-issued ID proof (Aadhar Card, Driving License, or Passport) to be presented at the time of check-in.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="background-color:#111111;padding:24px 30px;border-top:1px solid #222222;">
              <p style="margin:0 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#888888;">
                © 2026 Vinfarm Resort &amp; Farm Stay &nbsp;·&nbsp; Nashik, Maharashtra
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

// ─── Shared: Create Transporter ──────────────────────────────────────────────
const createTransporter = async () => {
  const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasSmtpConfig) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

// ─── Export: sendBookingEmails (Pending/Admin Alert) ───────────────────────────
const sendBookingEmails = async (booking, room, customer) => {
  const transporter = await createTransporter();
  const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  const fromAddress = process.env.SMTP_FROM || '"Vinfarm Resort" <concierge@vin-farm.com>';
  const adminEmail = process.env.VINFARM_ADMIN_EMAIL || "admin@resort.com";

  const logoAttachment = fs.existsSync(LOGO_PATH) ? [{ filename: "logo.png", path: LOGO_PATH, cid: LOGO_CID }] : [];

  try {
    const customerMailInfo = await transporter.sendMail({
      from: fromAddress,
      to: customer.email,
      subject: "Your Booking Request at Vinfarm Resort ✅",
      html: getCustomerTemplate(booking, room, customer),
      attachments: logoAttachment,
    });

    await transporter.sendMail({
      from: fromAddress,
      to: adminEmail,
      subject: `🚨 New Booking — ${customer.name} (${room.roomType})`,
      html: getAdminTemplate(booking, room, customer),
      attachments: logoAttachment,
    });

    return { success: true, customerMailPreview: !hasSmtpConfig ? nodemailer.getTestMessageUrl(customerMailInfo) : null };
  } catch (error) {
    console.error("Email Utility Error:", error);
    return { success: false, error: error.message };
  }
};

// ─── Export: sendBookingConfirmationEmail ──────────────────────────────────────
const sendBookingConfirmationEmail = async (booking, room, customer) => {
  const transporter = await createTransporter();
  const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  const fromAddress = process.env.SMTP_FROM || '"Vinfarm Resort" <concierge@vin-farm.com>';

  const logoAttachment = fs.existsSync(LOGO_PATH) ? [{ filename: "logo.png", path: LOGO_PATH, cid: LOGO_CID }] : [];

  try {
    const mailInfo = await transporter.sendMail({
      from: fromAddress,
      to: customer.email,
      subject: "Booking Confirmed! Your Stay at Vinfarm Resort 🌟",
      html: getConfirmationTemplate(booking, room, customer),
      attachments: logoAttachment,
    });

    console.log("Email Utility: Confirmation email sent.");
    return { success: true, preview: !hasSmtpConfig ? nodemailer.getTestMessageUrl(mailInfo) : null };
  } catch (error) {
    console.error("Email Utility Error:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendBookingEmails, sendBookingConfirmationEmail };
