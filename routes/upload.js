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
