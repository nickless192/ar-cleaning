// utils/email/sesClient.js
const { SESClient } = require("@aws-sdk/client-ses");

function getSesClient() {
  const region = process.env.AWS_REGION;
  if (!region) throw new Error("Missing AWS_REGION");

  return new SESClient({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

module.exports = { getSesClient };