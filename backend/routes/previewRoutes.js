const express = require("express");
const router = express.Router();
const { savePreview, getAllPreviews,getPreviewById, } = require("../controllers/previewController");

router.post("/", savePreview);   // Save preview data
router.get("/", getAllPreviews); // Get all previews
router.get("/:id", getPreviewById);

module.exports = router;
