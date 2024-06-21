const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const path = require("path");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const MongoStore = require('connect-mongo');
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/User");

const app = express();
const port = 8080;

// Parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Set up EJS for templating
app.set("views", path.join(__dirname, "views"));
app.engine("html", ejs.renderFile);
app.set("view engine", "ejs");

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB
mongoose.connect(process.env["db"])
  .then(() => console.log("MongoDB connected"))
  .catch(error => console.error("MongoDB connection error:", error));

// Configure session
app.use(session({
  secret: "blingo",
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env['db'] }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    secure: false, // set to true if using https
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new GoogleStrategy({
  clientID: process.env["Client_ID"],
  clientSecret: process.env["Client_secret"],
  callbackURL: "https://www.blingo.tech/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  console.log('Google profile:', profile);
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (user) {
      if (!user.apiKey) {
        user.apiKey = crypto.randomBytes(20).toString("hex");
        await user.save();
      }
      return done(null, user);
    }
    user = await User.create({
      googleId: profile.id,
      displayName: profile.displayName,
      email: profile.emails[0].value,
      photo: profile.photos[0].value,
      apiKey: crypto.randomBytes(20).toString("hex")
    });
    done(null, user);
  } catch (err) {
    console.error(err);
    done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  console.log('Serializing user:', user);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    console.log('Deserializing user:', user);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Routes
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard");
  });

app.get("/dashboard", ensureAuthenticated, (req, res) => {
  console.log('Dashboard route accessed, user:', req.user);
  res.render("dash", { user: req.user });
});

app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

app.get("/logout", (req, res) => {
  req.logout(err => {
    if (err) { return next(err); }
    res.redirect("/");
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/auth/google");
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
