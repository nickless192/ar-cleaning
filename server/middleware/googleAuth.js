// googleAuth.js
const { google } = require("googleapis");
require('dotenv').config();

function getAuthClient() {
    console.log("Creating OAuth2 client");
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
    // redirect URI is only needed for the initial token exchange, not for using refresh_token
  );

  oAuth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return oAuth2Client;
}

module.exports = { getAuthClient };