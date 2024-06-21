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

const createPetpetGif = require("./utils/petpet");
const createWantedImage = require("./utils/wantedGenerator");
const data = require("./jsondata/countries.json");
const data2 = require("./jsondata/country-coords.json");


app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.engine("html", ejs.renderFile);
app.set("view engine", "ejs");


app.use(express.static(path.join(__dirname, "public")));


mongoose.connect(process.env["db"])
  .then(() => console.log("MongoDB connected"))
  .catch(error => console.error("MongoDB connection error:", error));


app.use(session({
  secret: "blingo",
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env['db'] }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, 
    secure: false, 
  }
}));


app.use(passport.initialize());
app.use(passport.session());


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

app.get("/apikey", ensureAuthenticated, (req, res) => {
  res.render("apikey", { user: req.user });
});

// about
app.get("/about", (req, res) => {
  res.render("about", { user: req.user });
});

// terms
app.get("/terms", (req, res) => {
  res.render("terms", { user: req.user });
});

// privacy
app.get("/privacy", (req, res) => {
  res.render("privacy", { user: req.user });
});

app.get("/user/json", async (req, res) => {
  try {
    // Retrieve user data based on API key
    const { apiKey } = req.query;
    const user = await User.findOne({ apiKey });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send user data as JSON response
    res.json({
      googleId: user.googleId,
      displayName: user.displayName,
      email: user.email,
      photo: user.photo,
      tokens: user.tokens,
      tokensLastReset: user.tokensLastReset,
      unlimited: user.unlimited,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
});

// api status route
app.get("/api/status", (req, res) => {
  const status = {
    status: "API is online",
    uptime: process.uptime() + "'s",
  };

  res.json(status);
});

// utility routes here

app.get("/utility", (req, res) => {
  res.render("utility", { user: req.user });
});

// /utility/petpet
app.get("/utility/petpet", async (req, res) => {
  try {
    const { image, resolution, delay, backgroundColor } = req.query;

    if (!image && !resolution && !delay && !backgroundColor) {
      return res.render("petpet_form", {
        user: req.user,
        gifData: null,
        errorMessage: null,
      });
    }

    if (!image || (!image.endsWith(".png") && !image.endsWith(".jpg"))) {
      throw new Error(
        "Valid image URL required. It must end with .png or .jpg",
      );
    }

    const parsedResolution = parseInt(resolution, 10);
    const parsedDelay = parseInt(delay, 10);

    const gifData = await createPetpetGif(
      image,
      parsedResolution,
      parsedDelay,
      backgroundColor,
    );
    const base64GifData = Buffer.from(gifData).toString("base64");

    res.render("petpet_form", {
      user: req.user,
      gifData: base64GifData,
      errorMessage: null,
    });
  } catch (err) {
    console.error(err);
    res.render("petpet_form", {
      user: req.user,
      gifData: null,
      errorMessage: err.message,
    });
  }
});

// /utility/wanted
app.get("/utility/wanted", async (req, res) => {
  try {
    const { image } = req.query;

    if (!image) {
      return res.render("wanted_form", {
        user: req.user,
        imageData: null,
        errorMessage: null,
      });
    }

    if (!image || (!image.endsWith(".png") && !image.endsWith(".jpg"))) {
      throw new Error(
        "Valid image URL required. It must end with .png or .jpg",
      );
    }

    const buffer = await createWantedImage(image);
    const base64ImageData = buffer.toString("base64");

    res.render("wanted_form", {
      user: req.user,
      imageData: base64ImageData,
      errorMessage: null,
    });
  } catch (error) {
    console.error(error);
    res.render("wanted_form", {
      user: req.user,
      imageData: null,
      errorMessage: error.message,
    });
  }
});

// /utility/country
app.get("/utility/country", async (req, res) => {
  try {
    const { country } = req.query;

    if (!country) {
      return res.render("country_form", {
        user: req.user,
        countryData: null,
        errorMessage: null,
      });
    }

    const countryLower = country.toLowerCase();
    const check1 = data.find((c) => c.country.toLowerCase() === countryLower);
    const check2 = data2.find((c) => c.country.toLowerCase() === countryLower);

    const continents = {
      as: "🌏 Asia",
      eu: "🌍 Europe",
      af: "🌍 Africa",
      na: "🌎 North America",
      sa: "🌎 South America",
      oc: "🌏 Oceania",
      an: "🌎 Antarctica",
    };

    if (check1) {
      res.render("country_form", {
        user: req.user,
        countryData: check1,
        continents: continents,
        errorMessage: null,
      });
    } else if (check2) {
      res.render("country_form", {
        user: req.user,
        countryData: data.find(
          (c) => c.country.toLowerCase() === check2.name.toLowerCase(),
        ),
        continents: continents,
        errorMessage: null,
      });
    } else {
      throw new Error("Country not found.");
    }
  } catch (error) {
    console.error(error);
    res.render("country_form", {
      user: req.user,
      countryData: null,
      errorMessage: error.message,
    });
  }
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

//token reset job
require("./cronJob");