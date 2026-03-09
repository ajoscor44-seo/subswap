/** Escape HTML to prevent XSS when inserting user-controlled content into email templates. */
function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const APP_BASE_URL = typeof Deno !== "undefined"
  ? (Deno.env.get("APP_URL") ?? "https://discountzar.com")
  : "https://discountzar.com";
const LOGO_URL = `${APP_BASE_URL}/icons/icon-192x192.png`;

function layout(
  content: string,
  footer = "You're receiving this because you have a DiscountZAR account.",
) {
  const safeFooter = escapeHtml(footer);
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f7ff;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7ff;padding:40px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0">

  <tr><td style="background:linear-gradient(135deg,#1a1230 0%,#2d1f6e 55%,#3730a3 100%);padding:28px 32px;border-radius:20px 20px 0 0;text-align:center;">
    <table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>
      <td style="width:40px;height:40px;vertical-align:middle;text-align:center;"><img src="${LOGO_URL}" alt="DiscountZAR" width="40" height="40" style="display:block;border-radius:10px;" /></td>
      <td style="padding-left:12px;font-size:19px;font-weight:800;color:#fff;letter-spacing:-0.02em;vertical-align:middle;">DiscountZAR</td>
    </tr></table>
  </td></tr>

  <tr><td style="background:#fff;padding:36px 40px;border-left:1.5px solid #f0eef9;border-right:1.5px solid #f0eef9;">
    ${content}
  </td></tr>

  <tr><td style="background:#fafafe;padding:20px 40px;border:1.5px solid #f0eef9;border-top:none;border-radius:0 0 20px 20px;text-align:center;">
    <p style="margin:0 0 5px;font-size:11px;color:#c4b5fd;">${safeFooter}</p>
    <p style="margin:0;font-size:11px;color:#d8d0f8;">© 2025 DiscountZAR · <a href="https://discountzar.com" style="color:#a78bfa;text-decoration:none;">discountzar.com</a></p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

function btn(label: string, url: string) {
  const safeLabel = escapeHtml(label);
  const safeUrl = escapeHtml(url);
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr>
    <td style="background:linear-gradient(135deg,#7c5cfc,#6366f1);border-radius:12px;">
      <a href="${safeUrl}" style="display:block;padding:15px 32px;font-size:13px;font-weight:700;color:#fff;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;">${safeLabel} <span style="opacity:0.9;margin-left:4px;">▶</span></a>
    </td></tr></table>`;
}

function divider() {
  return `<div style="height:1px;background:#f0eef9;margin:24px 0;"></div>`;
}

function infoRow(label: string, value: string) {
  const safeLabel = escapeHtml(label);
  const safeValue = escapeHtml(value);
  return `<tr>
    <td style="padding:10px 14px;font-size:12px;color:#9b8fc2;border-bottom:1px solid #fafafe;">${safeLabel}</td>
    <td style="padding:10px 14px;font-size:12px;font-weight:700;color:#1a1230;text-align:right;border-bottom:1px solid #fafafe;">${safeValue}</td>
  </tr>`;
}

// ── Templates ────────────────────────────────────────────────────────────────

export function verificationEmail(url: string) {
  const safeUrl = escapeHtml(url);
  return layout(
    `
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#1a1230;">Verify your email</h1>
    <p style="margin:0 0 4px;font-size:14px;color:#9b8fc2;line-height:1.7;">
      You're one step away from accessing the best subscription deals in South Africa.
    </p>
    ${btn("Verify Email Address", safeUrl)}
    <p style="margin:12px 0 6px;font-size:12px;color:#c4b5fd;">Or paste this link into your browser:</p>
    <p style="margin:0;font-size:11px;color:#b8addb;word-break:break-all;background:#fafafe;padding:10px 14px;border-radius:8px;border:1px solid #f0eef9;">${safeUrl}</p>
    ${divider()}
    <p style="margin:0;font-size:12px;color:#d8d0f8;">Expires in <strong>24 hours</strong>. Didn't sign up? Ignore this.</p>
  `,
    "If you didn't create a DiscountZAR account, ignore this email.",
  );
}

export function passwordResetEmail(url: string) {
  const safeUrl = escapeHtml(url);
  return layout(
    `
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#1a1230;">Reset your password</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#9b8fc2;line-height:1.7;">
      We received a password reset request for your account. Click below to set a new password.
    </p>
    ${btn("Reset Password", safeUrl)}
    ${divider()}
    <p style="margin:0;font-size:12px;color:#d8d0f8;">Expires in <strong>1 hour</strong>. Didn't request this? Your account is safe.</p>
  `,
    "If you didn't request a password reset, ignore this email.",
  );
}

export function welcomeEmail(username: string) {
  const safeUsername = escapeHtml(username);
  return layout(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#1a1230;">Welcome to DiscountZAR 🎉</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#9b8fc2;line-height:1.7;">
      Hey <strong style="color:#1a1230;">@${safeUsername}</strong> — your account is verified. You can now browse and purchase premium subscription slots at a fraction of the retail price.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;background:#fafafe;border:1.5px solid #f0eef9;border-radius:14px;margin-bottom:24px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#c4b5fd;">What you can do now</p>
        ${[
          "Browse Netflix, Spotify, YouTube Premium & more",
          "Purchase a slot and receive credentials instantly",
          "Fund your wallet and manage your balance",
          "Contact support anytime at support@discountzar.com",
        ]
          .map(
            (t) =>
              `<p style="margin:0 0 9px;font-size:13px;color:#475569;"><span style="color:#7c5cfc;font-weight:700;">✓</span>  ${t}</p>`,
          )
          .join("")}
      </td></tr>
    </table>
    ${btn("Browse Available Slots", "https://discountzar.com")}
  `);
}

export function purchaseEmail(opts: {
  username: string;
  serviceName: string;
  price: number;
  masterEmail: string;
  masterPassword: string;
  fulfillmentType: string;
}) {
  const safeUsername = escapeHtml(opts.username);
  const safeServiceName = escapeHtml(opts.serviceName);
  const safeMasterEmail = escapeHtml(opts.masterEmail);
  const safeMasterPassword = escapeHtml(opts.masterPassword);
  const credLabel =
    opts.fulfillmentType === "Invite Link"
      ? "Invite Link"
      : opts.fulfillmentType === "OTP / Instruction"
        ? "Instructions"
        : "Password";
  const safeCredLabel = escapeHtml(credLabel);
  const safeFulfillmentType = escapeHtml(opts.fulfillmentType);

  return layout(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#1a1230;">Your slot is ready! 🚀</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#9b8fc2;line-height:1.7;">
      Hey <strong style="color:#1a1230;">@${safeUsername}</strong> — purchase successful. Here are your credentials.
    </p>

    <table cellpadding="0" cellspacing="0" style="width:100%;background:linear-gradient(135deg,#1a1230,#2d1f6e);border-radius:16px;margin-bottom:24px;">
      <tr><td style="padding:24px 28px;">
        <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:rgba(255,255,255,0.3);">Purchased Service</p>
        <p style="margin:0 0 20px;font-size:22px;font-weight:800;color:#fff;">${safeServiceName}</p>
        <table cellpadding="0" cellspacing="0" style="width:100%;">
          <tr><td style="padding:10px 14px;background:rgba(255,255,255,0.06);border-radius:8px 8px 0 0;">
            <p style="margin:0 0 2px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.3);">Email / Login</p>
            <p style="margin:0;font-size:14px;font-weight:700;color:#fff;">${safeMasterEmail}</p>
          </td></tr>
          <tr><td style="padding:10px 14px;background:rgba(255,255,255,0.04);border-radius:0 0 8px 8px;border-top:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0 0 2px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.3);">${safeCredLabel}</p>
            <p style="margin:0;font-size:14px;font-weight:700;color:#a78bfa;font-family:monospace;">${safeMasterPassword}</p>
          </td></tr>
        </table>
      </td></tr>
    </table>

    <table cellpadding="0" cellspacing="0" style="width:100%;background:#fafafe;border:1.5px solid #f0eef9;border-radius:12px;margin-bottom:20px;"><tbody>
      ${infoRow("Amount Charged", `₦${opts.price.toLocaleString()}`)}
      ${infoRow("Service", safeServiceName)}
      ${infoRow("Fulfillment", safeFulfillmentType)}
      ${infoRow("Date", new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }))}
    </tbody></table>

    <p style="margin:0 0 6px;font-size:12px;color:#9b8fc2;line-height:1.6;">
      ⚠️ <strong>Keep these credentials private.</strong> Issues? Email <a href="mailto:support@discountzar.com" style="color:#7c5cfc;">support@discountzar.com</a>
    </p>
    ${btn("Go to Dashboard", "https://discountzar.com")}
  `);
}

export function walletFundedEmail(opts: {
  username: string;
  amount: number;
  newBalance: number;
}) {
  const safeUsername = escapeHtml(opts.username);
  return layout(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#1a1230;">Wallet credited ✅</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#9b8fc2;line-height:1.7;">
      Hey <strong style="color:#1a1230;">@${safeUsername}</strong> — your wallet has been funded.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;background:linear-gradient(135deg,#052e16,#14532d);border-radius:16px;margin-bottom:24px;">
      <tr><td style="padding:28px;text-align:center;">
        <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:rgba(255,255,255,0.35);">Amount Added</p>
        <p style="margin:0;font-size:40px;font-weight:800;color:#34d399;letter-spacing:-0.03em;">₦${opts.amount.toLocaleString()}</p>
      </td></tr>
    </table>
    <table cellpadding="0" cellspacing="0" style="width:100%;background:#fafafe;border:1.5px solid #f0eef9;border-radius:12px;margin-bottom:24px;"><tbody>
      ${infoRow("Amount Credited", `₦${opts.amount.toLocaleString()}`)}
      ${infoRow("New Balance", `₦${opts.newBalance.toLocaleString()}`)}
      ${infoRow("Date", new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }))}
    </tbody></table>
    ${btn("Browse Slots", "https://discountzar.com")}
  `);
}

export function accountBannedEmail(username: string) {
  const safeUsername = escapeHtml(username);
  return layout(
    `
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#1a1230;">Account restricted</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#9b8fc2;line-height:1.7;">
      Hi <strong style="color:#1a1230;">@${safeUsername}</strong> — your account has been restricted due to a terms of service violation.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;background:#fef2f2;border:1.5px solid #fca5a5;border-radius:12px;margin-bottom:24px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0;font-size:13px;color:#991b1b;line-height:1.7;">
          If you believe this is a mistake, contact our support team and we'll review your case within 24–48 hours.
        </p>
      </td></tr>
    </table>
    ${btn("Contact Support", "mailto:support@discountzar.com")}
  `,
    "This is an important account notice from DiscountZAR.",
  );
}

export function accountRestoredEmail(username: string) {
  const safeUsername = escapeHtml(username);
  return layout(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#1a1230;">Account restored ✅</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#9b8fc2;line-height:1.7;">
      Hi <strong style="color:#1a1230;">@${safeUsername}</strong> — your account has been fully restored. Welcome back!
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:12px;margin-bottom:24px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0;font-size:13px;color:#14532d;line-height:1.7;">
          You now have full access to your slots, wallet and dashboard. Please ensure compliance with our terms going forward.
        </p>
      </td></tr>
    </table>
    ${btn("Log In Now", "https://discountzar.com")}
  `);
}

export function adminMessageEmail(opts: {
  username: string;
  subject: string;
  message: string;
}) {
  const safeUsername = escapeHtml(opts.username);
  const safeSubject = escapeHtml(opts.subject);
  const safeMessage = escapeHtml(opts.message);
  return layout(
    `
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#1a1230;">${safeSubject}</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#9b8fc2;">Hi <strong style="color:#1a1230;">@${safeUsername}</strong>,</p>
    <div style="padding:20px 24px;background:#fafafe;border:1.5px solid #f0eef9;border-radius:14px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#475569;line-height:1.8;white-space:pre-wrap;">${safeMessage}</p>
    </div>
    ${divider()}
    <p style="margin:0;font-size:12px;color:#c4b5fd;">
      Sent by the DiscountZAR support team · <a href="mailto:support@discountzar.com" style="color:#7c5cfc;">support@discountzar.com</a>
    </p>
  `,
    "You received this message from the DiscountZAR support team.",
  );
}
