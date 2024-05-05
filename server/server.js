const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
// setting up middleware for url encoded, json and to serve static files
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static('public'));

// Serve up static assets
app.use('/images', express.static(path.join(__dirname, '../client/src/assets')));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// enable routes
app.use(require('./routes'));

// connect to mongo
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ar-cleaning',{
    useNewUrlParser: true,
    useUnifiedTopology: true
}) ;

// logs MongoDB statements that are executed
mongoose.set('debug',true);


// listening to port
app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));