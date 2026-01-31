const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const uploadRoutes = require("./routes/upload");
const uploadOptimizedRoutes = require("./routes/uploadOptimize");

const serveIndex = require('serve-index');
const path = require('path');
const port = 3000;

const app = express();

// Security headers
app.use(helmet({
    contentSecurityPolicy: false,
}));

// Gzip compression
app.use(compression());

// Rate limit uploads
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use("/upload", uploadRoutes);
app.use("/upload_optimized", uploadOptimizedRoutes);


// Serve files
const uploadsPath = path.join(__dirname, 'uploads');
app.use("/files", express.static(uploadsPath));

// Enable directory listing
app.use(
    '/files',
    serveIndex(uploadsPath, {
        icons: true,     // show folder/file icons
        view: 'details'  // details | tiles | list
    })
);


// Global error handler
app.use((err, req, res, next) => {
    res.status(400).json({
        error: err.message || "Upload failed"
    });
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
