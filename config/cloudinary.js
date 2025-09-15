// config/cloudinary.js
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
 cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // ✅ correct key
  api_key: process.env.CLOUDINARY_API_KEY,       // ✅ correct key
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
