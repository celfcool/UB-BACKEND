const express = require("express");
const cors = require("cors");
require("dotenv").config();
const multer = require("multer");
const mongoose = require("mongoose");
const Hero = require("./models/Hero");
const About = require("./models/About");
const Image = require("./models/Image");

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

// Set up multer middleware for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
});

// TEST //
app.get("/test", async (req, res) => {
  try {
    res.json({ title: "hero.title", subtitle: "hero.subtitle" });
  } catch (err) {
    res.status(500).send(err.message);
  }
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

// IMAGES //
// Define an array of allowed filenames
const allowedFilenames = ["hero-img.png", "hero-img.jpg", "image3.jpg"];
app.post("/images", upload.single("image"), async (req, res) => {
  try {
    // Get the file name and content type from the request object
    const { originalname, mimetype, buffer } = req.file;

    // Check if the filename is allowed
    if (!allowedFilenames.includes(originalname)) {
      throw new Error("Filename not allowed");
    }

    // Create a new image document
    const image = new Image({
      filename: originalname,
      contentType: mimetype,
      data: buffer,
    });

    // Save the image document to the database
    await image.save();

    // Send a response indicating success
    res.status(201).send("Image uploaded successfully");
  } catch (error) {
    // Handle any errors that occurred during the upload
    console.error(error);
    res.status(500).send("An error occurred while uploading the image");
  }
});

// Route for getting an image by filename
app.get("/images/:filename", async (req, res) => {
  try {
    // Find the image document by filename
    const image = await Image.findOne({ filename: req.params.filename });

    // If the image is not found, return a 404 error
    if (!image) {
      return res.status(404).send("Image not found");
    }

    // Set the response headers to indicate the content type
    res.set("Content-Type", image.contentType);

    // Send the image data
    res.send(image.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while retrieving the image");
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
