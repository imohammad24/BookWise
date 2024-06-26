const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

// Use the absolute path to the images directory
const imagesPath = "C:/Users/moham/OneDrive/Desktop/study/software_project/TABP/src/TABP.Infrastructure/images";

console.log("imagesPath:", imagesPath); // Log the images path

// Verify that the images directory exists
fs.access(imagesPath, fs.constants.R_OK, (err) => {
  if (err) {
    console.error("Cannot access images directory:", err);
  } else {
    console.log("Images directory is accessible");
    fs.readdir(imagesPath, (err, files) => {
      if (err) {
        console.error("Unable to read the directory:", err);
      } else {
        console.log("Files in imagesPath:", files);
      }
    });
  }
});

// Serve images from the specified directory
app.use("/images", express.static(imagesPath));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
