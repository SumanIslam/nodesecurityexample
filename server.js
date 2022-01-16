const fs = require('fs');
const path = require('path');
const https = require('https');

const express = require('express');
const helmet = require('helmet');
const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');

require('dotenv').config();

const PORT = 3000;

const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET
}

const OAUTH_OPTIONS = {
  callbackURL: '/auth/google/callback',
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
}

function verifyCallback(accessToken, refreshToken, profile, done) {
  console.log('Google profile', profile);
  done(null, profile);
}

const app = express();

app.use(helmet());
app.use(passport.initialize());
passport.use(new Strategy(OAUTH_OPTIONS, verifyCallback))


function checkLoggedIn(req, res, next) {
  const loggedIn = true; // TODO:
  if(!loggedIn) {
    return res.status(401).json({
      error: 'You must log in',
    })
  }
  next();
}

app.get('/auth/google', passport.authenticate('google', {
  scope: ['email']
}));

app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/failure',
  successRedirect: '/',
  session: false,
}), (req, res) => {
  console.log('google called us back!');
  res.redirect('/');
});

app.get('/auth/logout', (req, res) => {});

app.get('/secret', checkLoggedIn, (req, res) => {
  return res.send('Your personal secret value is 42!');
});

app.get('/failure', (req, res) => {
  console.log('login failed');
})


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
}, app).listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
})