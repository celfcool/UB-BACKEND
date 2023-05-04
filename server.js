const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const Hero = require("./models/Hero");
const About = require("./models/About");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(`${process.env.MONGODB_URI}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Database connected");
});

// HERO //
app.get("/hero", async (req, res) => {
  try {
    const hero = await Hero.findOne();
    if (!hero) {
      res.status(404).send("Data not found");
    } else {
      res.json({ title: hero.title, subtitle: hero.subtitle });
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put("/hero", async (req, res) => {
  try {
    const data = await Hero.findOneAndUpdate(
      {},
      { title: req.body.title, subtitle: req.body.subtitle },
      { new: true, upsert: true }
    );
    res.json({ title: data.title, subtitle: data.subtitle });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ABOUT //
app.get("/about", async (req, res) => {
  try {
    const about = await About.findOne();
    if (!about) {
      res.status(404).send("Data not found");
    } else {
      res.json({
        title: about.title,
        descriptionShort: about.descriptionShort,
        descriptionFull: about.descriptionFull,
      });
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put("/about", async (req, res) => {
  try {
    const data = await About.findOneAndUpdate(
      {},
      {
        title: req.body.title,
        descriptionShort: req.body.descriptionShort,
        descriptionFull: req.body.descriptionFull,
      },
      { new: true, upsert: true }
    );
    res.json({
      title: data.title,
      descriptionShort: data.descriptionShort,
      descriptionFull: data.descriptionFull,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
