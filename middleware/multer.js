const multer = require("multer");

// Disk storage (streaming → low memory usage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, "uploads/images");
    } else {
      cb(null, "uploads/docs");
    }
  },
  filename: (req, file, cb) => {
    const name = file.originalname.split(" ").join("_");
    cb(null, `${name}`);
  }
});

// File filter (security)
const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "video/mp4",
    "application/pdf"
  ];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Unsupported file type"), false);
  }
  cb(null, true);
};

module.exports = multer({
  storage,
//   fileFilter,
});
