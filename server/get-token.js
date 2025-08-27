const { google } = require("googleapis");
// const open = require("open");
const readline = require("readline");
require('dotenv').config();

// load from your JSON file or env vars:
const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0] // e.g. "http://localhost:3000/oauth2callback" or "http://127.0.0.1:PORT"
);

const SCOPES = ["https://www.googleapis.com/auth/business.manage"];

async function main() {
  const open = (await import("open")).default; // dynamic import
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",  
  });

  console.log("Authorize this app by visiting this url:", authUrl);
  await open(authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the code from that page here: ", async (code) => {
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      console.log("Tokens acquired:", tokens);

      // Will include refresh_token (save it!)
      // e.g. save to your .env or DB
    } catch (err) {
      console.error("Error retrieving tokens:", err);
    }
    rl.close();
  });
}

main();