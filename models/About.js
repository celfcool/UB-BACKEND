const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema({
  title: String,
  descriptionShort: String,
  descriptionFull: String,
});

module.exports = mongoose.model("About", aboutSchema);
