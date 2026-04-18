const express = require('express');
const compression = require('compression');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const trackVisitor = require('./utils/trackVisitor');
const cookieParser = require("cookie-parser");
const validateCsrfToken = require('./middleware/validateCsrfToken');

const app = express();
const PORT = process.env.PORT || 3001;

const spaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// compress all responses
app.use(compression());
app.use(cors());
// setting up middleware for url encoded, json and to serve static files
app.use(express.urlencoded({extended: true}));
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

// Serve up static assets
app.use('/images', express.static(path.join(__dirname, '../client/src/assets')));


if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  // serve SPA routes in production without intercepting API requests
  app.get('*', spaLimiter, (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}
app.use(cookieParser());


// CSRF protection for cookie-authenticated state-changing requests.
// Keep bearer-token API clients unaffected: only enforce when auth cookies are present.
app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const hasRefreshCookie = Boolean(req.cookies?.refreshToken);
  const hasCsrfCookie = Boolean(req.cookies?.csrfToken);

  if (!hasRefreshCookie && !hasCsrfCookie) {
    return next();
  }

  return validateCsrfToken(req, res, next);
});
// enable routes
// app.use(trackVisitor);
app.use(require('./routes'));

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
    if (tokens) {
      console.log("OAuth tokens received");
    }
    // Save tokens.refresh_token somewhere safe
    res.send("✅ Auth successful, you can close this tab!");
  } catch (err) {
    console.error("OAuth callback error", err);
    res.status(500).send("Error exchanging code");
  }
});


// connect to mongo
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ar-cleaning-local') ;

// logs MongoDB statements that are executed
if (process.env.NODE_ENV !== 'production') {
  mongoose.set('debug', true);
}


// listening to port
app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
