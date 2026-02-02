const express = require('express');
const compression = require('compression');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const trackVisitor = require('./utils/trackVisitor');
const cookieParser = require("cookie-parser");

app = express();
const PORT = process.env.PORT || 3001;

// compress all responses
app.use(compression());
app.use(cors());
// setting up middleware for url encoded, json and to serve static files
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static('public'));
app.use(express.json({ limit: "1mb" }));

// Serve up static assets
app.use('/images', express.static(path.join(__dirname, '../client/src/assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

}
app.use(cookieParser());
// enable routes
// app.use(trackVisitor);
app.use(require('./routes'));

// // DO NOT COMMENT OUT THIS CODE - this makes the index page get the /GET error
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// app.get("/oauth2callback", async (req, res) => {
//   const { code } = req.query;
//   const { tokens } = await oAuth2Client.getToken(code);
//   console.log("Tokens:", tokens);
//   res.send("Tokens acquired, you can close this window.");
// });
app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    console.log("Tokens:", tokens);
    // Save tokens.refresh_token somewhere safe
    res.send("✅ Auth successful, you can close this tab!");
  } catch (err) {
    console.error("Error exchanging code:", err);
    res.status(500).send("Error exchanging code");
  }
});


// connect to mongo
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ar-cleaning-local') ;

// logs MongoDB statements that are executed
mongoose.set('debug',true);


// listening to port
app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));