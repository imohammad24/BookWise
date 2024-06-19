const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

// Serve images from the specified directory
const imagesPath = path.join(
  __dirname,
  "../../../../SoftwareProject/TABP/src/TABP.Infrastructure/images"
);
app.use("/images", express.static(imagesPath));

console.log("__dirname:", __dirname); // Log the current directory of the script
console.log("imagesPath:", imagesPath); // Log the joined images path

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
