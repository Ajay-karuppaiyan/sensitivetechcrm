const express = require("express");
const router = express.Router();
const { savePreview, getAllPreviews,getPreviewById,deletePreview, } = require("../controllers/previewController");

router.post("/", savePreview);
router.get("/", getAllPreviews); 
router.get("/:id", getPreviewById);
router.delete("/:id", deletePreview);

module.exports = router;
