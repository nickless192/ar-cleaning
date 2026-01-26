// utils/sendInvoiceEmail.js
const sgMail = require("@sendgrid/mail");
const fs = require("fs");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function toBase64Content(att) {
  // Case A: already SendGrid-ready with content
  if (typeof att?.content === "string" && att.content.trim()) {
    return att.content.trim();
  }

  // Case B: provided a Buffer
  if (Buffer.isBuffer(att?.buffer)) {
    return att.buffer.toString("base64");
  }

  // Case C: provided a file path
  if (typeof att?.path === "string" && att.path.trim()) {
    const fileBuf = fs.readFileSync(att.path);
    return fileBuf.toString("base64");
  }

  return null;
}

function normalizeAttachments(attachments = []) {
  if (!Array.isArray(attachments)) return [];

  const normalized = attachments
    .map((att, idx) => {
      const content = toBase64Content(att);
      if (!content) return { __invalid: true, idx, att };

      return {
        content,
        filename: att.filename || `attachment-${idx + 1}`,
        type: att.type || "application/octet-stream",
        disposition: att.disposition || "attachment",
      };
    });

  const invalid = normalized.filter(a => a.__invalid);
  if (invalid.length) {
    // helpful error that tells you exactly which attachment is broken
    const details = invalid.map(x => ({
      idx: x.idx,
      keys: x.att ? Object.keys(x.att) : null,
      filename: x.att?.filename,
      hasContent: typeof x.att?.content,
      hasPath: typeof x.att?.path,
      hasBuffer: Buffer.isBuffer(x.att?.buffer),
    }));
    throw new Error(
      "Invalid attachment(s): each must include `content` (base64 string) OR `path` OR `buffer`. Details: " +
        JSON.stringify(details)
    );
  }

  return normalized;
}

const sendInvoiceEmail = async ({ to, subject, text, html, attachments = [] }) => {
  if (!to) throw new Error("Missing email recipient");
  if (!subject) throw new Error("Missing email subject");

  const msg = {
    to,
    from: process.env.MAIL_FROM || "no-reply@cleanarsolutions.ca",
    subject,
    text,
    html,
    attachments: normalizeAttachments(attachments),
  };

  const [response] = await sgMail.send(msg);
  return response;
};

module.exports = { sendInvoiceEmail };
