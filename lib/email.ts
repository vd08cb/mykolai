import nodemailer from "nodemailer";

// Brevo SMTP by default; any SMTP provider works with the same variables.
const smtpHost = process.env.SMTP_HOST || "smtp-relay.brevo.com";
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER ?? "";
const smtpPassword = process.env.SMTP_PASSWORD ?? "";
const mailFrom = process.env.MAIL_FROM ?? "";

export const isEmailConfigured = Boolean(smtpUser && smtpPassword && mailFrom);

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function sendReservationEmail(args: {
  to: string;
  name: string;
  giftTitle: string;
  shopName: string;
  shopUrl: string;
  siteUrl: string;
}) {
  if (!isEmailConfigured) return false;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPassword },
  });

  const name = escapeHtml(args.name);
  const gift = escapeHtml(args.giftTitle);
  const shop = escapeHtml(args.shopName);

  await transporter.sendMail({
    from: `"Вішліст до Миколая" <${mailFrom}>`,
    to: args.to,
    subject: `Ти забронював(-ла) ${args.giftTitle}`,
    text:
      `Привіт, ${args.name}!\n\n` +
      `Ти забронював(-ла) подарунок «${args.giftTitle}». Інші бачать, що він уже зайнятий.\n\n` +
      `Де купити (${args.shopName}): ${args.shopUrl}\n` +
      `Вішліст: ${args.siteUrl}\n\n` +
      `Якщо передумаєш, увійди на сайт і натисни «Скасувати» на цьому подарунку.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0b1630;color:#f3efe4;border-radius:14px;padding:28px">
        <p style="margin:0 0 6px;color:#f2c14e;font-size:13px;letter-spacing:2px;text-transform:uppercase">Вішліст до Миколая</p>
        <h1 style="margin:0 0 18px;font-size:22px">Привіт, ${name}!</h1>
        <p style="margin:0 0 14px;line-height:1.5">Ти забронював(-ла) подарунок <b>«${gift}»</b>. Інші бачать, що він уже зайнятий.</p>
        <p style="margin:0 0 22px">
          <a href="${args.shopUrl}" style="display:inline-block;background:#f2c14e;color:#0b1630;text-decoration:none;font-weight:bold;padding:12px 18px;border-radius:8px">Переглянути в ${shop}</a>
        </p>
        <p style="margin:0;color:#aab3c8;font-size:13px;line-height:1.5">Якщо передумаєш, увійди на <a href="${args.siteUrl}" style="color:#f2c14e">сайт</a> і натисни «Скасувати» на цьому подарунку.</p>
      </div>`,
  });
  return true;
}
