const express = require("express");
const sharp = require("sharp");
const upload = require("../middleware/multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();


// Upload multiple files
router.post(
    "/",
    upload.array("files"),
    async (req, res, next) => {
        console.log(`uploaded ${req.files[0].filename}`);
        try {
            // console.log(req.files);
            // Optimize images
            for (const file of req.files) {
                if (file.mimetype.startsWith("image")) {
                    const optimizedPath = file.path.replace(
                        path.extname(file.path),
                        ".webp"
                    );

                    await sharp(file.path)
                        .resize(1920, null, { withoutEnlargement: true })
                        .webp({ quality: 80 })
                        .toFile(optimizedPath);

                    fs.unlinkSync(file.path); // remove original
                }
            }

            res.status(201).json({
                message: "Files uploaded successfully",
                files: req.files.map(f => ({
                    name: f.filename,
                    type: f.mimetype,
                    size: f.size
                }))
            });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;
