const multer = require("multer");
const path = require("path");

// Local storage ke liye (temp)
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique file name
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
