// // utils/email/sendEmail.js
// const { SendEmailCommand } = require("@aws-sdk/client-ses");
// const { getSesClient } = require("./sesClient");

// function assertEmail(value, fieldName) {
//   if (!value || typeof value !== "string" || !value.includes("@")) {
//     throw new Error(`Invalid ${fieldName}`);
//   }
// }

// async function sendEmail({
//   to,
//   subject,
//   html,
//   text,
//   from = process.env.MAIL_FROM,
//   replyTo = process.env.MAIL_REPLY_TO,
//   attachments, // to be implemented now
// }) {
//   if (!Array.isArray(to) || to.length === 0) {
//     throw new Error("sendEmail: 'to' must be a non-empty array");
//   }

//   assertEmail(from, "from");

//   const cleanedTo = to
//     .filter(Boolean)
//     .map((x) => String(x).trim())
//     .filter((x) => x.includes("@"));

//   if (cleanedTo.length === 0) throw new Error("sendEmail: no valid recipients");

//   if (!subject || typeof subject !== "string") throw new Error("sendEmail: subject required");
//   if (!html && !text) throw new Error("sendEmail: either html or text is required");

//   const client = getSesClient();

//   const params = {
//     Source: from,
//     Destination: { ToAddresses: cleanedTo },
//     Message: {
//       Subject: { Data: subject, Charset: "UTF-8" },
//       Body: {
//         ...(html ? { Html: { Data: html, Charset: "UTF-8" } } : {}),
//         ...(text ? { Text: { Data: text, Charset: "UTF-8" } } : {}),
//       },
//     },
//     ...(replyTo ? { ReplyToAddresses: [replyTo] } : {}),
//     ...(attachments && attachments.length > 0 ? { Attachments: attachments } : {}),
//   };

//   try {
//     const res = await client.send(new SendEmailCommand(params));
//     // res.MessageId is your “usage evidence” + debugging handle
//     return { messageId: res.MessageId };
//   } catch (err) {
//     // Helpful logging for AWS errors
//     const details = {
//       name: err?.name,
//       message: err?.message,
//       $metadata: err?.$metadata,
//     };
//     console.error("SES sendEmail failed:", details);
//     throw err;
//   }
// }

// module.exports = { sendEmail };

// utils/email/sendEmail.js
const crypto = require("crypto");
const { SendRawEmailCommand } = require("@aws-sdk/client-ses");
const { getSesClient } = require("./sesClient");

function assertEmail(value, fieldName) {
  if (!value || typeof value !== "string" || !value.includes("@")) {
    throw new Error(`Invalid ${fieldName}`);
  }
}

function sanitizeHeaderValue(v) {
  // prevent header injection
  return String(v || "").replace(/[\r\n]+/g, " ").trim();
}

function toBase64Lines(buffer) {
  // base64 with 76-char lines (safe for email transports)
  return buffer.toString("base64").replace(/(.{76})/g, "$1\r\n");
}

function normalizeAttachments(attachments) {
  if (!attachments) return [];
  if (!Array.isArray(attachments)) throw new Error("sendEmail: attachments must be an array");

  return attachments
    .filter(Boolean)
    .map((a, idx) => {
      const filename = sanitizeHeaderValue(a.filename || `attachment-${idx + 1}`);
      const contentType = sanitizeHeaderValue(a.contentType || "application/octet-stream");

      let contentBuffer = null;

      if (Buffer.isBuffer(a.content)) {
        contentBuffer = a.content;
      } else if (typeof a.content === "string") {
        // allow passing base64 as string (but prefer contentBase64 for clarity)
        contentBuffer = Buffer.from(a.content, "base64");
      } else if (typeof a.contentBase64 === "string") {
        contentBuffer = Buffer.from(a.contentBase64, "base64");
      }

      if (!contentBuffer || !Buffer.isBuffer(contentBuffer) || contentBuffer.length === 0) {
        throw new Error(`sendEmail: attachment "${filename}" missing valid content (Buffer or base64)`);
      }

      return { filename, contentType, contentBuffer };
    });
}

function buildRawMime({ from, to, subject, html, text, replyTo, attachments }) {
  const mixedBoundary = `mixed_${crypto.randomBytes(12).toString("hex")}`;

  // If both html and text exist, embed multipart/alternative inside multipart/mixed
  const hasAlt = Boolean(html && text);
  const altBoundary = hasAlt ? `alt_${crypto.randomBytes(12).toString("hex")}` : null;

  const safeFrom = sanitizeHeaderValue(from);
  const safeSubject = sanitizeHeaderValue(subject);
  const safeReplyTo = replyTo ? sanitizeHeaderValue(replyTo) : null;
  const safeTo = (Array.isArray(to) ? to : [to]).map(sanitizeHeaderValue).join(", ");

  const headers = [
    `From: ${safeFrom}`,
    `To: ${safeTo}`,
    `Subject: ${safeSubject}`,
    "MIME-Version: 1.0",
    safeReplyTo ? `Reply-To: ${safeReplyTo}` : null,
    `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`,
  ]
    .filter(Boolean)
    .join("\r\n");

  const parts = [];

  // --- Body part(s)
  if (hasAlt) {
    // multipart/alternative wrapper
    parts.push(
      `--${mixedBoundary}\r\n` +
        `Content-Type: multipart/alternative; boundary="${altBoundary}"\r\n\r\n` +

        // text part
        `--${altBoundary}\r\n` +
        `Content-Type: text/plain; charset="UTF-8"\r\n` +
        `Content-Transfer-Encoding: 7bit\r\n\r\n` +
        `${text}\r\n\r\n` +

        // html part
        `--${altBoundary}\r\n` +
        `Content-Type: text/html; charset="UTF-8"\r\n` +
        `Content-Transfer-Encoding: 7bit\r\n\r\n` +
        `${html}\r\n\r\n` +

        `--${altBoundary}--\r\n`
    );
  } else if (html) {
    parts.push(
      `--${mixedBoundary}\r\n` +
        `Content-Type: text/html; charset="UTF-8"\r\n` +
        `Content-Transfer-Encoding: 7bit\r\n\r\n` +
        `${html}\r\n`
    );
  } else {
    parts.push(
      `--${mixedBoundary}\r\n` +
        `Content-Type: text/plain; charset="UTF-8"\r\n` +
        `Content-Transfer-Encoding: 7bit\r\n\r\n` +
        `${text || ""}\r\n`
    );
  }

  // --- Attachments
  for (const a of attachments) {
    const b64 = toBase64Lines(a.contentBuffer);
    parts.push(
      `--${mixedBoundary}\r\n` +
        `Content-Type: ${a.contentType}; name="${a.filename}"\r\n` +
        `Content-Disposition: attachment; filename="${a.filename}"\r\n` +
        `Content-Transfer-Encoding: base64\r\n\r\n` +
        `${b64}\r\n`
    );
  }

  // --- Closing boundary
  parts.push(`--${mixedBoundary}--`);

  return `${headers}\r\n\r\n${parts.join("")}`;
}

async function sendEmail({
  to,
  subject,
  html,
  text,
  from = process.env.MAIL_FROM,
  replyTo = process.env.MAIL_REPLY_TO,
  attachments, // now supported
}) {
  // add a handler in case to is passed as a single string by mistake
  if (!Array.isArray(to) || to.length === 0) {
    // throw new Error("sendEmail: 'to' must be a non-empty array");
    if (typeof to === "string" && to.includes("@")) {
      to = [to];
    } else {
      throw new Error("sendEmail: 'to' must be a non-empty array or a valid email string");
    }
  }

  assertEmail(from, "from");

  const cleanedTo = to
    .filter(Boolean)
    .map((x) => String(x).trim())
    .filter((x) => x.includes("@"));

  if (cleanedTo.length === 0) throw new Error("sendEmail: no valid recipients");
  if (!subject || typeof subject !== "string") throw new Error("sendEmail: subject required");
  if (!html && !text) throw new Error("sendEmail: either html or text is required");

  const normalizedAttachments = normalizeAttachments(attachments);

  const client = getSesClient();

  const raw = buildRawMime({
    from,
    to: cleanedTo,
    subject,
    html,
    text,
    replyTo,
    attachments: normalizedAttachments,
  });

  const params = {
    Source: from,
    Destinations: cleanedTo, // optional but helpful
    RawMessage: { Data: Buffer.from(raw) },
  };

  try {
    const res = await client.send(new SendRawEmailCommand(params));
    return { messageId: res.MessageId };
  } catch (err) {
    const details = {
      name: err?.name,
      message: err?.message,
      $metadata: err?.$metadata,
    };
    console.error("SES sendRawEmail failed:", details);
    throw err;
  }
}

module.exports = { sendEmail };