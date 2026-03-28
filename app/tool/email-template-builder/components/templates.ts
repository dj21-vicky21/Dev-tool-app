export type TemplateId =
  | "welcome"
  | "password-reset"
  | "newsletter"
  | "invoice"
  | "promotional"
  | "notification";

export interface TemplateConfig {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  heading: string;
  bodyText: string;
  buttonText: string;
  buttonUrl: string;
  footerText: string;
  unsubscribeText: string;
  unsubscribeUrl: string;
  greetingPrefix: string;
  recipientName: string;
  // Password reset / Notification
  iconEmoji: string;
  iconBgColor: string;
  securityNote: string;
  // Newsletter
  sectionLabel: string;
  featureImageText: string;
  articleTitle: string;
  articleSummary: string;
  // Invoice
  invoiceNumber: string;
  invoiceDate: string;
  invoiceItems: { description: string; qty: number; price: number }[];
  invoiceTotalLabel: string;
  invoiceItemLabel: string;
  invoiceQtyLabel: string;
  invoiceAmountLabel: string;
  currencySymbol: string;
  // Promotional
  discountCode: string;
  discountAmount: string;
  promoPrefix: string;
  promoSuffix: string;
}

export const TEMPLATE_DEFAULTS: Record<TemplateId, Partial<TemplateConfig>> = {
  welcome: {
    heading: "Welcome aboard!",
    bodyText:
      "We're thrilled to have you join us. Your account is all set up and ready to go. Explore the platform and discover everything we have to offer.",
    buttonText: "Get Started",
    buttonUrl: "https://example.com/dashboard",
    recipientName: "Alex",
    greetingPrefix: "Hi",
  },
  "password-reset": {
    heading: "Reset your password",
    bodyText:
      "We received a request to reset the password for your account. Click the button below to set a new password. This link will expire in 1 hour.",
    buttonText: "Reset Password",
    buttonUrl: "https://example.com/reset?token=abc123",
    recipientName: "Alex",
    greetingPrefix: "Hi",
    securityNote:
      "If you didn\u2019t request this, you can safely ignore this email.",
    iconEmoji: "\u{1F512}",
  },
  newsletter: {
    heading: "This Week's Highlights",
    bodyText:
      "Here's a roundup of the latest updates, features, and articles curated just for you.",
    buttonText: "Read More",
    buttonUrl: "https://example.com/blog",
    articleTitle: "Introducing Our New Dashboard",
    articleSummary:
      "We've completely redesigned the dashboard experience with faster analytics, better navigation, and a brand-new dark mode.",
    recipientName: "Reader",
    greetingPrefix: "Hi",
    sectionLabel: "Newsletter",
    featureImageText: "Featured Image Area",
  },
  invoice: {
    heading: "Invoice #INV-2026-0042",
    bodyText: "Thank you for your purchase. Here is a summary of your order.",
    buttonText: "View Invoice Online",
    buttonUrl: "https://example.com/invoice/42",
    invoiceNumber: "INV-2026-0042",
    invoiceDate: "March 21, 2026",
    invoiceItems: [
      { description: "Pro Plan (Annual)", qty: 1, price: 199.0 },
      { description: "Extra Storage (50 GB)", qty: 2, price: 9.99 },
    ],
    recipientName: "Alex",
    greetingPrefix: "Hi",
    invoiceTotalLabel: "Total",
    invoiceItemLabel: "Item",
    invoiceQtyLabel: "Qty",
    invoiceAmountLabel: "Amount",
    currencySymbol: "$",
  },
  promotional: {
    heading: "Spring Sale is Here!",
    bodyText:
      "For a limited time, enjoy an exclusive discount on all our plans. Don't miss out on this incredible deal!",
    buttonText: "Shop Now",
    buttonUrl: "https://example.com/sale",
    discountCode: "SPRING2026",
    discountAmount: "30%",
    recipientName: "Valued Customer",
    promoPrefix: "Use code",
    promoSuffix: "off",
  },
  notification: {
    heading: "New login detected",
    bodyText:
      "We noticed a new sign-in to your account from a Chrome browser on macOS. If this was you, no action is needed.",
    buttonText: "Review Activity",
    buttonUrl: "https://example.com/security",
    recipientName: "Alex",
    greetingPrefix: "Hi",
    iconEmoji: "\uD83D\uDD14",
    iconBgColor: "#FEF3C7",
  },
};

export const SHARED_DEFAULTS: TemplateConfig = {
  companyName: "Acme Inc",
  logoUrl: "",
  primaryColor: "#4F46E5",
  backgroundColor: "#F3F4F6",
  textColor: "#1F2937",
  heading: "",
  bodyText: "",
  buttonText: "",
  buttonUrl: "#",
  footerText: "\u00A9 2026 Acme Inc. All rights reserved.",
  unsubscribeText: "Unsubscribe",
  unsubscribeUrl: "#",
  greetingPrefix: "Hi",
  recipientName: "Alex",
  iconEmoji: "\uD83D\uDD14",
  iconBgColor: "#FEF3C7",
  securityNote:
    "If you didn\u2019t request this, you can safely ignore this email.",
  sectionLabel: "Newsletter",
  featureImageText: "Featured Image Area",
  articleTitle: "",
  articleSummary: "",
  invoiceNumber: "",
  invoiceDate: "",
  invoiceItems: [],
  invoiceTotalLabel: "Total",
  invoiceItemLabel: "Item",
  invoiceQtyLabel: "Qty",
  invoiceAmountLabel: "Amount",
  currencySymbol: "$",
  discountCode: "",
  discountAmount: "",
  promoPrefix: "Use code",
  promoSuffix: "off",
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function logoBlock(c: TemplateConfig): string {
  if (c.logoUrl) {
    return `<img src="${c.logoUrl}" alt="${c.companyName}" width="140" style="display:block;margin:0 auto;" />`;
  }
  return `<span style="font-size:24px;font-weight:700;color:${c.primaryColor};">${c.companyName}</span>`;
}

function footerBlock(c: TemplateConfig): string {
  return `
    <tr>
      <td style="padding:30px 40px;text-align:center;font-size:12px;color:#9CA3AF;">
        ${c.footerText}<br/>
        <a href="${c.unsubscribeUrl}" style="color:#9CA3AF;text-decoration:underline;">${c.unsubscribeText}</a>
      </td>
    </tr>`;
}

function buttonBlock(c: TemplateConfig): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
      <tr>
        <td style="background:${c.primaryColor};border-radius:6px;">
          <a href="${c.buttonUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
            ${c.buttonText}
          </a>
        </td>
      </tr>
    </table>`;
}

function wrapEmail(c: TemplateConfig, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${c.heading}</title>
</head>
<body style="margin:0;padding:0;background-color:${c.backgroundColor};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${c.backgroundColor};">
    <tr>
      <td align="center" style="padding:30px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          ${body}
          ${footerBlock(c)}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Template generators ────────────────────────────────────────────────────────

function welcomeTemplate(c: TemplateConfig): string {
  const body = `
    <tr>
      <td style="padding:40px 40px 20px;text-align:center;background:${lighten(c.primaryColor, 0.35)};">
        ${logoBlock(c)}
      </td>
    </tr>
    <tr>
      <td style="padding:32px 40px 0;text-align:center;">
        <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:${c.textColor};">${c.heading}</h1>
        <p style="margin:0;font-size:15px;color:#6B7280;">${c.greetingPrefix} ${c.recipientName},</p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 40px 0;font-size:15px;line-height:1.6;color:${c.textColor};">
        ${c.bodyText}
      </td>
    </tr>
    <tr>
      <td style="padding:8px 40px 32px;text-align:center;">
        ${buttonBlock(c)}
      </td>
    </tr>`;
  return wrapEmail(c, body);
}

function passwordResetTemplate(c: TemplateConfig): string {
  const body = `
    <tr>
      <td style="padding:40px 40px 20px;text-align:center;">
        ${logoBlock(c)}
      </td>
    </tr>
    <tr>
      <td style="padding:16px 40px 0;text-align:center;">
        <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background:${lighten(c.primaryColor, 0.35)};line-height:56px;font-size:28px;text-align:center;">${c.iconEmoji}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 40px 0;text-align:center;">
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:${c.textColor};">${c.heading}</h1>
        <p style="margin:0;font-size:15px;color:#6B7280;">${c.greetingPrefix} ${c.recipientName},</p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 40px 0;font-size:15px;line-height:1.6;color:${c.textColor};">
        ${c.bodyText}
      </td>
    </tr>
    <tr>
      <td style="padding:8px 40px 0;text-align:center;">
        ${buttonBlock(c)}
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 32px;font-size:13px;color:#9CA3AF;text-align:center;">
        ${c.securityNote}
      </td>
    </tr>`;
  return wrapEmail(c, body);
}

function newsletterTemplate(c: TemplateConfig): string {
  const body = `
    <tr>
      <td style="padding:40px 40px 20px;text-align:center;background:${c.primaryColor};">
        ${c.logoUrl ? `<img src="${c.logoUrl}" alt="${c.companyName}" width="140" style="display:block;margin:0 auto;" />` : `<span style="font-size:24px;font-weight:700;color:#ffffff;">${c.companyName}</span>`}
      </td>
    </tr>
    <tr>
      <td style="padding:32px 40px 0;">
        <p style="margin:0 0 4px;font-size:13px;text-transform:uppercase;letter-spacing:1px;color:${c.primaryColor};font-weight:600;">${c.sectionLabel}</p>
        <h1 style="margin:0;font-size:26px;font-weight:700;color:${c.textColor};">${c.heading}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 40px 0;font-size:15px;line-height:1.6;color:${c.textColor};">
        ${c.greetingPrefix} ${c.recipientName}, ${c.bodyText}
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:${lighten(c.primaryColor, 0.35)};height:160px;text-align:center;font-size:14px;color:#6B7280;">
              ${c.featureImageText}
            </td>
          </tr>
          <tr>
            <td style="padding:20px;">
              <h2 style="margin:0 0 8px;font-size:18px;font-weight:600;color:${c.textColor};">${c.articleTitle}</h2>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#6B7280;">${c.articleSummary}</p>
              <a href="${c.buttonUrl}" style="font-size:14px;font-weight:600;color:${c.primaryColor};text-decoration:none;">${c.buttonText} &rarr;</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
  return wrapEmail(c, body);
}

function invoiceTemplate(c: TemplateConfig): string {
  const items = c.invoiceItems;
  const subtotal = items.reduce((sum, it) => sum + it.qty * it.price, 0);

  const rows = items
    .map(
      (it) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #E5E7EB;font-size:14px;color:${c.textColor};">${it.description}</td>
        <td style="padding:10px 0;border-bottom:1px solid #E5E7EB;font-size:14px;color:${c.textColor};text-align:center;">${it.qty}</td>
        <td style="padding:10px 0;border-bottom:1px solid #E5E7EB;font-size:14px;color:${c.textColor};text-align:right;">${c.currencySymbol}${(it.qty * it.price).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const body = `
    <tr>
      <td style="padding:40px 40px 20px;text-align:center;">
        ${logoBlock(c)}
      </td>
    </tr>
    <tr>
      <td style="padding:16px 40px 0;text-align:center;">
        <h1 style="margin:0 0 4px;font-size:24px;font-weight:700;color:${c.textColor};">${c.heading}</h1>
        <p style="margin:0;font-size:14px;color:#6B7280;">${c.invoiceDate}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 40px 0;font-size:15px;line-height:1.6;color:${c.textColor};">
        ${c.greetingPrefix} ${c.recipientName}, ${c.bodyText}
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr style="background:${lighten(c.primaryColor, 0.35)};">
            <td style="padding:10px 12px;font-size:13px;font-weight:600;color:${c.textColor};">${c.invoiceItemLabel}</td>
            <td style="padding:10px 12px;font-size:13px;font-weight:600;color:${c.textColor};text-align:center;">${c.invoiceQtyLabel}</td>
            <td style="padding:10px 12px;font-size:13px;font-weight:600;color:${c.textColor};text-align:right;">${c.invoiceAmountLabel}</td>
          </tr>
          ${rows}
          <tr>
            <td colspan="2" style="padding:12px 0;font-size:15px;font-weight:700;color:${c.textColor};">${c.invoiceTotalLabel}</td>
            <td style="padding:12px 0;font-size:15px;font-weight:700;color:${c.primaryColor};text-align:right;">${c.currencySymbol}${subtotal.toFixed(2)}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 32px;text-align:center;">
        ${buttonBlock(c)}
      </td>
    </tr>`;
  return wrapEmail(c, body);
}

function promotionalTemplate(c: TemplateConfig): string {
  const body = `
    <tr>
      <td style="padding:40px 40px 24px;text-align:center;background:linear-gradient(135deg, ${c.primaryColor}, ${lighten(c.primaryColor, 0.15)});">
        ${c.logoUrl ? `<img src="${c.logoUrl}" alt="${c.companyName}" width="140" style="display:block;margin:0 auto 16px;" />` : `<div style="font-size:24px;font-weight:700;color:#ffffff;margin-bottom:16px;">${c.companyName}</div>`}
        <h1 style="margin:0;font-size:30px;font-weight:800;color:#ffffff;">${c.heading}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 40px 0;font-size:15px;line-height:1.6;color:${c.textColor};text-align:center;">
        ${c.bodyText}
      </td>
    </tr>
    <tr>
      <td style="padding:20px 40px;text-align:center;">
        <div style="display:inline-block;padding:12px 24px;border:2px dashed ${c.primaryColor};border-radius:8px;background:${lighten(c.primaryColor, 0.38)};">
          <span style="font-size:13px;color:#6B7280;">${c.promoPrefix}</span><br/>
          <span style="font-size:22px;font-weight:800;color:${c.primaryColor};letter-spacing:2px;">${c.discountCode}</span><br/>
          <span style="font-size:13px;color:#6B7280;">for ${c.discountAmount} ${c.promoSuffix}</span>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 40px 32px;text-align:center;">
        ${buttonBlock(c)}
      </td>
    </tr>`;
  return wrapEmail(c, body);
}

function notificationTemplate(c: TemplateConfig): string {
  const body = `
    <tr>
      <td style="padding:40px 40px 20px;text-align:center;">
        ${logoBlock(c)}
      </td>
    </tr>
    <tr>
      <td style="padding:16px 40px 0;text-align:center;">
        <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background:${c.iconBgColor};line-height:56px;font-size:28px;text-align:center;">${c.iconEmoji}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 40px 0;text-align:center;">
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:${c.textColor};">${c.heading}</h1>
        <p style="margin:0;font-size:15px;color:#6B7280;">${c.greetingPrefix} ${c.recipientName},</p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 40px 0;font-size:15px;line-height:1.6;color:${c.textColor};">
        ${c.bodyText}
      </td>
    </tr>
    <tr>
      <td style="padding:8px 40px 32px;text-align:center;">
        ${buttonBlock(c)}
      </td>
    </tr>`;
  return wrapEmail(c, body);
}

export function generateTemplate(
  templateId: TemplateId,
  config: TemplateConfig
): string {
  switch (templateId) {
    case "welcome":
      return welcomeTemplate(config);
    case "password-reset":
      return passwordResetTemplate(config);
    case "newsletter":
      return newsletterTemplate(config);
    case "invoice":
      return invoiceTemplate(config);
    case "promotional":
      return promotionalTemplate(config);
    case "notification":
      return notificationTemplate(config);
    default:
      return welcomeTemplate(config);
  }
}

export const TEMPLATE_META: {
  id: TemplateId;
  label: string;
  description: string;
}[] = [
  {
    id: "welcome",
    label: "Welcome",
    description: "Onboarding email for new users",
  },
  {
    id: "password-reset",
    label: "Password Reset",
    description: "Account password reset request",
  },
  {
    id: "newsletter",
    label: "Newsletter",
    description: "Weekly or monthly content digest",
  },
  {
    id: "invoice",
    label: "Invoice",
    description: "Purchase receipt and order summary",
  },
  {
    id: "promotional",
    label: "Promotional",
    description: "Sales, offers, and discount campaigns",
  },
  {
    id: "notification",
    label: "Notification",
    description: "System alerts and account activity",
  },
];
